import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.api.v1.leads import ensure_property_in_agency
from app.api.v1.properties import ensure_agent_in_agency
from app.core.db import get_db
from app.models import Activity, Deal, DealEvent, Lead, Property, User
from app.permissions.roles import Role
from app.schemas.deal import DealCreate, DealDetailOut, DealOut, DealPage, DealStage, DealStageChange, DealUpdate

router = APIRouter(prefix="/deals")

CLOSED_STAGES = ("closed_won", "closed_lost")


def load_deal_query():
    return select(Deal).options(
        selectinload(Deal.property).selectinload(Property.media),
        selectinload(Deal.lead).selectinload(Lead.contact),
        selectinload(Deal.buyer_contact),
        selectinload(Deal.agent),
    )


def load_deal(db: Session, deal_id: uuid.UUID, user: User) -> Deal:
    deal = db.scalar(load_deal_query().where(Deal.id == deal_id, Deal.agency_id == user.agency_id))
    if deal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Deal not found")
    if user.role != Role.ADMIN.value and deal.agent_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    return deal


def build_deal_detail(db: Session, deal: Deal) -> DealDetailOut:
    events = db.scalars(
        select(DealEvent)
        .options(selectinload(DealEvent.user))
        .where(DealEvent.deal_id == deal.id)
        .order_by(DealEvent.created_at.asc(), DealEvent.id)
    ).all()
    return DealDetailOut.model_validate({
        **{col.name: getattr(deal, col.name) for col in Deal.__table__.columns},
        "property": deal.property,
        "lead": deal.lead,
        "buyer_contact": deal.buyer_contact,
        "agent": deal.agent,
        "events": events,
    })


def ensure_no_conflicting_closed_won(
    db: Session, agency_id: uuid.UUID, property_id: uuid.UUID, exclude_deal_id: uuid.UUID | None = None
) -> None:
    query = select(Deal.id).where(
        Deal.agency_id == agency_id,
        Deal.property_id == property_id,
        Deal.stage == "closed_won",
    )
    if exclude_deal_id is not None:
        query = query.where(Deal.id != exclude_deal_id)
    if db.scalar(query.limit(1)) is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "This property already has a confirmed closed-won deal",
        )


def sync_lead_and_property_on_stage(db: Session, deal: Deal, actor: User) -> None:
    lead = db.get(Lead, deal.lead_id)
    if lead is None:
        return
    if deal.stage == "closed_won" and lead.stage != "converted":
        old = lead.stage
        lead.stage = "converted"
        db.add(Activity(
            agency_id=deal.agency_id,
            related_type="lead",
            related_id=lead.id,
            user_id=actor.id,
            activity_type="stage_change",
            body=f"{old} -> converted",
        ))
    elif deal.stage not in CLOSED_STAGES and lead.stage in ("new", "contacted", "qualified", "visit_scheduled"):
        old = lead.stage
        lead.stage = "negotiation"
        db.add(Activity(
            agency_id=deal.agency_id,
            related_type="lead",
            related_id=lead.id,
            user_id=actor.id,
            activity_type="stage_change",
            body=f"{old} -> negotiation",
        ))


@router.get("", response_model=DealPage)
def list_deals(
    stage: DealStage | None = None,
    property_id: uuid.UUID | None = None,
    lead_id: uuid.UUID | None = None,
    agent_id: uuid.UUID | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealPage:
    base_filters = [Deal.agency_id == user.agency_id]
    if user.role != Role.ADMIN.value:
        base_filters.append(Deal.agent_id == user.id)
    elif agent_id is not None:
        base_filters.append(Deal.agent_id == agent_id)

    if property_id is not None:
        base_filters.append(Deal.property_id == property_id)
    if lead_id is not None:
        base_filters.append(Deal.lead_id == lead_id)

    all_deals = list(
        db.scalars(load_deal_query().where(*base_filters).order_by(Deal.created_at.desc(), Deal.id)).all()
    )

    open_deals = [d for d in all_deals if d.stage not in CLOSED_STAGES]
    closed_won_count = sum(1 for d in all_deals if d.stage == "closed_won")
    pipeline_value = sum(
        ((d.agreed_amount or d.offer_amount or Decimal("0")) for d in open_deals),
        Decimal("0"),
    )

    filtered = [d for d in all_deals if stage is None or d.stage == stage]
    items = [DealOut.model_validate(d) for d in filtered]
    return DealPage(
        items=items,
        total=len(all_deals),
        open_count=len(open_deals),
        closed_won_count=closed_won_count,
        pipeline_value=pipeline_value,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=DealDetailOut)
def create_deal(
    payload: DealCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealDetailOut:
    lead = db.scalar(select(Lead).where(Lead.id == payload.lead_id, Lead.agency_id == user.agency_id))
    if lead is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Lead does not belong to your agency")

    if user.role != Role.ADMIN.value and lead.assigned_agent_id not in (None, user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only create deals for your own leads")

    property_id = payload.property_id or lead.property_id
    if property_id is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "A property is required to create a deal")
    prop = ensure_property_in_agency(db, property_id, user.agency_id)

    if user.role != Role.ADMIN.value:
        if payload.agent_id is not None and payload.agent_id != user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Agents can only assign deals to themselves")
        agent_id = user.id
    else:
        agent_id = payload.agent_id or lead.assigned_agent_id or prop.assigned_agent_id or user.id
        ensure_agent_in_agency(db, agent_id, user.agency_id)

    if payload.stage == "closed_won":
        ensure_no_conflicting_closed_won(db, user.agency_id, prop.id)

    deal = Deal(
        agency_id=user.agency_id,
        property_id=prop.id,
        lead_id=lead.id,
        buyer_contact_id=lead.contact_id,
        agent_id=agent_id,
        stage=payload.stage,
        offer_amount=payload.offer_amount,
        agreed_amount=payload.agreed_amount,
        expected_close_date=payload.expected_close_date,
        notes=payload.notes,
    )
    db.add(deal)
    db.flush()

    db.add(DealEvent(
        deal_id=deal.id,
        old_stage=None,
        new_stage=deal.stage,
        changed_by=user.id,
        created_at=datetime.now(timezone.utc),
    ))
    sync_lead_and_property_on_stage(db, deal, user)
    db.add(Activity(
        agency_id=user.agency_id,
        related_type="lead",
        related_id=lead.id,
        user_id=user.id,
        activity_type="note",
        body=f"Deal created for {prop.title} ({deal.stage})",
    ))

    db.commit()
    return build_deal_detail(db, load_deal(db, deal.id, user))


@router.get("/{deal_id}", response_model=DealDetailOut)
def get_deal(
    deal_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealDetailOut:
    return build_deal_detail(db, load_deal(db, deal_id, user))


@router.patch("/{deal_id}", response_model=DealDetailOut)
def update_deal(
    deal_id: uuid.UUID,
    payload: DealUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealDetailOut:
    deal = load_deal(db, deal_id, user)
    changes = payload.model_dump(exclude_unset=True)

    if "agent_id" in changes and changes["agent_id"] != deal.agent_id:
        if user.role != Role.ADMIN.value:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only an administrator can reassign deals")
        ensure_agent_in_agency(db, changes["agent_id"], user.agency_id)

    if changes.get("stage") == "closed_won" and deal.stage != "closed_won":
        ensure_no_conflicting_closed_won(db, user.agency_id, deal.property_id, exclude_deal_id=deal.id)

    old_stage = deal.stage
    for field, value in changes.items():
        setattr(deal, field, value)

    if "stage" in changes and deal.stage != old_stage:
        db.add(DealEvent(
            deal_id=deal.id,
            old_stage=old_stage,
            new_stage=deal.stage,
            changed_by=user.id,
            created_at=datetime.now(timezone.utc),
        ))
        sync_lead_and_property_on_stage(db, deal, user)

    db.commit()
    return build_deal_detail(db, load_deal(db, deal.id, user))


@router.post("/{deal_id}/stage", response_model=DealDetailOut)
def change_deal_stage(
    deal_id: uuid.UUID,
    payload: DealStageChange,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealDetailOut:
    deal = load_deal(db, deal_id, user)
    if payload.stage == "closed_won" and deal.stage != "closed_won":
        ensure_no_conflicting_closed_won(db, user.agency_id, deal.property_id, exclude_deal_id=deal.id)

    old_stage = deal.stage
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(deal, field, value)

    if deal.stage != old_stage:
        db.add(DealEvent(
            deal_id=deal.id,
            old_stage=old_stage,
            new_stage=deal.stage,
            changed_by=user.id,
            created_at=datetime.now(timezone.utc),
        ))
        sync_lead_and_property_on_stage(db, deal, user)

    db.commit()
    return build_deal_detail(db, load_deal(db, deal.id, user))
