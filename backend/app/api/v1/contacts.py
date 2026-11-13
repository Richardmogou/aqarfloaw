import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import Contact, Lead, User
from app.permissions.roles import Role
from app.schemas.lead import ContactCreate, ContactOut, ContactPage, ContactType, ContactUpdate
from app.services.phone import normalize_phone

router = APIRouter(prefix="/contacts")


def load_contact(db: Session, contact_id: uuid.UUID, user: User) -> Contact:
    contact = db.scalar(select(Contact).where(Contact.id == contact_id, Contact.agency_id == user.agency_id))
    if contact is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    if user.role != Role.ADMIN.value:
        allowed = db.scalar(select(Lead.id).where(
            Lead.agency_id == user.agency_id,
            Lead.contact_id == contact.id,
            Lead.assigned_agent_id == user.id,
        ).limit(1))
        if allowed is None:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
    return contact


@router.get("", response_model=ContactPage)
def list_contacts(
    q: Annotated[str | None, Query(max_length=100)] = None,
    contact_type: ContactType | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContactPage:
    filters = [Contact.agency_id == user.agency_id]
    if user.role != Role.ADMIN.value:
        assigned_contact_ids = select(Lead.contact_id).where(
            Lead.agency_id == user.agency_id,
            Lead.assigned_agent_id == user.id,
        )
        filters.append(Contact.id.in_(assigned_contact_ids))
    if contact_type:
        filters.append(Contact.contact_type == contact_type)
    if q and q.strip():
        term = q.strip()
        filters.append(or_(
            Contact.name.icontains(term, autoescape=True),
            Contact.phone.icontains(term, autoescape=True),
            Contact.email.icontains(term, autoescape=True),
        ))

    total = db.scalar(select(func.count()).select_from(Contact).where(*filters))
    items = db.scalars(
        select(Contact)
        .where(*filters)
        .order_by(Contact.created_at.desc(), Contact.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return ContactPage(items=items, total=total, page=page, page_size=page_size)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ContactOut)
def create_contact(
    payload: ContactCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Contact:
    phone = normalize_phone(payload.phone)
    existing = db.scalar(select(Contact).where(
        Contact.agency_id == user.agency_id,
        Contact.phone_normalized == phone,
    ).limit(1))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "A contact with this phone number already exists in your agency")
    contact = Contact(
        agency_id=user.agency_id,
        name=payload.name,
        phone=payload.phone,
        phone_normalized=phone,
        email=payload.email,
        contact_type=payload.contact_type,
        notes=payload.notes,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(
    contact_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Contact:
    return load_contact(db, contact_id, user)


@router.patch("/{contact_id}", response_model=ContactOut)
def update_contact(
    contact_id: uuid.UUID,
    payload: ContactUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Contact:
    contact = load_contact(db, contact_id, user)
    changes = payload.model_dump(exclude_unset=True)
    if "phone" in changes:
        phone = normalize_phone(changes["phone"]) if changes["phone"] else None
        if phone and phone != contact.phone_normalized:
            duplicate = db.scalar(select(Contact.id).where(
                Contact.agency_id == user.agency_id,
                Contact.phone_normalized == phone,
                Contact.id != contact.id,
            ).limit(1))
            if duplicate is not None:
                raise HTTPException(status.HTTP_409_CONFLICT, "A contact with this phone number already exists in your agency")
        contact.phone_normalized = phone
    for field, value in changes.items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact
