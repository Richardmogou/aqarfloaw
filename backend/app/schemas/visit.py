import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

from app.schemas.auth import AgencyMember
from app.schemas.lead import ContactOut, LeadPropertyOut

VisitStatus = Literal["requested", "confirmed", "completed", "cancelled", "no_show"]
VisitCompletedStatus = Literal["completed", "cancelled", "no_show"]


def ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class VisitCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    property_id: uuid.UUID
    lead_id: uuid.UUID
    agent_id: uuid.UUID | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    duration_minutes: int = Field(default=60, ge=15, le=480)
    status: VisitStatus = "requested"
    meeting_point: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def compute_and_validate_window(self) -> "VisitCreate":
        self.starts_at = ensure_utc(self.starts_at)
        if self.ends_at is None:
            self.ends_at = self.starts_at + timedelta(minutes=self.duration_minutes)
        else:
            self.ends_at = ensure_utc(self.ends_at)
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class VisitUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    agent_id: uuid.UUID | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=480)
    status: VisitStatus | None = None
    meeting_point: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=5000)
    outcome: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def reject_null_for_required(self) -> "VisitUpdate":
        nullable = {"meeting_point", "notes", "outcome", "ends_at", "duration_minutes"}
        nulled = [name for name in self.model_fields_set - nullable if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        if self.starts_at is not None:
            self.starts_at = ensure_utc(self.starts_at)
        if self.ends_at is not None:
            self.ends_at = ensure_utc(self.ends_at)
        if self.starts_at is not None and self.ends_at is not None and self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class VisitComplete(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    status: VisitCompletedStatus = "completed"
    outcome: str | None = Field(default=None, max_length=5000)


class VisitLeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    stage: str
    contact: ContactOut


class VisitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    property_id: uuid.UUID
    lead_id: uuid.UUID
    agent_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime
    status: str
    meeting_point: str | None
    notes: str | None
    outcome: str | None
    has_conflict: bool = False
    conflicting_visit_ids: list[uuid.UUID] = Field(default_factory=list)
    property: LeadPropertyOut
    lead: VisitLeadOut
    agent: AgencyMember | None = Field(default=None, exclude=True)
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def duration_minutes(self) -> int:
        return max(1, int(round((self.ends_at - self.starts_at).total_seconds() / 60)))

    @computed_field
    @property
    def agent_name(self) -> str | None:
        return self.agent.full_name if self.agent else None


class VisitPage(BaseModel):
    items: list[VisitOut]
    total: int
    upcoming_count: int
    completed_count: int
    cancelled_count: int
    conflict_count: int
