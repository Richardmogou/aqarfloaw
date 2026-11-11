"""Schéma MVP (corrigé : property_id sur leads, lead_id sur deals, slug, is_published, starts_at/ends_at)."""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, Numeric,
                        String, Text, UniqueConstraint, func)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def pk():
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Agency(Base, TimestampMixin):
    __tablename__ = "agencies"
    id: Mapped[uuid.UUID] = pk()
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Karachi")
    default_currency: Mapped[str] = mapped_column(String(3), default="PKR")


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("email = lower(email)", name="ck_users_email_lowercase"),)
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="agent")  # admin | agent
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AuthSession(Base):
    __tablename__ = "sessions"
    id: Mapped[uuid.UUID] = pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    user: Mapped[User] = relationship()


class Property(Base, TimestampMixin):
    __tablename__ = "properties"
    __table_args__ = (UniqueConstraint("agency_id", "reference_code"),
                      Index("ix_properties_public", "agency_id", "is_published", "status"))
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    reference_code: Mapped[str] = mapped_column(String(50))
    slug: Mapped[str] = mapped_column(String(220), unique=True)
    title: Mapped[str] = mapped_column(String(250))
    description: Mapped[str | None] = mapped_column(Text)
    purpose: Mapped[str] = mapped_column(String(10))            # sale | rent
    property_type: Mapped[str] = mapped_column(String(30))      # villa, apartment, house, plot, commercial
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    currency: Mapped[str] = mapped_column(String(3), default="PKR")
    area_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    area_unit: Mapped[str] = mapped_column(String(10), default="sqm")  # sqm | marla | kanal
    bedrooms: Mapped[int | None] = mapped_column(Integer)
    bathrooms: Mapped[int | None] = mapped_column(Integer)
    address: Mapped[str | None] = mapped_column(String(300))
    city: Mapped[str] = mapped_column(String(100), index=True)
    locality: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="draft")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    assigned_agent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    media: Mapped[list["PropertyMedia"]] = relationship(
        back_populates="property", order_by="PropertyMedia.sort_order")
    assigned_agent: Mapped[User | None] = relationship()


class PropertyMedia(Base):
    __tablename__ = "property_media"
    id: Mapped[uuid.UUID] = pk()
    property_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), index=True)
    storage_key: Mapped[str] = mapped_column(String(400), unique=True, index=True)
    caption: Mapped[str | None] = mapped_column(String(200))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)
    property: Mapped[Property] = relationship(back_populates="media")


class Contact(Base, TimestampMixin):
    __tablename__ = "contacts"
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(30))
    phone_normalized: Mapped[str | None] = mapped_column(String(20), index=True)  # E.164, ex. +92300...
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    contact_type: Mapped[str] = mapped_column(String(20), default="buyer")
    notes: Mapped[str | None] = mapped_column(Text)


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    contact_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contacts.id"))
    property_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("properties.id"))
    source: Mapped[str] = mapped_column(String(30), default="website")
    message: Mapped[str | None] = mapped_column(Text)
    budget_min: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    budget_max: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    preferred_location: Mapped[str | None] = mapped_column(String(200))
    stage: Mapped[str] = mapped_column(String(20), default="new", index=True)
    assigned_agent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    next_follow_up_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    contact: Mapped[Contact] = relationship()


class Activity(Base):
    __tablename__ = "activities"
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    related_type: Mapped[str] = mapped_column(String(20))   # lead | deal | property
    related_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    activity_type: Mapped[str] = mapped_column(String(30))  # note, call, stage_change, assignment
    body: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Visit(Base, TimestampMixin):
    __tablename__ = "visits"
    __table_args__ = (Index("ix_visits_agent_time", "agent_id", "starts_at", "ends_at"),)
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    property_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("properties.id"))
    lead_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("leads.id"))
    agent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default="requested")
    meeting_point: Mapped[str | None] = mapped_column(String(200))
    notes: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(Text)


class Deal(Base, TimestampMixin):
    __tablename__ = "deals"
    id: Mapped[uuid.UUID] = pk()
    agency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agencies.id"), index=True)
    property_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("properties.id"))
    lead_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("leads.id"))
    buyer_contact_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contacts.id"))
    agent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    stage: Mapped[str] = mapped_column(String(20), default="inquiry", index=True)
    offer_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    agreed_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    expected_close_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)


class DealEvent(Base):
    __tablename__ = "deal_events"
    id: Mapped[uuid.UUID] = pk()
    deal_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("deals.id", ondelete="CASCADE"), index=True)
    old_stage: Mapped[str | None] = mapped_column(String(20))
    new_stage: Mapped[str] = mapped_column(String(20))
    changed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
