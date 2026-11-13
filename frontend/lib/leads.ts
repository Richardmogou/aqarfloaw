import type { PropertyMedia } from "@/lib/properties";

export interface ApiContact {
  id: string;
  name: string;
  phone: string | null;
  phone_normalized: string | null;
  email: string | null;
  contact_type: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadProperty {
  id: string;
  reference_code: string;
  slug: string;
  title: string;
  purpose: "sale" | "rent";
  property_type: string;
  price: string;
  currency: string;
  bedrooms: number | null;
  city: string;
  locality: string | null;
  status: string;
  is_published: boolean;
  media: PropertyMedia[];
}

export interface ApiActivity {
  id: string;
  activity_type: "note" | "call" | "stage_change" | "assignment" | string;
  body: string | null;
  user_id: string | null;
  user_name: string | null;
  occurred_at: string;
}

export interface ApiLead {
  id: string;
  contact_id: string;
  contact: ApiContact;
  property_id: string | null;
  property: LeadProperty | null;
  source: string;
  message: string | null;
  budget_min: string | null;
  budget_max: string | null;
  preferred_location: string | null;
  stage: string;
  assigned_agent_id: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiLeadDetail extends ApiLead {
  activities: ApiActivity[];
}

export interface LeadPage {
  items: ApiLead[];
  total: number;
  page: number;
  page_size: number;
}

export interface TeamMember {
  id: string;
  full_name: string;
  phone: string | null;
  role: "admin" | "agent";
  is_active: boolean;
  properties_count: number;
  leads_count: number;
  upcoming_visits_count: number;
  open_deals_count: number;
}

export const LEAD_PAGE_SIZE = 20;
export const LEAD_FILTERS = ["q", "stage", "source", "assigned_agent_id", "unassigned", "property_id", "page"] as const;
export type LeadFilters = Partial<Record<(typeof LEAD_FILTERS)[number], string>>;

export const leadPropertyCover = (property: LeadProperty | null) =>
  property ? ((property.media.find((media) => media.is_cover) ?? property.media[0])?.url ?? null) : null;

export function leadQuery(filters: LeadFilters) {
  const query = new URLSearchParams();
  for (const key of LEAD_FILTERS) {
    const value = filters[key]?.trim();
    if (value) query.set(key, value);
  }
  return query.toString();
}
