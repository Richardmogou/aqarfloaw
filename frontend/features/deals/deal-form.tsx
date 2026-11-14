"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import type { ApiDeal, ApiDealDetail } from "@/lib/deals";
import { fmtPkr } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import type { ApiLead } from "@/lib/leads";
import { DEAL_STAGES, DEAL_STAGE, isOpenDeal } from "@/lib/mock-data";
import type { AgencyMember, ApiProperty } from "@/lib/properties";
import { cn } from "@/lib/utils";

const ELIGIBLE = ["qualified", "visit_scheduled", "negotiation"];

export function DealForm({
  leads,
  properties,
  members,
  existingDeals,
  currentUserId,
  isAdmin,
  leadId = "",
}: {
  leads: ApiLead[];
  properties: ApiProperty[];
  members: AgencyMember[];
  existingDeals: ApiDeal[];
  currentUserId: string;
  isAdmin: boolean;
  leadId?: string;
}) {
  const L = useL();
  const router = useRouter();
  const initialLead = leads.find((x) => x.id === leadId);
  const [lead, setLead] = useState(leadId);
  const [propertyId, setPropertyId] = useState(initialLead?.property_id ?? "");
  const [agentId, setAgentId] = useState(
    isAdmin ? (initialLead?.assigned_agent_id ?? currentUserId) : currentUserId,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);

  const selectedLead = leads.find((x) => x.id === lead);
  const selectedProperty = properties.find((p) => p.id === propertyId);
  const notQualified = selectedLead && !ELIGIBLE.includes(selectedLead.stage);
  const existing = selectedLead && existingDeals.find((d) => d.lead_id === selectedLead.id && isOpenDeal(d.stage));

  function onLeadChange(nextLeadId: string) {
    setLead(nextLeadId);
    const found = leads.find((x) => x.id === nextLeadId);
    if (found?.property_id) setPropertyId(found.property_id);
    if (isAdmin && found?.assigned_agent_id) setAgentId(found.assigned_agent_id);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!selectedLead) errs.lead = L("Select a lead.", "Choisissez un prospect.");
    if (!propertyId) errs.property = L("Select a property.", "Choisissez un bien.");
    if (get("offer") && !(Number(get("offer")) > 0)) {
      errs.offer = L("Enter an amount greater than 0.", "Saisissez un montant supérieur à 0.");
    }
    if (get("closeDate") && new Date(`${get("closeDate")}T23:59`) < new Date()) {
      errs.closeDate = L("Pick a future date.", "Choisissez une date future.");
    }
    setErrors(errs);
    setBanner("");
    if (Object.keys(errs).length || !selectedLead) return;

    setPending(true);
    try {
      const created = await api<ApiDealDetail>("/deals", {
        method: "POST",
        body: JSON.stringify({
          lead_id: selectedLead.id,
          property_id: propertyId,
          agent_id: isAdmin ? (agentId || currentUserId) : currentUserId,
          stage: get("stage") || "inquiry",
          offer_amount: get("offer") ? String(Number(get("offer"))) : null,
          expected_close_date: get("closeDate") ? new Date(`${get("closeDate")}T12:00:00Z`).toISOString() : null,
          notes: get("notes") || null,
        }),
      });
      router.push(`/deals/${created.id}`);
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setBanner(L("This property already has a closed-won deal.", "Ce bien possède déjà un deal conclu."));
      } else {
        setBanner(L("Could not create the deal. Please try again.", "Impossible de créer le deal. Réessayez."));
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && <FormBanner tone="error">{banner}</FormBanner>}
      {notQualified && (
        <FormBanner tone="warning">
          {L(
            "This lead is not marked as qualified yet. You can still create the deal to advance it.",
            "Ce prospect n'est pas encore marqué comme qualifié. Vous pouvez tout de même créer le deal.",
          )}
        </FormBanner>
      )}
      {existing && (
        <FormBanner tone="warning">
          {L("This lead already has an open deal.", "Ce prospect a déjà un deal en cours.")}
        </FormBanner>
      )}

      <Card title={L("Deal details", "Détails du deal")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Lead", "Prospect")} id="lead" required error={errors.lead}>
            <select value={lead} onChange={(e) => onLeadChange(e.target.value)} className={inputCls}>
              <option value="">{L("Select a lead", "Choisir un prospect")}</option>
              {leads.map((x) => (
                <option key={x.id} value={x.id}>{x.contact.name}</option>
              ))}
            </select>
          </Field>

          <Field label={L("Property", "Bien")} id="property" required error={errors.property}>
            <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls}>
              <option value="">{L("Select a property", "Choisir un bien")}</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} · {fmtPkr(Number(p.price))}
                </option>
              ))}
            </select>
          </Field>

          {isAdmin && (
            <Field label={L("Responsible agent", "Agent responsable")} id="agentId">
              <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={inputCls}>
                {members.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label={L("Initial stage", "Étape initiale")} id="stage">
            <select name="stage" defaultValue="offer" className={inputCls}>
              {DEAL_STAGES.filter((s) => !s.startsWith("closed")).map((s) => (
                <option key={s} value={s}>{L(DEAL_STAGE[s].en, DEAL_STAGE[s].fr)}</option>
              ))}
            </select>
          </Field>

          <Field label={L("Offer amount (PKR)", "Montant de l'offre (PKR)")} id="offer" error={errors.offer}>
            <input
              name="offer"
              type="number"
              min={0}
              placeholder={selectedProperty ? String(Number(selectedProperty.price)) : ""}
              className={inputCls}
            />
          </Field>

          <Field label={L("Expected close date", "Date de clôture prévue")} id="closeDate" error={errors.closeDate}>
            <input name="closeDate" type="date" className={inputCls} />
          </Field>

          <Field label={L("Notes", "Notes")} id="notes" className="sm:col-span-2">
            <textarea name="notes" rows={3} maxLength={5000} className={textareaCls} />
          </Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={cn(btn.primary, "disabled:opacity-60")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Create deal", "Créer le deal")}
        </button>
        <Link href="/deals" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}
