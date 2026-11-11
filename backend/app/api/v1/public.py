from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.db import get_db
from app.models import Property
from app.schemas.property import PropertyPurpose, PropertyType, PublicPropertyOut, PublicPropertyPage, PublicSort

router = APIRouter(prefix="/public/properties")

SORT_ORDERS = {
    "newest": Property.published_at.desc(),
    "price_asc": Property.price.asc(),
    "price_desc": Property.price.desc(),
}
VISIBLE = (Property.is_published.is_(True), Property.deleted_at.is_(None))
LOAD_OPTIONS = (selectinload(Property.media), selectinload(Property.assigned_agent))


@router.get("", response_model=PublicPropertyPage)
def list_public_properties(
    q: Annotated[str | None, Query(max_length=100)] = None,
    purpose: PropertyPurpose | None = None,
    property_type: PropertyType | None = None,
    city: Annotated[str | None, Query(max_length=100)] = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    min_bedrooms: Annotated[int | None, Query(ge=0, le=100)] = None,
    sort: PublicSort = "newest",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
    db: Session = Depends(get_db),
) -> PublicPropertyPage:
    filters = list(VISIBLE)
    if q and q.strip():
        term = q.strip()
        filters.append(or_(*(column.icontains(term, autoescape=True) for column in
                             (Property.title, Property.city, Property.locality))))
    if purpose:
        filters.append(Property.purpose == purpose)
    if property_type:
        filters.append(Property.property_type == property_type)
    if city and city.strip():
        filters.append(func.lower(Property.city) == city.strip().lower())
    if min_price is not None:
        filters.append(Property.price >= min_price)
    if max_price is not None:
        filters.append(Property.price <= max_price)
    if min_bedrooms is not None:
        filters.append(Property.bedrooms >= min_bedrooms)

    total = db.scalar(select(func.count()).select_from(Property).where(*filters))
    items = db.scalars(select(Property).options(*LOAD_OPTIONS).where(*filters)
                       .order_by(SORT_ORDERS[sort], Property.id)
                       .offset((page - 1) * page_size).limit(page_size)).all()
    return PublicPropertyPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=PublicPropertyOut)
def get_public_property(slug: str, db: Session = Depends(get_db)) -> Property:
    prop = db.scalar(select(Property).options(*LOAD_OPTIONS).where(Property.slug == slug, *VISIBLE))
    if prop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Property not found")
    return prop
