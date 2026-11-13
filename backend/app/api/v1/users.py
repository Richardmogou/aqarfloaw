import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.db import get_db
from app.core.security import hash_password
from app.models import AuthSession, Deal, Lead, Property, User, Visit
from app.permissions.roles import Role
from app.schemas.auth import AgencyMember, MemberCreate, MemberUpdate, TeamMemberOut

router = APIRouter(prefix="/users")
admin_only = require_role(Role.ADMIN)

UPCOMING_VISIT_STATUSES = ("requested", "confirmed")
CLOSED_DEAL_STAGES = ("closed_won", "closed_lost")


def member_workload(db: Session, member: User) -> TeamMemberOut:
    properties_count = db.scalar(select(func.count()).select_from(Property).where(
        Property.agency_id == member.agency_id,
        Property.assigned_agent_id == member.id,
        Property.deleted_at.is_(None),
    ))
    leads_count = db.scalar(select(func.count()).select_from(Lead).where(
        Lead.agency_id == member.agency_id,
        Lead.assigned_agent_id == member.id,
    ))
    upcoming_visits_count = db.scalar(select(func.count()).select_from(Visit).where(
        Visit.agency_id == member.agency_id,
        Visit.agent_id == member.id,
        Visit.status.in_(UPCOMING_VISIT_STATUSES),
    ))
    open_deals_count = db.scalar(select(func.count()).select_from(Deal).where(
        Deal.agency_id == member.agency_id,
        Deal.agent_id == member.id,
        Deal.stage.not_in(CLOSED_DEAL_STAGES),
    ))
    return TeamMemberOut(
        id=member.id,
        full_name=member.full_name,
        phone=member.phone,
        role=member.role,
        is_active=member.is_active,
        properties_count=properties_count,
        leads_count=leads_count,
        upcoming_visits_count=upcoming_visits_count,
        open_deals_count=open_deals_count,
    )


@router.get("", response_model=list[AgencyMember])
def list_agency_members(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[User]:
    return db.scalars(select(User).where(User.agency_id == user.agency_id, User.is_active.is_(True))
                      .order_by(User.full_name)).all()


@router.get("/team", response_model=list[TeamMemberOut])
def list_team_workload(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[TeamMemberOut]:
    filters = [User.agency_id == user.agency_id]
    if user.role != Role.ADMIN.value:
        filters.append(User.is_active.is_(True))
    members = db.scalars(select(User).where(*filters).order_by(User.is_active.desc(), User.full_name)).all()
    return [member_workload(db, member) for member in members]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TeamMemberOut)
def create_member(
    payload: MemberCreate,
    user: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> TeamMemberOut:
    member = User(
        agency_id=user.agency_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(member)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A user with this email already exists")
    db.refresh(member)
    return member_workload(db, member)


@router.patch("/{member_id}", response_model=TeamMemberOut)
def update_member(
    member_id: uuid.UUID,
    payload: MemberUpdate,
    user: User = Depends(admin_only),
    db: Session = Depends(get_db),
) -> TeamMemberOut:
    member = db.scalar(select(User).where(User.id == member_id, User.agency_id == user.agency_id))
    if member is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    changes = payload.model_dump(exclude_unset=True)
    if member.id == user.id and (changes.get("is_active") is False or changes.get("role") == Role.AGENT.value):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "You cannot deactivate or demote your own account")
    for field, value in changes.items():
        setattr(member, field, value)
    if changes.get("is_active") is False:
        db.query(AuthSession).filter(
            AuthSession.user_id == member.id,
            AuthSession.revoked_at.is_(None),
        ).update({AuthSession.revoked_at: datetime.now(timezone.utc)})
    db.commit()
    db.refresh(member)
    return member_workload(db, member)
