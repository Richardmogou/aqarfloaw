import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

PropertyPurpose = Literal["sale", "rent"]
PropertyType = Literal["villa", "apartment", "duplex", "house", "plot", "commercial"]
PropertyStatus = Literal["draft", "available", "reserved", "under_offer", "sold", "rented", "inactive"]
AreaUnit = Literal["sqm", "marla", "kanal"]
PropertySort = Literal["newest", "oldest", "price_asc", "price_desc"]
PublicSort = Literal["newest", "price_asc", "price_desc"]

UNPUBLISHABLE_STATUSES = {"draft", "inactive"}

Title = Annotated[str, Field(min_length=3, max_length=250)]
ReferenceCode = Annotated[str, Field(min_length=1, max_length=50, pattern=r"^[A-Za-z0-9][A-Za-z0-9_-]*$")]
City = Annotated[str, Field(min_length=1, max_length=100)]
Price = Annotated[Decimal, Field(gt=0, max_digits=14, decimal_places=2)]
AreaValue = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]
RoomCount = Annotated[int, Field(ge=0, le=100)]


class PropertyFields(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    description: str | None = Field(default=None, max_length=5000)
    area_value: AreaValue | None = None
    bedrooms: RoomCount | None = None
    bathrooms: RoomCount | None = None
    address: str | None = Field(default=None, max_length=300)
    locality: str | None = Field(default=None, max_length=100)
    assigned_agent_id: uuid.UUID | None = None


class PropertyCreate(PropertyFields):
    reference_code: ReferenceCode
    title: Title
    purpose: PropertyPurpose
    property_type: PropertyType
    price: Price
    area_unit: AreaUnit = "sqm"
    city: City
    status: PropertyStatus = "draft"
    is_published: bool = False


class PropertyUpdate(PropertyFields):
    reference_code: ReferenceCode | None = None
    title: Title | None = None
    purpose: PropertyPurpose | None = None
    property_type: PropertyType | None = None
    price: Price | None = None
    area_unit: AreaUnit | None = None
    city: City | None = None
    status: PropertyStatus | None = None
    is_published: bool | None = None

    @model_validator(mode="after")
    def reject_null_for_required_columns(self) -> "PropertyUpdate":
        nullable = set(PropertyFields.model_fields)
        nulled = [name for name in self.model_fields_set - nullable if getattr(self, name) is None]
        if nulled:
            raise ValueError(f"These fields cannot be null: {', '.join(sorted(nulled))}")
        return self


class MediaUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    caption: str | None = Field(default=None, max_length=200)
    sort_order: int | None = Field(default=None, ge=0, le=1000)
    is_cover: Literal[True] | None = None

    @model_validator(mode="after")
    def reject_null_sort_order(self) -> "MediaUpdate":
        if "sort_order" in self.model_fields_set and self.sort_order is None:
            raise ValueError("sort_order cannot be null")
        return self


class MediaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    storage_key: str = Field(exclude=True)
    caption: str | None
    sort_order: int
    is_cover: bool

    @computed_field
    @property
    def url(self) -> str:
        return f"/api/v1/media/{self.storage_key}"


class PropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    reference_code: str
    slug: str
    title: str
    description: str | None
    purpose: str
    property_type: str
    price: Decimal
    currency: str
    area_value: Decimal | None
    area_unit: str
    bedrooms: int | None
    bathrooms: int | None
    address: str | None
    city: str
    locality: str | None
    status: str
    is_published: bool
    published_at: datetime | None
    assigned_agent_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    media: list[MediaOut]


class PropertyPage(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    page_size: int


class PublicAgent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: str
    phone: str | None = None


class PublicMedia(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    storage_key: str = Field(exclude=True)
    caption: str | None
    is_cover: bool

    @computed_field
    @property
    def url(self) -> str:
        return f"/api/v1/media/{self.storage_key}"


class PublicPropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    reference_code: str
    title: str
    description: str | None
    purpose: str
    property_type: str
    price: Decimal
    currency: str
    area_value: Decimal | None
    area_unit: str
    bedrooms: int | None
    bathrooms: int | None
    city: str
    locality: str | None
    status: str
    published_at: datetime | None
    media: list[PublicMedia]
    agent: PublicAgent | None = Field(validation_alias="assigned_agent")


class PublicPropertyPage(BaseModel):
    items: list[PublicPropertyOut]
    total: int
    page: int
    page_size: int
