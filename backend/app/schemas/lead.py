import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator, model_validator

from app.schemas.auth import AgencyMember
from app.schemas.property import MediaOut
from app.services.phone import normalize_phone

LeadStage = Literal["new", "contacted", "qualified", "visit_scheduled", "negotiation", "converted", "lost"]
LeadSource = Literal["website", "phone", "whatsapp", "instagram", "referral", "walk_in"]
ContactType = Literal["buyer", "seller", "tenant", "landlord"]
ActivityType = Literal["note", "call"]
LeadSort = Literal["newest", "oldest"]

BudgetAmount = Annotated[Decimal, Field(gt=0, max_digits=14, decimal_places=2)]


class ContactCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=6, max_length=30)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    contact_type: ContactType = "buyer"
    notes: str | None = Field(default=None, max_length=5000)

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, value: str) -> str:
        if normalize_phone(value) is None:
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip().lower()
        return value or None


class ContactUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str | None = Field(default=None, min_length=2, max_length=200)
    phone: str | None = Field(default=None, min_length=6, max_length=30)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    contact_type: ContactType | None = None
    notes: str | None = Field(default=None, max_length=5000)

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, value: str | None) -> str | None:
        if value is not None and normalize_phone(value) is None:
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip().lower()
        return value or None

    @model_validator(mode="after")
    def reject_null_for_required_columns(self) -> "ContactUpdate":
        nullable = {"phone", "email", "notes"}
        nulled = [name for name in self.model_fields_set - nullable if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        return self


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    phone: str | None
    phone_normalized: str | None
    email: str | None
    contact_type: str
    notes: str | None
    created_at: datetime
    updated_at: datetime


class ContactPage(BaseModel):
    items: list[ContactOut]
    total: int
    page: int
    page_size: int


class LeadFields(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    property_id: uuid.UUID | None = None
    message: str | None = Field(default=None, max_length=5000)
    budget_min: BudgetAmount | None = None
    budget_max: BudgetAmount | None = None
    preferred_location: str | None = Field(default=None, max_length=200)
    assigned_agent_id: uuid.UUID | None = None
    next_follow_up_at: datetime | None = None


class LeadCreate(LeadFields):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=6, max_length=30)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    contact_type: ContactType = "buyer"
    source: LeadSource = "phone"
    stage: LeadStage = "new"

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, value: str) -> str:
        if normalize_phone(value) is None:
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip().lower()
        return value or None

    @model_validator(mode="after")
    def validate_budget_range(self) -> "LeadCreate":
        if self.budget_min is not None and self.budget_max is not None and self.budget_min > self.budget_max:
            raise ValueError("budget_max must be at least budget_min")
        return self


class LeadUpdate(LeadFields):
    source: LeadSource | None = None
    stage: LeadStage | None = None

    @model_validator(mode="after")
    def validate_update(self) -> "LeadUpdate":
        nullable = set(LeadFields.model_fields)
        nulled = [name for name in self.model_fields_set - nullable if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        if self.budget_min is not None and self.budget_max is not None and self.budget_min > self.budget_max:
            raise ValueError("budget_max must be at least budget_min")
        return self


class LeadAssign(BaseModel):
    model_config = ConfigDict(extra="forbid")
    assigned_agent_id: uuid.UUID | None


class ActivityCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    activity_type: ActivityType = "note"
    body: str = Field(min_length=1, max_length=5000)


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    activity_type: str
    body: str | None
    user_id: uuid.UUID | None
    occurred_at: datetime
    user: AgencyMember | None = Field(default=None, exclude=True)

    @computed_field
    @property
    def user_name(self) -> str | None:
        return self.user.full_name if self.user else None


class LeadPropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    reference_code: str
    slug: str
    title: str
    purpose: str
    property_type: str
    price: Decimal
    currency: str
    bedrooms: int | None
    city: str
    locality: str | None
    status: str
    is_published: bool
    media: list[MediaOut]


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    contact_id: uuid.UUID
    contact: ContactOut
    property_id: uuid.UUID | None
    property: LeadPropertyOut | None
    source: str
    message: str | None
    budget_min: Decimal | None
    budget_max: Decimal | None
    preferred_location: str | None
    stage: str
    assigned_agent_id: uuid.UUID | None
    next_follow_up_at: datetime | None
    created_at: datetime
    updated_at: datetime


class LeadDetailOut(LeadOut):
    activities: list[ActivityOut]


class LeadPage(BaseModel):
    items: list[LeadOut]
    total: int
    page: int
    page_size: int
