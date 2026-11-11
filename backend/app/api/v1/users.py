from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import User
from app.schemas.auth import AgencyMember

router = APIRouter(prefix="/users")


@router.get("", response_model=list[AgencyMember])
def list_agency_members(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[User]:
    return db.scalars(select(User).where(User.agency_id == user.agency_id, User.is_active.is_(True))
                      .order_by(User.full_name)).all()
