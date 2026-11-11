// Données fictives du portail (remplacées par GET /api/v1/public/properties)
import { fmtPkr } from "./format";

export type Purpose = "sale" | "rent";
export type PropertyType = "villa" | "apartment" | "duplex" | "house";

export interface Property {
  id: number;
  slug: string;
  title: string;
  city: string;
  locality: string;
  purpose: Purpose;
  type: PropertyType;
  price: number; // PKR (par mois si location)
  beds: number;
  baths: number;
  areaSqm: number;
  status: "available" | "reserved";
  image: string;
  listedDays: number; // ancienneté de l'annonce, en jours
  verified: boolean; // annonce relue par l'agence (ce n'est PAS une vérification juridique de propriété)
  featured: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const PROPERTIES: Property[] = [
  { id: 1, slug: "modern-villa-with-pool-f7-islamabad", title: "Modern villa with pool", city: "Islamabad", locality: "F-7", purpose: "sale", type: "villa", price: 185_000_000, beds: 5, baths: 5, areaSqm: 506, status: "available", listedDays: 2, verified: true, featured: true, image: img("photo-1600596542815-ffad4c1539a9") },
  { id: 2, slug: "city-centre-apartment-gulberg-lahore", title: "City-centre apartment", city: "Lahore", locality: "Gulberg III", purpose: "rent", type: "apartment", price: 280_000, beds: 3, baths: 3, areaSqm: 139, status: "available", listedDays: 1, verified: true, featured: false, image: img("photo-1545324418-cc1a3fa10c00") },
  { id: 3, slug: "luxury-duplex-dha-phase-6-karachi", title: "Luxury duplex, panoramic view", city: "Karachi", locality: "DHA Phase 6", purpose: "sale", type: "duplex", price: 340_000_000, beds: 6, baths: 6, areaSqm: 760, status: "reserved", listedDays: 5, verified: true, featured: true, image: img("photo-1512917774080-9991f1c4c750") },
  { id: 4, slug: "minimalist-contemporary-villa-e11-islamabad", title: "Minimalist contemporary villa", city: "Islamabad", locality: "E-11", purpose: "sale", type: "villa", price: 165_000_000, beds: 5, baths: 5, areaSqm: 304, status: "available", listedDays: 0, verified: false, featured: true, image: img("photo-1600585154340-be6161a56a0c") },
  { id: 5, slug: "sea-view-penthouse-clifton-karachi", title: "Exclusive sea-view penthouse", city: "Karachi", locality: "Clifton Block 4", purpose: "sale", type: "apartment", price: 270_000_000, beds: 4, baths: 4, areaSqm: 279, status: "available", listedDays: 8, verified: true, featured: false, image: img("photo-1502672260266-1c1ef2d93688") },
  { id: 6, slug: "family-house-with-garden-dha-phase-5-lahore", title: "Family house with garden", city: "Lahore", locality: "DHA Phase 5", purpose: "rent", type: "house", price: 450_000, beds: 5, baths: 5, areaSqm: 380, status: "available", listedDays: 3, verified: true, featured: false, image: img("photo-1580587771525-78b9dba3b914") },
];

export function formatPrice(p: Pick<Property, "price">) {
  return fmtPkr(p.price);
}