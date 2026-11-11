"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { fmtTime } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import { AGENTS, LEADS, WORKSPACE_PROPERTIES, findConflict, getLead, getProperty } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Change = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export function VisitForm({ leadId = "", propertyId = "" }: { leadId?: string; propertyId?: string }) {
  const L = useL();
  const lead0 = getLead(Number(leadId));
  const [v, setV] = useState({
    property: propertyId || (lead0 ? String(lead0.propertyId) : ""), lead: leadId, agent: lead0?.agentId ?? "",
    date: "", time: "", minutes: "60", visitors: "1", meeting: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const set = (k: keyof typeof v) => (e: Change) => setV((s) => ({ ...s, [k]: e.target.value }));

  function onLead(e: Change) {
    const id = e.target.value;
    const l = getLead(Number(id));
    setV((s) => ({ ...s, lead: id, property: s.property || (l ? String(l.propertyId) : ""), agent: s.agent || (l?.agentId ?? "") }));
  }

  const start = v.date && v.time ? `${v.date}T${v.time}` : "";
  const clash = v.agent && start ? findConflict(v.agent, start, Number(v.minutes)) : undefined; // avertissement, pas un blocage

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "pending") return;
    const errs: Record<string, string> = {};
    const need = L("Required.", "Obligatoire.");
    if (!v.property) errs.property = need;
    if (!v.lead) errs.lead = need;
    if (!v.agent) errs.agent = need;
    if (!v.date) errs.date = need;
    if (!v.time) errs.time = need;
    if (start && new Date(start) < new Date()) errs.date = L("Pick a date and time in the future.", "Choisissez une date et une heure futures.");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState("pending");
    try {
      // await demoSave({ propertyId: Number(v.property), leadId: Number(v.lead), agentId: v.agent, startsAt: start, minutes: Number(v.minutes),
      //   visitors: Number(v.visitors), meetingPoint: v.meeting, notes: v.notes, status: "requested" });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {state === "done" && (
        <FormBanner tone="success">
          {L("Visit scheduled (demo, not saved yet).", "Visite planifiée (démo, pas encore enregistrée).")}{" "}
          <Link href="/visits" className="underline">{L("Back to visits", "Retour aux visites")}</Link>
        </FormBanner>
      )}
      {clash && (
        <FormBanner tone="warning">
          <AlertTriangle className="mr-2 inline h-4 w-4 text-warning" aria-hidden />
          {L(
            `This agent already has a visit at ${fmtTime(clash.start)} (${getProperty(clash.propertyId)?.title}). You can still save, but check the schedule.`,
            `Cet agent a déjà une visite à ${fmtTime(clash.start)} (${getProperty(clash.propertyId)?.title}). Vous pouvez enregistrer, mais vérifiez le planning.`,
          )}
        </FormBanner>
      )}

      <Card title={L("Visit details", "Détails de la visite")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Property", "Bien")} id="property" error={errors.property}>
            <select value={v.property} onChange={set("property")} className={inputCls}>
              <option value="">{L("Select a property", "Choisir un bien")}</option>
              {WORKSPACE_PROPERTIES.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
          <Field label={L("Lead", "Prospect")} id="lead" error={errors.lead}>
            <select value={v.lead} onChange={onLead} className={inputCls}>
              <option value="">{L("Select a lead", "Choisir un prospect")}</option>
              {LEADS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label={L("Agent", "Agent")} id="agent" error={errors.agent}>
            <select value={v.agent} onChange={set("agent")} className={inputCls}>
              <option value="">{L("Select an agent", "Choisir un agent")}</option>
              {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label={L("Number of visitors", "Nombre de visiteurs")} id="visitors">
            <input type="number" min={1} value={v.visitors} onChange={set("visitors")} className={inputCls} />
          </Field>
          <Field label={L("Date", "Date")} id="date" error={errors.date}><input type="date" value={v.date} onChange={set("date")} className={inputCls} /></Field>
          <Field label={L("Start time", "Heure de début")} id="time" error={errors.time}><input type="time" value={v.time} onChange={set("time")} className={inputCls} /></Field>
          <Field label={L("Duration", "Durée")} id="minutes">
            <select value={v.minutes} onChange={set("minutes")} className={inputCls}>
              {[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </Field>
          <Field label={L("Meeting point", "Lieu de rendez-vous")} id="meeting"><input value={v.meeting} onChange={set("meeting")} className={inputCls} /></Field>
          <Field label={L("Notes", "Notes")} id="notes" className="sm:col-span-2"><textarea rows={3} value={v.notes} onChange={set("notes")} className={textareaCls} /></Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={state === "pending"} className={cn(btn.primary, "disabled:opacity-60")}>
          {state === "pending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Schedule visit", "Planifier la visite")}
        </button>
        <Link href="/visits" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}