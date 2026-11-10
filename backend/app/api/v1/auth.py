from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.api.deps import get_current_session, get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.core.security import (DUMMY_PASSWORD_HASH, hash_session_token,
                               new_session_token, verify_password)
from app.models import AuthSession, User
from app.schemas.auth import CurrentUser, LoginRequest

router = APIRouter(prefix="/auth")


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(settings.session_cookie_name, path="/", httponly=True,
                           secure=settings.cookie_secure, samesite="lax")


@router.post("/login", status_code=status.HTTP_204_NO_CONTENT)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> None:
    user = db.scalar(select(User).where(User.email == payload.email))
    password_ok = verify_password(payload.password, user.password_hash if user else DUMMY_PASSWORD_HASH)
    if user is None or not password_ok or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    token = new_session_token()
    ttl = timedelta(days=settings.session_ttl_days)
    db.add(AuthSession(user_id=user.id, token_hash=hash_session_token(token),
                       expires_at=datetime.now(timezone.utc) + ttl))
    db.commit()
    response.set_cookie(settings.session_cookie_name, token, max_age=int(ttl.total_seconds()), path="/",
                        httponly=True, secure=settings.cookie_secure, samesite="lax")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, auth_session: AuthSession = Depends(get_current_session),
           db: Session = Depends(get_db)) -> None:
    auth_session.revoked_at = datetime.now(timezone.utc)
    db.commit()
    _clear_session_cookie(response)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(response: Response, user: User = Depends(get_current_user),
               db: Session = Depends(get_db)) -> None:
    db.execute(update(AuthSession)
               .where(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None))
               .values(revoked_at=datetime.now(timezone.utc)))
    db.commit()
    _clear_session_cookie(response)


@router.get("/me", response_model=CurrentUser)
def me(user: User = Depends(get_current_user)) -> User:
    return user
