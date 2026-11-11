export interface PropertyMedia {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface ApiProperty {
  id: string;
  reference_code: string;
  slug: string;
  title: string;
  description: string | null;
  purpose: "sale" | "rent";
  property_type: string;
  price: string;
  currency: string;
  area_value: string | null;
  area_unit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  city: string;
  locality: string | null;
  status: string;
  is_published: boolean;
  published_at: string | null;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
  media: PropertyMedia[];
}

export interface PropertyPage {
  items: ApiProperty[];
  total: number;
  page: number;
  page_size: number;
}

export interface AgencyMember {
  id: string;
  full_name: string;
  role: "admin" | "agent";
}

export const PAGE_SIZE = 20;
export const PROPERTY_FILTERS = ["q", "property_type", "city", "status", "assigned_agent_id", "page"] as const;
export type PropertyFilters = Partial<Record<(typeof PROPERTY_FILTERS)[number], string>>;

export const UNPUBLISHABLE_STATUSES = ["draft", "inactive"];
export const AREA_UNIT_LABEL: Record<string, string> = { sqm: "m²", marla: "marla", kanal: "kanal" };

export const coverUrl = (property: ApiProperty) =>
  (property.media.find((media) => media.is_cover) ?? property.media[0])?.url ?? null;

export const formatArea = (property: ApiProperty) =>
  property.area_value === null ? "—" : `${Number(property.area_value)} ${AREA_UNIT_LABEL[property.area_unit] ?? property.area_unit}`;

export const memberName = (members: AgencyMember[], id: string | null) =>
  members.find((member) => member.id === id)?.full_name ?? null;

export function propertyQuery(filters: PropertyFilters) {
  const query = new URLSearchParams();
  for (const key of PROPERTY_FILTERS) {
    const value = filters[key]?.trim();
    if (value) query.set(key, value);
  }
  return query.toString();
}

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
