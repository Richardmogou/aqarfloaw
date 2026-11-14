import type { Tone } from "@/components/ui/badge";
import type { ApiContact, LeadProperty } from "@/lib/leads";

export interface VisitLead {
  id: string;
  stage: string;
  contact: ApiContact;
}

export interface ApiVisit {
  id: string;
  property_id: string;
  lead_id: string;
  agent_id: string;
  agent_name: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: "requested" | "confirmed" | "completed" | "cancelled" | "no_show" | string;
  meeting_point: string | null;
  notes: string | null;
  outcome: string | null;
  has_conflict: boolean;
  conflicting_visit_ids: string[];
  property: LeadProperty;
  lead: VisitLead;
  created_at: string;
  updated_at: string;
}

export interface VisitPage {
  items: ApiVisit[];
  total: number;
  upcoming_count: number;
  completed_count: number;
  cancelled_count: number;
  conflict_count: number;
}

export const VISIT_STATUS_META: Record<string, { en: string; fr: string; tone: Tone }> = {
  requested: { en: "Requested", fr: "Demandée", tone: "info" },
  confirmed: { en: "Confirmed", fr: "Confirmée", tone: "info" },
  completed: { en: "Completed", fr: "Terminée", tone: "success" },
  cancelled: { en: "Cancelled", fr: "Annulée", tone: "danger" },
  no_show: { en: "No-show", fr: "Absent", tone: "danger" },
};

export const isUpcomingVisit = (status: string) =>
  status === "requested" || status === "confirmed";

export const visitGroup = (status: string) =>
  isUpcomingVisit(status) ? "upcoming" : status === "completed" ? "done" : "cancelled";
