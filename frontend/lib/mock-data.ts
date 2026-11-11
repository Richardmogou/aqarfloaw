// Données fictives du workspace (remplacées par l'API aux jours 3 à 6)
import type { Tone } from "@/components/ui/badge";
import { PROPERTIES, type Property } from "./mock-properties";

export const AGENTS = [
  { id: "fa", name: "Fatima Ali" },
  { id: "ak", name: "Ahmed Khan" },
  { id: "sz", name: "Sara Zaman" },
  { id: "mk", name: "Muneeb Khan" },
  { id: "ar", name: "Ali Raza" },
];
export const agentName = (id?: string | null) => AGENTS.find((a) => a.id === id)?.name ?? null;

type Meta = { label: string; tone: Tone };
export const TYPE_LABEL: Record<string, string> = { villa: "Villa", apartment: "Appartement", duplex: "Duplex", house: "Maison" };
export const PROPERTY_STATUS: Record<string, Meta> = {
  draft: { label: "Brouillon", tone: "neutral" },
  available: { label: "Disponible", tone: "success" },
  reserved: { label: "Réservé", tone: "warning" },
  under_offer: { label: "Sous offre", tone: "warning" },
  sold: { label: "Vendu", tone: "neutral" },
  rented: { label: "Loué", tone: "neutral" },
  inactive: { label: "Inactif", tone: "neutral" },
};
export const LEAD_STAGE: Record<string, Meta> = {
  new: { label: "Nouveau", tone: "info" },
  contacted: { label: "Contacté", tone: "neutral" },
  qualified: { label: "Qualifié", tone: "success" },
  visit_scheduled: { label: "Visite planifiée", tone: "warning" },
  negotiation: { label: "Négociation", tone: "warning" },
  converted: { label: "Converti", tone: "success" },
  lost: { label: "Perdu", tone: "danger" },
};
export const SOURCE_LABEL: Record<string, string> = { website: "Site web", phone: "Téléphone", whatsapp: "WhatsApp", instagram: "Instagram" };
export const VISIT_STATUS: Record<string, Meta> = {
  requested: { label: "Demandée", tone: "info" },
  confirmed: { label: "Confirmée", tone: "info" },
  completed: { label: "Terminée", tone: "success" },
  cancelled: { label: "Annulée", tone: "danger" },
  no_show: { label: "Absent", tone: "danger" },
};

// --- Biens ---
export type WorkspaceProperty = Omit<Property, "status"> & { status: string; agentId: string; published: boolean };
const META: Record<number, { agentId: string; published: boolean; status?: string }> = {
  1: { agentId: "fa", published: true },
  2: { agentId: "ak", published: true },
  3: { agentId: "sz", published: true },
  4: { agentId: "fa", published: true, status: "under_offer" },
  5: { agentId: "mk", published: true },
  6: { agentId: "sz", published: false, status: "draft" },
};
export const WORKSPACE_PROPERTIES: WorkspaceProperty[] = PROPERTIES.map((p) => ({
  ...p, ...META[p.id], status: META[p.id].status ?? p.status,
}));
export const getProperty = (id: number) => WORKSPACE_PROPERTIES.find((p) => p.id === id);

/** Biens visibles sur le site public : publiés uniquement */
export const PUBLIC_PROPERTIES: Property[] = PROPERTIES.filter((p) => META[p.id].published);
// --- Leads ---
export interface Lead {
  id: number; name: string; city: string; propertyId: number; stage: string; source: string;
  ago: string; agentId: string | null; budget: [number, number];
}
export const LEADS: Lead[] = [
  { id: 1, name: "Ali Khan", city: "Islamabad", propertyId: 1, stage: "new", source: "website", ago: "Il y a 2 jours", agentId: "fa", budget: [150_000_000, 200_000_000] },
  { id: 2, name: "Ahmed Khan", city: "Islamabad", propertyId: 1, stage: "contacted", source: "website", ago: "Il y a 2 h", agentId: "ak", budget: [160_000_000, 190_000_000] },
  { id: 3, name: "Zainab Sheikh", city: "Karachi", propertyId: 3, stage: "new", source: "phone", ago: "Il y a 3 h", agentId: null, budget: [300_000_000, 350_000_000] },
  { id: 4, name: "Umar Malik", city: "Islamabad", propertyId: 4, stage: "qualified", source: "whatsapp", ago: "Il y a 5 h", agentId: "sz", budget: [140_000_000, 170_000_000] },
  { id: 5, name: "Sara Noor", city: "Karachi", propertyId: 5, stage: "new", source: "website", ago: "Il y a 6 h", agentId: null, budget: [250_000_000, 280_000_000] },
  { id: 6, name: "Bilal Tariq", city: "Karachi", propertyId: 3, stage: "new", source: "instagram", ago: "Il y a 1 jour", agentId: null, budget: [320_000_000, 360_000_000] },
  { id: 7, name: "Maria Khan", city: "Islamabad", propertyId: 4, stage: "contacted", source: "phone", ago: "Il y a 1 jour", agentId: "mk", budget: [150_000_000, 175_000_000] },
  { id: 8, name: "Hassan Ali", city: "Lahore", propertyId: 6, stage: "new", source: "website", ago: "Il y a 2 jours", agentId: null, budget: [300_000, 500_000] },
];
export const getLead = (id: number) => LEADS.find((l) => l.id === id);

// --- Visites ---
export interface Visit { id: number; propertyId: number; leadId: number; agentId: string; start: string; minutes: number; status: string }
export const VISITS: Visit[] = [
  { id: 1, propertyId: 1, leadId: 2, agentId: "ar", start: "2026-11-10T10:00", minutes: 60, status: "confirmed" },
  { id: 3, propertyId: 3, leadId: 3, agentId: "ar", start: "2026-11-10T10:30", minutes: 60, status: "requested" },
  { id: 2, propertyId: 2, leadId: 1, agentId: "sz", start: "2026-11-10T11:00", minutes: 60, status: "requested" },
  { id: 5, propertyId: 4, leadId: 4, agentId: "mk", start: "2026-11-12T16:00", minutes: 60, status: "cancelled" },
  { id: 4, propertyId: 5, leadId: 5, agentId: "fa", start: "2026-11-06T14:30", minutes: 45, status: "completed" },
];
export const isUpcoming = (s: string) => s === "requested" || s === "confirmed";

/** Visites actives d'un même agent dont les créneaux se chevauchent */
export function conflictIds(visits: Visit[]) {
  const active = visits.filter((v) => isUpcoming(v.status));
  const ids = new Set<number>();
  for (const a of active) {
    for (const b of active) {
      if (a.id >= b.id || a.agentId !== b.agentId) continue;
      const as = +new Date(a.start), ae = as + a.minutes * 60_000;
      const bs = +new Date(b.start), be = bs + b.minutes * 60_000;
      if (as < be && bs < ae) { ids.add(a.id); ids.add(b.id); }
    }
  }
  return ids;
}
// --- Libellés anglais (les libellés ci-dessus sont les originaux français) ---
export const EN = {
  propertyStatus: { draft: "Draft", available: "Available", reserved: "Reserved", under_offer: "Under offer", sold: "Sold", rented: "Rented", inactive: "Inactive" } as Record<string, string>,
  leadStage: { new: "New", contacted: "Contacted", qualified: "Qualified", visit_scheduled: "Visit scheduled", negotiation: "Negotiation", converted: "Converted", lost: "Lost" } as Record<string, string>,
  source: { website: "Website", phone: "Phone", whatsapp: "WhatsApp", instagram: "Instagram" } as Record<string, string>,
};

// --- Deals ---
export const DEAL_STAGES = ["inquiry", "qualified", "visit", "offer", "negotiation", "booking", "documentation", "closed_won", "closed_lost"] as const;
export const DEAL_STAGE: Record<string, { en: string; fr: string; tone: Tone }> = {
  inquiry: { en: "Inquiry", fr: "Demande", tone: "neutral" },
  qualified: { en: "Qualified", fr: "Qualifié", tone: "info" },
  visit: { en: "Visit", fr: "Visite", tone: "info" },
  offer: { en: "Offer", fr: "Offre", tone: "warning" },
  negotiation: { en: "Negotiation", fr: "Négociation", tone: "warning" },
  booking: { en: "Booking", fr: "Réservation", tone: "info" },
  documentation: { en: "Documentation", fr: "Documents", tone: "info" },
  closed_won: { en: "Closed won", fr: "Conclu", tone: "success" },
  closed_lost: { en: "Closed lost", fr: "Perdu", tone: "danger" },
};
export interface Deal {
  id: number; propertyId: number; leadId: number; agentId: string; stage: string;
  offer: number | null; agreed: number | null; closeDate: string | null; history: { stage: string; at: string }[];
}
export const DEALS: Deal[] = [
  { id: 1, propertyId: 4, leadId: 4, agentId: "sz", stage: "negotiation", offer: 160_000_000, agreed: null, closeDate: "2026-12-05",
    history: [{ stage: "inquiry", at: "2026-10-28" }, { stage: "qualified", at: "2026-10-30" }, { stage: "visit", at: "2026-11-02" }, { stage: "offer", at: "2026-11-05" }, { stage: "negotiation", at: "2026-11-08" }] },
  { id: 2, propertyId: 3, leadId: 3, agentId: "sz", stage: "offer", offer: 330_000_000, agreed: null, closeDate: "2026-12-20",
    history: [{ stage: "inquiry", at: "2026-11-01" }, { stage: "qualified", at: "2026-11-03" }, { stage: "offer", at: "2026-11-09" }] },
  { id: 3, propertyId: 5, leadId: 5, agentId: "mk", stage: "qualified", offer: null, agreed: null, closeDate: null,
    history: [{ stage: "inquiry", at: "2026-11-05" }, { stage: "qualified", at: "2026-11-07" }] },
];
export const getDeal = (id: number) => DEALS.find((d) => d.id === id);
export const isOpenDeal = (stage: string) => !stage.startsWith("closed");

/** Une visite active du même agent chevauche-t-elle ce créneau ? */
export function findConflict(agentId: string, start: string, minutes: number) {
  const s = +new Date(start), e = s + minutes * 60_000;
  return VISITS.find((v) => v.agentId === agentId && isUpcoming(v.status) && s < +new Date(v.start) + v.minutes * 60_000 && +new Date(v.start) < e);
}