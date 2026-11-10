// Données fictives du portail (jour 4 : remplacées par GET /api/v1/public/properties)
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
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const PROPERTIES: Property[] = [
  { id: 1, slug: "villa-moderne-piscine-f7", title: "Villa moderne avec piscine", city: "Islamabad", locality: "Secteur F-7", purpose: "sale", type: "villa", price: 185_000_000, beds: 4, baths: 3, areaSqm: 350, status: "available", image: img("photo-1600596542815-ffad4c1539a9") },
  { id: 2, slug: "appartement-t3-gulberg", title: "Appartement T3 centre-ville", city: "Lahore", locality: "Gulberg III", purpose: "rent", type: "apartment", price: 280_000, beds: 2, baths: 2, areaSqm: 120, status: "available", image: img("photo-1545324418-cc1a3fa10c00") },
  { id: 3, slug: "duplex-luxe-dha6", title: "Duplex de luxe, vue panoramique", city: "Karachi", locality: "DHA Phase 6", purpose: "sale", type: "duplex", price: 340_000_000, beds: 5, baths: 5, areaSqm: 500, status: "reserved", image: img("photo-1512917774080-9991f1c4c750") },
  { id: 4, slug: "villa-contemporaine-e11", title: "Villa contemporaine minimaliste", city: "Islamabad", locality: "Secteur E-11", purpose: "sale", type: "villa", price: 165_000_000, beds: 4, baths: 4, areaSqm: 300, status: "available", image: img("photo-1600585154340-be6161a56a0c") },
  { id: 5, slug: "penthouse-clifton", title: "Penthouse exclusif, vue mer", city: "Karachi", locality: "Clifton Block 4", purpose: "sale", type: "apartment", price: 270_000_000, beds: 3, baths: 3, areaSqm: 280, status: "available", image: img("photo-1502672260266-1c1ef2d93688") },
  { id: 6, slug: "maison-familiale-dha5", title: "Maison familiale avec jardin", city: "Lahore", locality: "DHA Phase 5", purpose: "rent", type: "house", price: 450_000, beds: 4, baths: 4, areaSqm: 400, status: "available", image: img("photo-1580587771525-78b9dba3b914") },
];

export function formatPrice(p: Pick<Property, "price" | "purpose">) {
  const n = new Intl.NumberFormat("en-US").format(p.price);
  return `PKR ${n}${p.purpose === "rent" ? " / mois" : ""}`;
}