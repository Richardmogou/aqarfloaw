"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { fmtTime } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import type { ApiLead } from "@/lib/leads";
import type { AgencyMember, ApiProperty } from "@/lib/properties";
import { cn } from "@/lib/utils";
import type { ApiVisit } from "@/lib/visits";

type Change = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export function VisitForm({
  properties,
  leads,
  members,
  existingVisits,
  currentUserId,
  isAdmin,
  leadId = "",
  propertyId = "",
}: {
  properties: ApiProperty[];
  leads: ApiLead[];
  members: AgencyMember[];
  existingVisits: ApiVisit[];
  currentUserId: string;
  isAdmin: boolean;
  leadId?: string;
  propertyId?: string;
}) {
  const L = useL();
  const router = useRouter();
  const initialLead = leads.find((l) => l.id === leadId);
  const [v, setV] = useState({
    property: propertyId || initialLead?.property_id || "",
    lead: leadId,
    agent: isAdmin ? (initialLead?.assigned_agent_id ?? currentUserId) : currentUserId,
    date: "",
    time: "",
    minutes: "60",
    meeting: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);

  const set = (k: keyof typeof v) => (e: Change) => setV((s) => ({ ...s, [k]: e.target.value }));

  function onLead(e: Change) {
    const id = e.target.value;
    const selectedLead = leads.find((l) => l.id === id);
    setV((s) => ({
      ...s,
      lead: id,
      property: s.property || selectedLead?.property_id || "",
      agent: isAdmin ? (selectedLead?.assigned_agent_id ?? s.agent) : currentUserId,
    }));
  }

  const startIso = v.date && v.time ? new Date(`${v.date}T${v.time}`).toISOString() : "";
  const clash = (() => {
    if (!v.agent || !startIso) return undefined;
    const s = +new Date(startIso);
    const e = s + Number(v.minutes) * 60_000;
    return existingVisits.find((visit) => {
      if (visit.agent_id !== v.agent) return false;
      const vs = +new Date(visit.starts_at);
      const ve = +new Date(visit.ends_at);
      return s < ve && vs < e;
    });
  })();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const errs: Record<string, string> = {};
    const need = L("Required.", "Obligatoire.");
    if (!v.property) errs.property = need;
    if (!v.lead) errs.lead = need;
    if (!v.agent) errs.agent = need;
    if (!v.date) errs.date = need;
    if (!v.time) errs.time = need;
    if (startIso && new Date(startIso) < new Date()) {
      errs.date = L("Pick a date and time in the future.", "Choisissez une date et une heure futures.");
    }
    setErrors(errs);
    setBanner("");
    if (Object.keys(errs).length) return;

    setPending(true);
    try {
      await api<ApiVisit>("/visits", {
        method: "POST",
        body: JSON.stringify({
          property_id: v.property,
          lead_id: v.lead,
          agent_id: isAdmin ? v.agent : currentUserId,
          starts_at: startIso,
          duration_minutes: Number(v.minutes) || 60,
          status: "requested",
          meeting_point: v.meeting.trim() || null,
          notes: v.notes.trim() || null,
        }),
      });
      router.push("/visits");
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setBanner(L("Please check the visit details.", "Veuillez vérifier les informations de la visite."));
      } else {
        setBanner(L("Could not schedule the visit. Please try again.", "Impossible de planifier la visite. Réessayez."));
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && <FormBanner tone="error">{banner}</FormBanner>}
      {clash && (
        <FormBanner tone="warning">
          <AlertTriangle className="mr-2 inline h-4 w-4 text-warning" aria-hidden />
          {L(
            `This agent already has a visit at ${fmtTime(clash.starts_at)} (${clash.property.title}). You can still save, but check the schedule.`,
            `Cet agent a déjà une visite à ${fmtTime(clash.starts_at)} (${clash.property.title}). Vous pouvez enregistrer, mais vérifiez le planning.`,
          )}
        </FormBanner>
      )}

      <Card title={L("Visit details", "Détails de la visite")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Property", "Bien")} id="property" required error={errors.property}>
            <select value={v.property} onChange={set("property")} className={inputCls}>
              <option value="">{L("Select a property", "Choisir un bien")}</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title} ({p.reference_code})</option>
              ))}
            </select>
          </Field>
          <Field label={L("Lead", "Prospect")} id="lead" required error={errors.lead}>
            <select value={v.lead} onChange={onLead} className={inputCls}>
              <option value="">{L("Select a lead", "Choisir un prospect")}</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.contact.name}</option>
              ))}
            </select>
          </Field>
          {isAdmin && (
            <Field label={L("Agent", "Agent")} id="agent" required error={errors.agent}>
              <select value={v.agent} onChange={set("agent")} className={inputCls}>
                <option value="">{L("Select an agent", "Choisir un agent")}</option>
                {members.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label={L("Duration", "Durée")} id="minutes">
            <select value={v.minutes} onChange={set("minutes")} className={inputCls}>
              {[30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </Field>
          <Field label={L("Date", "Date")} id="date" required error={errors.date}>
            <input type="date" value={v.date} onChange={set("date")} className={inputCls} />
          </Field>
          <Field label={L("Start time", "Heure de début")} id="time" required error={errors.time}>
            <input type="time" value={v.time} onChange={set("time")} className={inputCls} />
          </Field>
          <Field label={L("Meeting point", "Lieu de rendez-vous")} id="meeting" className="sm:col-span-2">
            <input
              value={v.meeting}
              onChange={set("meeting")}
              maxLength={200}
              placeholder={L("e.g. Main entrance, Street 12, F-7/2", "Ex. Entrée principale, Rue 12, F-7/2")}
              className={inputCls}
            />
          </Field>
          <Field label={L("Notes", "Notes")} id="notes" className="sm:col-span-2">
            <textarea rows={3} value={v.notes} onChange={set("notes")} maxLength={5000} className={textareaCls} />
          </Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={cn(btn.primary, "disabled:opacity-60")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Schedule visit", "Planifier la visite")}
        </button>
        <Link href="/visits" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}
