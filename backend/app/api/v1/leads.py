import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user, require_role
from app.api.v1.properties import ensure_agent_in_agency
from app.core.db import get_db
from app.models import Activity, Contact, Lead, Property, User
from app.permissions.roles import Role
from app.schemas.lead import (ActivityCreate, ActivityOut, LeadAssign, LeadCreate, LeadDetailOut, LeadOut, LeadPage,
                              LeadSort, LeadSource, LeadStage, LeadUpdate)
from app.services.phone import normalize_phone

router = APIRouter(prefix="/leads")
admin_only = require_role(Role.ADMIN)

SORT_ORDERS = {
    "newest": Lead.created_at.desc(),
    "oldest": Lead.created_at.asc(),
}


def ensure_property_in_agency(db: Session, property_id: uuid.UUID | None, agency_id: uuid.UUID) -> Property | None:
    if property_id is None:
        return None
    prop = db.scalar(select(Property).where(Property.id == property_id, Property.agency_id == agency_id,
                                            Property.deleted_at.is_(None)))
    if prop is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Property does not belong to your agency")
    return prop


def load_lead(db: Session, lead_id: uuid.UUID, user: User) -> Lead:
    lead = db.scalar(
        select(Lead)
        .options(
            selectinload(Lead.contact),
            selectinload(Lead.property).selectinload(Property.media),
        )
        .where(Lead.id == lead_id, Lead.agency_id == user.agency_id)
    )
    if lead is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lead not found")
    if user.role != Role.ADMIN.value and lead.assigned_agent_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    return lead


def build_lead_detail(db: Session, lead: Lead) -> dict:
    activities = db.scalars(
        select(Activity)
        .options(selectinload(Activity.user))
        .where(
            Activity.agency_id == lead.agency_id,
            Activity.related_type == "lead",
            Activity.related_id == lead.id,
        )
        .order_by(Activity.occurred_at.desc(), Activity.id)
    ).all()
    return {
        **{col.name: getattr(lead, col.name) for col in Lead.__table__.columns},
        "contact": lead.contact,
        "property": lead.property,
        "activities": activities,
    }


def record_assignment_activity(db: Session, lead: Lead, actor: User, agent_id: uuid.UUID | None) -> None:
    agent = db.get(User, agent_id) if agent_id else None
    db.add(Activity(
        agency_id=lead.agency_id,
        related_type="lead",
        related_id=lead.id,
        user_id=actor.id,
        activity_type="assignment",
        body=agent.full_name if agent else "Unassigned",
    ))


@router.get("", response_model=LeadPage)
def list_leads(
    q: Annotated[str | None, Query(max_length=100)] = None,
    stage: LeadStage | None = None,
    source: LeadSource | None = None,
    property_id: uuid.UUID | None = None,
    assigned_agent_id: uuid.UUID | None = None,
    unassigned: bool | None = None,
    sort: LeadSort = "newest",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeadPage:
    filters = [Lead.agency_id == user.agency_id]
    if user.role != Role.ADMIN.value:
        filters.append(Lead.assigned_agent_id == user.id)
    else:
        if unassigned is True:
            filters.append(Lead.assigned_agent_id.is_(None))
        elif unassigned is False:
            filters.append(Lead.assigned_agent_id.is_not(None))
        if assigned_agent_id is not None:
            filters.append(Lead.assigned_agent_id == assigned_agent_id)

    if stage:
        filters.append(Lead.stage == stage)
    if source:
        filters.append(Lead.source == source)
    if property_id:
        filters.append(Lead.property_id == property_id)
    if q and q.strip():
        term = q.strip()
        filters.append(or_(
            Lead.contact.has(or_(
                Contact.name.icontains(term, autoescape=True),
                Contact.phone.icontains(term, autoescape=True),
                Contact.email.icontains(term, autoescape=True),
            )),
            Lead.preferred_location.icontains(term, autoescape=True),
            Lead.property.has(or_(
                Property.title.icontains(term, autoescape=True),
                Property.reference_code.icontains(term, autoescape=True),
                Property.city.icontains(term, autoescape=True),
            )),
        ))

    total = db.scalar(select(func.count()).select_from(Lead).where(*filters))
    items = db.scalars(
        select(Lead)
        .options(
            selectinload(Lead.contact),
            selectinload(Lead.property).selectinload(Property.media),
        )
        .where(*filters)
        .order_by(SORT_ORDERS[sort], Lead.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return LeadPage(items=items, total=total, page=page, page_size=page_size)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=LeadDetailOut)
def create_lead(
    payload: LeadCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeadDetailOut:
    if user.role != Role.ADMIN.value:
        if payload.assigned_agent_id is not None and payload.assigned_agent_id != user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Agents can only assign leads to themselves")
        assigned_agent_id = user.id
    else:
        ensure_agent_in_agency(db, payload.assigned_agent_id, user.agency_id)
        assigned_agent_id = payload.assigned_agent_id

    ensure_property_in_agency(db, payload.property_id, user.agency_id)
    phone = normalize_phone(payload.phone)
    contact = db.scalar(select(Contact).where(Contact.agency_id == user.agency_id,
                                              Contact.phone_normalized == phone).limit(1))
    if contact is None:
        contact = Contact(
            agency_id=user.agency_id,
            name=payload.name,
            phone=payload.phone,
            phone_normalized=phone,
            email=payload.email,
            contact_type=payload.contact_type,
        )
        db.add(contact)
        db.flush()
    elif contact.email is None and payload.email:
        contact.email = payload.email

    lead = Lead(
        agency_id=user.agency_id,
        contact_id=contact.id,
        property_id=payload.property_id,
        source=payload.source,
        stage=payload.stage,
        message=payload.message,
        budget_min=payload.budget_min,
        budget_max=payload.budget_max,
        preferred_location=payload.preferred_location,
        assigned_agent_id=assigned_agent_id,
        next_follow_up_at=payload.next_follow_up_at,
    )
    db.add(lead)
    db.flush()

    if assigned_agent_id is not None:
        record_assignment_activity(db, lead, user, assigned_agent_id)

    db.commit()
    return build_lead_detail(db, load_lead(db, lead.id, user))


@router.get("/{lead_id}", response_model=LeadDetailOut)
def get_lead(
    lead_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeadDetailOut:
    lead = load_lead(db, lead_id, user)
    return build_lead_detail(db, lead)


@router.patch("/{lead_id}", response_model=LeadDetailOut)
def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeadDetailOut:
    lead = load_lead(db, lead_id, user)
    changes = payload.model_dump(exclude_unset=True)

    if "assigned_agent_id" in changes:
        if user.role != Role.ADMIN.value:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only an administrator can assign leads")
        ensure_agent_in_agency(db, changes["assigned_agent_id"], user.agency_id)

    if "property_id" in changes:
        ensure_property_in_agency(db, changes["property_id"], user.agency_id)

    new_min = changes.get("budget_min", lead.budget_min)
    new_max = changes.get("budget_max", lead.budget_max)
    if new_min is not None and new_max is not None and new_min > new_max:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "budget_max must be at least budget_min")

    old_stage = lead.stage
    old_agent_id = lead.assigned_agent_id

    for field, value in changes.items():
        setattr(lead, field, value)

    if "stage" in changes and lead.stage != old_stage:
        db.add(Activity(
            agency_id=user.agency_id,
            related_type="lead",
            related_id=lead.id,
            user_id=user.id,
            activity_type="stage_change",
            body=f"{old_stage} -> {lead.stage}",
        ))

    if "assigned_agent_id" in changes and lead.assigned_agent_id != old_agent_id:
        record_assignment_activity(db, lead, user, lead.assigned_agent_id)

    db.commit()
    return build_lead_detail(db, load_lead(db, lead.id, user))


@router.post("/{lead_id}/assign", response_model=LeadDetailOut)
def assign_lead(
    lead_id: uuid.UUID,
    payload: LeadAssign,
    user: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> LeadDetailOut:
    lead = load_lead(db, lead_id, user)
    ensure_agent_in_agency(db, payload.assigned_agent_id, user.agency_id)
    if lead.assigned_agent_id != payload.assigned_agent_id:
        lead.assigned_agent_id = payload.assigned_agent_id
        record_assignment_activity(db, lead, user, payload.assigned_agent_id)
        db.commit()
    return build_lead_detail(db, load_lead(db, lead.id, user))


@router.post("/{lead_id}/activities", status_code=status.HTTP_201_CREATED, response_model=ActivityOut)
def create_lead_activity(
    lead_id: uuid.UUID,
    payload: ActivityCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityOut:
    lead = load_lead(db, lead_id, user)
    activity = Activity(
        agency_id=user.agency_id,
        related_type="lead",
        related_id=lead.id,
        user_id=user.id,
        activity_type=payload.activity_type,
        body=payload.body,
    )
    db.add(activity)
    db.commit()
    return db.scalar(select(Activity).options(selectinload(Activity.user)).where(Activity.id == activity.id))
