import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.services.phone import normalize_phone


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=256, json_schema_extra={"format": "password"})

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class CurrentUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    agency_id: uuid.UUID
    full_name: str
    email: str
    role: str


class AgencyMember(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    full_name: str
    role: str


class TeamMemberOut(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str | None
    role: str
    is_active: bool
    properties_count: int
    leads_count: int
    upcoming_visits_count: int
    open_deals_count: int


class MemberCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    full_name: str = Field(min_length=2, max_length=200)
    email: str = Field(min_length=3, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str | None = Field(default=None, min_length=6, max_length=30)
    password: str = Field(min_length=12, max_length=256, json_schema_extra={"format": "password"})
    role: Literal["admin", "agent"] = "agent"

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, value: str | None) -> str | None:
        if value is not None and normalize_phone(value) is None:
            raise ValueError("Enter a valid phone number")
        return value


class MemberUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    phone: str | None = Field(default=None, min_length=6, max_length=30)
    role: Literal["admin", "agent"] | None = None
    is_active: bool | None = None

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, value: str | None) -> str | None:
        if value is not None and normalize_phone(value) is None:
            raise ValueError("Enter a valid phone number")
        return value

    @model_validator(mode="after")
    def reject_null_for_required_columns(self) -> "MemberUpdate":
        nulled = [name for name in self.model_fields_set - {"phone"} if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        return self
