import type { ApiContact, LeadProperty } from "@/lib/leads";
import type { VisitLead } from "@/lib/visits";

export interface ApiDealEvent {
  id: string;
  old_stage: string | null;
  new_stage: string;
  changed_by: string | null;
  user_name: string | null;
  created_at: string;
}

export interface ApiDeal {
  id: string;
  property_id: string;
  lead_id: string;
  buyer_contact_id: string;
  agent_id: string;
  agent_name: string | null;
  stage: string;
  offer_amount: string | null;
  agreed_amount: string | null;
  expected_close_date: string | null;
  notes: string | null;
  property: LeadProperty;
  lead: VisitLead;
  buyer_contact: ApiContact;
  created_at: string;
  updated_at: string;
}

export interface ApiDealDetail extends ApiDeal {
  events: ApiDealEvent[];
}

export interface DealPage {
  items: ApiDeal[];
  total: number;
  open_count: number;
  closed_won_count: number;
  pipeline_value: string;
}
