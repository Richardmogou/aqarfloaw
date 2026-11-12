import { fmtArea } from "./format";

export interface PublicProperty {
  slug: string;
  reference_code: string;
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
  city: string;
  locality: string | null;
  status: string;
  published_at: string | null;
  media: { url: string; caption: string | null; is_cover: boolean }[];
  agent: { full_name: string; phone?: string | null } | null;
}

export interface PublicPropertyPage {
  items: PublicProperty[];
  total: number;
  page: number;
  page_size: number;
}

const DAY_MS = 86_400_000;

export const publicCover = (p: PublicProperty) => (p.media.find((m) => m.is_cover) ?? p.media[0])?.url ?? null;

export const placeLabel = (p: PublicProperty) => [p.locality, p.city].filter(Boolean).join(", ");

export const listedDays = (p: PublicProperty) =>
  p.published_at ? Math.max(0, Math.floor((Date.now() - new Date(p.published_at).getTime()) / DAY_MS)) : 0;

export function publicArea(p: PublicProperty) {
  if (p.area_value === null) return "—";
  const value = Number(p.area_value);
  return p.area_unit === "sqm" ? fmtArea(value, p.property_type) : `${value} ${p.area_unit}`;
}

export const LISTING_CITIES = ["Islamabad", "Lahore", "Karachi"];
export const LISTING_TYPES = ["villa", "apartment", "duplex", "house"];

export type ListingFilters = { purpose: string; q: string; type: string; city: string; min: string; max: string; beds: string; sort: string };
export const EMPTY_LISTING_FILTERS: ListingFilters = { purpose: "", q: "", type: "", city: "", min: "", max: "", beds: "", sort: "newest" };

const pick = (v: string | undefined, allowed: string[]) => (v && allowed.includes(v) ? v : "");
export const priceAmount = (v: string | undefined) => (v && /^\d{1,12}$/.test(v) ? v : "");

/** Ignores unknown or malformed values so a hand-edited URL never reaches the API as a 422. */
export function parseListingParams(params: Record<string, string | string[] | undefined>) {
  const one = (k: string) => { const v = params[k]; return Array.isArray(v) ? v[0] : v; };
  const page = one("page");
  const filters: ListingFilters = {
    purpose: pick(one("purpose"), ["sale", "rent"]), city: pick(one("city"), LISTING_CITIES), type: pick(one("type"), LISTING_TYPES),
    beds: pick(one("beds"), ["1", "2", "3", "4", "5"]), min: priceAmount(one("min")), max: priceAmount(one("max")),
    q: (one("q") ?? "").trim().slice(0, 80), sort: pick(one("sort"), ["price_asc", "price_desc"]) || "newest",
  };
  return { filters, page: page && /^[1-9]\d{0,3}$/.test(page) ? page : "1" };
}
