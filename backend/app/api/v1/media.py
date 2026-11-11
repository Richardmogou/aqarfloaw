from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_optional_user
from app.core.db import get_db
from app.models import PropertyMedia, User
from app.services.media import content_type_for, load_image
from app.services.storage import StoredObjectMissing

router = APIRouter(prefix="/media")


@router.get("/{storage_key:path}")
def get_media(storage_key: str, user: User | None = Depends(get_optional_user), db: Session = Depends(get_db)) -> Response:
    media = db.scalar(select(PropertyMedia).options(joinedload(PropertyMedia.property))
                      .where(PropertyMedia.storage_key == storage_key))
    if media is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
    prop = media.property
    is_public = prop.is_published and prop.deleted_at is None
    # Photos of drafts and deleted listings stay visible to their own agency only; 404 hides that they exist.
    if not is_public and (user is None or user.agency_id != prop.agency_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
    try:
        content = load_image(storage_key)
    except StoredObjectMissing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
    cache = "public, max-age=3600" if is_public else "private, max-age=300"
    return Response(content, media_type=content_type_for(storage_key),
                    headers={"Cache-Control": cache, "X-Content-Type-Options": "nosniff"})
