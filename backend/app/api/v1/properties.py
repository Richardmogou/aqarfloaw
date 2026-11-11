import re
import secrets
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user, require_role
from app.core.db import get_db
from app.models import Agency, Property, PropertyMedia, User
from app.permissions.roles import Role
from app.schemas.property import (UNPUBLISHABLE_STATUSES, MediaOut, MediaUpdate, PropertyCreate, PropertyOut,
                                  PropertyPage, PropertyPurpose, PropertySort, PropertyStatus, PropertyType,
                                  PropertyUpdate)
from app.services.media import (MAX_IMAGE_BYTES, MAX_IMAGES_PER_PROPERTY, ImageTooLarge, InvalidImage,
                                delete_image, read_image, store_image)

router = APIRouter(prefix="/properties")
admin_only = require_role(Role.ADMIN)

SORT_ORDERS = {
    "newest": Property.created_at.desc(),
    "oldest": Property.created_at.asc(),
    "price_asc": Property.price.asc(),
    "price_desc": Property.price.desc(),
}


def make_slug(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:200] or "property"
    return f"{base}-{secrets.token_hex(4)}"


def load_property(db: Session, property_id: uuid.UUID, agency_id: uuid.UUID) -> Property:
    # Another agency's property answers 404, not 403, so IDs cannot be probed across agencies.
    prop = db.scalar(select(Property).options(selectinload(Property.media)).where(
        Property.id == property_id, Property.agency_id == agency_id, Property.deleted_at.is_(None)))
    if prop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Property not found")
    return prop


def ensure_agent_in_agency(db: Session, agent_id: uuid.UUID | None, agency_id: uuid.UUID) -> None:
    if agent_id is None:
        return
    agent = db.scalar(select(User.id).where(User.id == agent_id, User.agency_id == agency_id,
                                            User.is_active.is_(True)))
    if agent is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Assigned agent is not an active member of your agency")


def ensure_publishable(is_published: bool, property_status: str) -> None:
    if is_published and property_status in UNPUBLISHABLE_STATUSES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            f"A property with status '{property_status}' cannot be published")


def sync_published_at(prop: Property, was_published: bool) -> None:
    if prop.is_published and not was_published:
        prop.published_at = datetime.now(timezone.utc)
    elif not prop.is_published:
        prop.published_at = None


def commit_or_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A property with this reference code already exists in your agency")


def find_media(prop: Property, media_id: uuid.UUID) -> PropertyMedia:
    media = next((item for item in prop.media if item.id == media_id), None)
    if media is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
    return media


@router.get("", response_model=PropertyPage)
def list_properties(
    q: Annotated[str | None, Query(max_length=100)] = None,
    purpose: PropertyPurpose | None = None,
    property_type: PropertyType | None = None,
    property_status: Annotated[PropertyStatus | None, Query(alias="status")] = None,
    city: Annotated[str | None, Query(max_length=100)] = None,
    assigned_agent_id: uuid.UUID | None = None,
    is_published: bool | None = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    sort: PropertySort = "newest",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyPage:
    filters = [Property.agency_id == user.agency_id, Property.deleted_at.is_(None)]
    if q and q.strip():
        term = q.strip()
        filters.append(or_(*(column.icontains(term, autoescape=True) for column in
                             (Property.title, Property.reference_code, Property.city, Property.locality))))
    if purpose:
        filters.append(Property.purpose == purpose)
    if property_type:
        filters.append(Property.property_type == property_type)
    if property_status:
        filters.append(Property.status == property_status)
    if city and city.strip():
        filters.append(func.lower(Property.city) == city.strip().lower())
    if assigned_agent_id:
        filters.append(Property.assigned_agent_id == assigned_agent_id)
    if is_published is not None:
        filters.append(Property.is_published.is_(is_published))
    if min_price is not None:
        filters.append(Property.price >= min_price)
    if max_price is not None:
        filters.append(Property.price <= max_price)

    total = db.scalar(select(func.count()).select_from(Property).where(*filters))
    items = db.scalars(select(Property).options(selectinload(Property.media)).where(*filters)
                       .order_by(SORT_ORDERS[sort], Property.id)
                       .offset((page - 1) * page_size).limit(page_size)).all()
    return PropertyPage(items=items, total=total, page=page, page_size=page_size)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=PropertyOut)
def create_property(payload: PropertyCreate, user: User = Depends(admin_only),
                    db: Session = Depends(get_db)) -> Property:
    ensure_agent_in_agency(db, payload.assigned_agent_id, user.agency_id)
    ensure_publishable(payload.is_published, payload.status)
    agency = db.get(Agency, user.agency_id)
    prop = Property(**payload.model_dump(), agency_id=user.agency_id, slug=make_slug(payload.title),
                    currency=agency.default_currency)
    sync_published_at(prop, was_published=False)
    db.add(prop)
    commit_or_conflict(db)
    return load_property(db, prop.id, user.agency_id)


@router.get("/{property_id}", response_model=PropertyOut)
def get_property(property_id: uuid.UUID, user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)) -> Property:
    return load_property(db, property_id, user.agency_id)


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property(property_id: uuid.UUID, payload: PropertyUpdate, user: User = Depends(admin_only),
                    db: Session = Depends(get_db)) -> Property:
    prop = load_property(db, property_id, user.agency_id)
    changes = payload.model_dump(exclude_unset=True)
    if "assigned_agent_id" in changes:
        ensure_agent_in_agency(db, changes["assigned_agent_id"], user.agency_id)
    ensure_publishable(changes.get("is_published", prop.is_published), changes.get("status", prop.status))
    was_published = prop.is_published
    for field, value in changes.items():
        setattr(prop, field, value)
    sync_published_at(prop, was_published)
    commit_or_conflict(db)
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(property_id: uuid.UUID, user: User = Depends(admin_only),
                    db: Session = Depends(get_db)) -> None:
    prop = load_property(db, property_id, user.agency_id)
    prop.deleted_at = datetime.now(timezone.utc)
    prop.is_published = False
    prop.published_at = None
    db.commit()


@router.post("/{property_id}/media", status_code=status.HTTP_201_CREATED, response_model=list[MediaOut])
def upload_media(property_id: uuid.UUID, files: Annotated[list[UploadFile], File()],
                 user: User = Depends(admin_only), db: Session = Depends(get_db)) -> list[PropertyMedia]:
    prop = load_property(db, property_id, user.agency_id)
    if len(prop.media) + len(files) > MAX_IMAGES_PER_PROPERTY:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            f"A property can have at most {MAX_IMAGES_PER_PROPERTY} images")
    images = []
    for upload in files:
        try:
            images.append(read_image(upload.file))
        except ImageTooLarge:
            raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                                f"Each image must be {MAX_IMAGE_BYTES // (1024 * 1024)} MB or less")
        except InvalidImage:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Only JPEG, PNG or WebP images are accepted")

    next_sort_order = max((media.sort_order for media in prop.media), default=-1) + 1
    needs_cover = not any(media.is_cover for media in prop.media)
    created, stored_keys = [], []
    try:
        for index, (content, extension) in enumerate(images):
            storage_key = store_image(prop.id, content, extension)
            stored_keys.append(storage_key)
            media = PropertyMedia(property_id=prop.id, storage_key=storage_key,
                                  sort_order=next_sort_order + index, is_cover=needs_cover and index == 0)
            db.add(media)
            created.append(media)
        db.commit()
    except Exception:
        db.rollback()
        for storage_key in stored_keys:
            delete_image(storage_key)
        raise
    return created


@router.patch("/{property_id}/media/{media_id}", response_model=MediaOut)
def update_media(property_id: uuid.UUID, media_id: uuid.UUID, payload: MediaUpdate,
                 user: User = Depends(admin_only), db: Session = Depends(get_db)) -> PropertyMedia:
    prop = load_property(db, property_id, user.agency_id)
    media = find_media(prop, media_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes.pop("is_cover", None):
        for item in prop.media:
            item.is_cover = item.id == media.id
    for field, value in changes.items():
        setattr(media, field, value)
    db.commit()
    return media


@router.delete("/{property_id}/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(property_id: uuid.UUID, media_id: uuid.UUID, user: User = Depends(admin_only),
                 db: Session = Depends(get_db)) -> None:
    prop = load_property(db, property_id, user.agency_id)
    media = find_media(prop, media_id)
    prop.media.remove(media)
    if media.is_cover and prop.media:
        prop.media[0].is_cover = True
    db.delete(media)
    db.commit()
    delete_image(media.storage_key)
