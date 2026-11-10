import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
