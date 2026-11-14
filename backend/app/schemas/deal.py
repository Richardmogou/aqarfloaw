import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

from app.schemas.auth import AgencyMember
from app.schemas.lead import BudgetAmount, ContactOut, LeadPropertyOut
from app.schemas.visit import VisitLeadOut

DealStage = Literal[
    "inquiry",
    "qualified",
    "visit",
    "offer",
    "negotiation",
    "booking",
    "documentation",
    "closed_won",
    "closed_lost",
]


def ensure_utc_optional(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class DealCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    lead_id: uuid.UUID
    property_id: uuid.UUID | None = None
    agent_id: uuid.UUID | None = None
    stage: DealStage = "inquiry"
    offer_amount: BudgetAmount | None = None
    agreed_amount: BudgetAmount | None = None
    expected_close_date: datetime | None = None
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def normalize_dates(self) -> "DealCreate":
        self.expected_close_date = ensure_utc_optional(self.expected_close_date)
        return self


class DealUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    agent_id: uuid.UUID | None = None
    stage: DealStage | None = None
    offer_amount: BudgetAmount | None = None
    agreed_amount: BudgetAmount | None = None
    expected_close_date: datetime | None = None
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_update(self) -> "DealUpdate":
        nullable = {"offer_amount", "agreed_amount", "expected_close_date", "notes"}
        nulled = [name for name in self.model_fields_set - nullable if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        self.expected_close_date = ensure_utc_optional(self.expected_close_date)
        return self


class DealStageChange(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    stage: DealStage
    offer_amount: BudgetAmount | None = None
    agreed_amount: BudgetAmount | None = None
    notes: str | None = Field(default=None, max_length=5000)


class DealEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    old_stage: str | None
    new_stage: str
    changed_by: uuid.UUID | None
    created_at: datetime
    user: AgencyMember | None = Field(default=None, exclude=True)

    @computed_field
    @property
    def user_name(self) -> str | None:
        return self.user.full_name if self.user else None


class DealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    property_id: uuid.UUID
    lead_id: uuid.UUID
    buyer_contact_id: uuid.UUID
    agent_id: uuid.UUID
    stage: str
    offer_amount: Decimal | None
    agreed_amount: Decimal | None
    expected_close_date: datetime | None
    notes: str | None
    property: LeadPropertyOut
    lead: VisitLeadOut
    buyer_contact: ContactOut
    agent: AgencyMember | None = Field(default=None, exclude=True)
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def agent_name(self) -> str | None:
        return self.agent.full_name if self.agent else None


class DealDetailOut(DealOut):
    events: list[DealEventOut]


class DealPage(BaseModel):
    items: list[DealOut]
    total: int
    open_count: int
    closed_won_count: int
    pipeline_value: Decimal
