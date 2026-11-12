import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models import Agency, Contact, Lead, Property
from app.schemas.inquiry import InquiryCreate, InquiryReceived
from app.services.phone import normalize_phone

router = APIRouter(prefix="/public/inquiries")


def published_property(db: Session, slug: str) -> Property:
    prop = db.scalar(select(Property).where(Property.slug == slug, Property.is_published.is_(True),
                                            Property.deleted_at.is_(None)))
    if prop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Property not found")
    return prop


def general_inquiry_agency(db: Session) -> uuid.UUID:
    if settings.public_agency_slug:
        agency = db.scalar(select(Agency).where(Agency.slug == settings.public_agency_slug))
    else:
        agencies = db.scalars(select(Agency).limit(2)).all()
        agency = agencies[0] if len(agencies) == 1 else None
    if agency is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "General inquiries are not configured")
    return agency.id


@router.post("", status_code=status.HTTP_201_CREATED, response_model=InquiryReceived)
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)) -> InquiryReceived:
    # A filled honeypot means a bot: answer like a success so it has no signal to adapt to.
    if payload.website:
        return InquiryReceived()

    prop = published_property(db, payload.property_slug) if payload.property_slug else None
    agency_id = prop.agency_id if prop else general_inquiry_agency(db)
    phone = normalize_phone(payload.phone)

    # Visitors are not authenticated, so an existing contact is reused but never overwritten by their input.
    contact = db.scalar(select(Contact).where(Contact.agency_id == agency_id, Contact.phone_normalized == phone).limit(1))
    if contact is None:
        contact = Contact(agency_id=agency_id, name=payload.name, phone=payload.phone, phone_normalized=phone,
                          email=payload.email, contact_type="tenant" if prop and prop.purpose == "rent" else "buyer")
        db.add(contact)
        db.flush()

    db.add(Lead(agency_id=agency_id, contact_id=contact.id, property_id=prop.id if prop else None,
                source="website", message=payload.message, stage="new"))
    db.commit()
    return InquiryReceived()
