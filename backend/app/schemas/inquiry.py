from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.phone import normalize_phone


class InquiryCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=6, max_length=30)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    message: str = Field(min_length=10, max_length=2000)
    property_slug: str | None = Field(default=None, max_length=220)
    consent: Literal[True]
    # Honeypot: hidden in the form, so only bots fill it in.
    website: str = Field(default="", max_length=200)

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


class InquiryReceived(BaseModel):
    status: Literal["received"] = "received"
