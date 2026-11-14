import uuid
from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.api.v1.leads import ensure_property_in_agency
from app.api.v1.properties import ensure_agent_in_agency
from app.core.db import get_db
from app.models import Activity, Lead, Property, User, Visit
from app.permissions.roles import Role
from app.schemas.visit import VisitComplete, VisitCreate, VisitOut, VisitPage, VisitStatus, VisitUpdate

router = APIRouter(prefix="/visits")

UPCOMING_STATUSES = ("requested", "confirmed")
CANCELLED_STATUSES = ("cancelled", "no_show")


def load_visit_query():
    return select(Visit).options(
        selectinload(Visit.property).selectinload(Property.media),
        selectinload(Visit.lead).selectinload(Lead.contact),
        selectinload(Visit.agent),
    )


def load_visit(db: Session, visit_id: uuid.UUID, user: User) -> Visit:
    visit = db.scalar(load_visit_query().where(Visit.id == visit_id, Visit.agency_id == user.agency_id))
    if visit is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visit not found")
    if user.role != Role.ADMIN.value and visit.agent_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    return visit


def compute_conflict_map(visits: list[Visit]) -> dict[uuid.UUID, list[uuid.UUID]]:
    active = [v for v in visits if v.status in UPCOMING_STATUSES]
    conflicts: dict[uuid.UUID, list[uuid.UUID]] = {v.id: [] for v in visits}
    for i, a in enumerate(active):
        for b in active[i + 1:]:
            if a.agent_id != b.agent_id:
                continue
            if a.starts_at < b.ends_at and b.starts_at < a.ends_at:
                conflicts[a.id].append(b.id)
                conflicts[b.id].append(a.id)
    return conflicts


def serialize_visit(visit: Visit, conflict_ids: list[uuid.UUID]) -> VisitOut:
    out = VisitOut.model_validate(visit)
    out.has_conflict = len(conflict_ids) > 0
    out.conflicting_visit_ids = conflict_ids
    return out


def conflict_ids_for_visit(db: Session, visit: Visit) -> list[uuid.UUID]:
    if visit.status not in UPCOMING_STATUSES:
        return []
    overlapping = db.scalars(
        select(Visit.id).where(
            Visit.agency_id == visit.agency_id,
            Visit.agent_id == visit.agent_id,
            Visit.id != visit.id,
            Visit.status.in_(UPCOMING_STATUSES),
            Visit.starts_at < visit.ends_at,
            Visit.ends_at > visit.starts_at,
        )
    ).all()
    return list(overlapping)


@router.get("", response_model=VisitPage)
def list_visits(
    status_filter: VisitStatus | None = None,
    group: Literal["all", "upcoming", "done", "cancelled"] = "all",
    agent_id: uuid.UUID | None = None,
    property_id: uuid.UUID | None = None,
    lead_id: uuid.UUID | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitPage:
    base_filters = [Visit.agency_id == user.agency_id]
    if user.role != Role.ADMIN.value:
        base_filters.append(Visit.agent_id == user.id)
    elif agent_id is not None:
        base_filters.append(Visit.agent_id == agent_id)

    if property_id is not None:
        base_filters.append(Visit.property_id == property_id)
    if lead_id is not None:
        base_filters.append(Visit.lead_id == lead_id)

    all_visits = list(
        db.scalars(load_visit_query().where(*base_filters).order_by(Visit.starts_at.asc(), Visit.id)).all()
    )
    conflict_map = compute_conflict_map(all_visits)

    upcoming_count = sum(1 for v in all_visits if v.status in UPCOMING_STATUSES)
    completed_count = sum(1 for v in all_visits if v.status == "completed")
    cancelled_count = sum(1 for v in all_visits if v.status in CANCELLED_STATUSES)
    conflict_count = sum(1 for v in all_visits if conflict_map.get(v.id))

    filtered = all_visits
    if status_filter is not None:
        filtered = [v for v in filtered if v.status == status_filter]
    elif group == "upcoming":
        filtered = [v for v in filtered if v.status in UPCOMING_STATUSES]
    elif group == "done":
        filtered = [v for v in filtered if v.status == "completed"]
    elif group == "cancelled":
        filtered = [v for v in filtered if v.status in CANCELLED_STATUSES]

    items = [serialize_visit(v, conflict_map.get(v.id, [])) for v in filtered]
    return VisitPage(
        items=items,
        total=len(all_visits),
        upcoming_count=upcoming_count,
        completed_count=completed_count,
        cancelled_count=cancelled_count,
        conflict_count=conflict_count,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=VisitOut)
def create_visit(
    payload: VisitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    prop = ensure_property_in_agency(db, payload.property_id, user.agency_id)
    lead = db.scalar(select(Lead).where(Lead.id == payload.lead_id, Lead.agency_id == user.agency_id))
    if lead is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Lead does not belong to your agency")

    if user.role != Role.ADMIN.value:
        if lead.assigned_agent_id not in (None, user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only schedule visits for your own leads")
        if payload.agent_id is not None and payload.agent_id != user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Agents can only schedule visits for themselves")
        agent_id = user.id
    else:
        agent_id = payload.agent_id or lead.assigned_agent_id or prop.assigned_agent_id or user.id
        ensure_agent_in_agency(db, agent_id, user.agency_id)

    visit = Visit(
        agency_id=user.agency_id,
        property_id=prop.id,
        lead_id=lead.id,
        agent_id=agent_id,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        status=payload.status,
        meeting_point=payload.meeting_point,
        notes=payload.notes,
    )
    db.add(visit)

    if lead.stage in ("new", "contacted", "qualified"):
        old_stage = lead.stage
        lead.stage = "visit_scheduled"
        db.add(Activity(
            agency_id=user.agency_id,
            related_type="lead",
            related_id=lead.id,
            user_id=user.id,
            activity_type="stage_change",
            body=f"{old_stage} -> visit_scheduled",
        ))

    db.add(Activity(
        agency_id=user.agency_id,
        related_type="lead",
        related_id=lead.id,
        user_id=user.id,
        activity_type="note",
        body=f"Visit scheduled for {prop.title} ({payload.starts_at.strftime('%Y-%m-%d %H:%M UTC')})",
    ))

    db.commit()
    loaded = load_visit(db, visit.id, user)
    return serialize_visit(loaded, conflict_ids_for_visit(db, loaded))


@router.get("/{visit_id}", response_model=VisitOut)
def get_visit(
    visit_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    visit = load_visit(db, visit_id, user)
    return serialize_visit(visit, conflict_ids_for_visit(db, visit))


@router.patch("/{visit_id}", response_model=VisitOut)
def update_visit(
    visit_id: uuid.UUID,
    payload: VisitUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    visit = load_visit(db, visit_id, user)
    changes = payload.model_dump(exclude_unset=True)

    if "agent_id" in changes and changes["agent_id"] != visit.agent_id:
        if user.role != Role.ADMIN.value:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only an administrator can reassign visits")
        ensure_agent_in_agency(db, changes["agent_id"], user.agency_id)

    current_duration = max(15, int(round((visit.ends_at - visit.starts_at).total_seconds() / 60)))
    duration = changes.pop("duration_minutes", None)
    new_starts = changes.get("starts_at", visit.starts_at)
    if "ends_at" in changes and changes["ends_at"] is not None:
        new_ends = changes["ends_at"]
    elif duration is not None or "starts_at" in changes:
        new_ends = new_starts + timedelta(minutes=duration or current_duration)
        changes["ends_at"] = new_ends
    else:
        new_ends = visit.ends_at

    if new_ends <= new_starts:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "ends_at must be after starts_at")

    old_status = visit.status
    for field, value in changes.items():
        setattr(visit, field, value)

    if "status" in changes and visit.status != old_status:
        detail = f"Visit status updated: {old_status} -> {visit.status}"
        if visit.outcome:
            detail = f"{detail} ({visit.outcome})"
        db.add(Activity(
            agency_id=user.agency_id,
            related_type="lead",
            related_id=visit.lead_id,
            user_id=user.id,
            activity_type="note",
            body=detail,
        ))

    db.commit()
    loaded = load_visit(db, visit.id, user)
    return serialize_visit(loaded, conflict_ids_for_visit(db, loaded))


@router.post("/{visit_id}/complete", response_model=VisitOut)
def complete_visit(
    visit_id: uuid.UUID,
    payload: VisitComplete,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    visit = load_visit(db, visit_id, user)
    visit.status = payload.status
    if payload.outcome is not None:
        visit.outcome = payload.outcome

    body = payload.outcome or f"Visit marked as {payload.status}"
    db.add(Activity(
        agency_id=user.agency_id,
        related_type="lead",
        related_id=visit.lead_id,
        user_id=user.id,
        activity_type="note",
        body=body,
    ))
    db.commit()
    loaded = load_visit(db, visit.id, user)
    return serialize_visit(loaded, conflict_ids_for_visit(db, loaded))
