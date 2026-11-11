"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import { AGENTS, DEALS, LEADS, getLead, getProperty, isOpenDeal } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ELIGIBLE = ["qualified", "visit_scheduled", "negotiation"]; // un deal naît d'un prospect qualifié

export function DealForm({ leadId = "" }: { leadId?: string }) {
  const L = useL();
  const [lead, setLead] = useState(leadId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");

  const l = getLead(Number(lead));
  const p = l ? getProperty(l.propertyId) : undefined;
  const options = LEADS.filter((x) => ELIGIBLE.includes(x.stage) || x.id === l?.id);
  const notQualified = l && !ELIGIBLE.includes(l.stage);
  const existing = l && DEALS.find((d) => d.leadId === l.id && isOpenDeal(d.stage));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "pending") return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!l) errs.lead = L("Select a qualified lead.", "Choisissez un prospect qualifié.");
    if (get("offer") && !(Number(get("offer")) > 0)) errs.offer = L("Enter an amount greater than 0.", "Saisissez un montant supérieur à 0.");
    if (get("closeDate") && new Date(`${get("closeDate")}T23:59`) < new Date()) errs.closeDate = L("Pick a future date.", "Choisissez une date future.");
    setErrors(errs);
    if (Object.keys(errs).length || !l) return;

    setState("pending");
    try {
      // await demoSave({ leadId: l.id, propertyId: l.propertyId, agentId: get("agentId"), offer: Number(get("offer")) || null,
      //   expectedCloseDate: get("closeDate") || null, notes: get("notes"), stage: "inquiry" });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {state === "done" && (
        <FormBanner tone="success">
          {L("Deal created (demo, not saved yet).", "Deal créé (démo, pas encore enregistré).")}{" "}
          <Link href="/deals" className="underline">{L("Back to deals", "Retour aux deals")}</Link>
        </FormBanner>
      )}
      {notQualified && <FormBanner tone="warning">{L("This lead is not qualified yet. Qualify it first, or continue if you are sure.", "Ce prospect n'est pas encore qualifié. Qualifiez-le d'abord, ou continuez si vous êtes sûr.")}</FormBanner>}
      {existing && <FormBanner tone="warning">{L("This lead already has an open deal.", "Ce prospect a déjà un deal en cours.")}</FormBanner>}

      <Card title={L("Deal details", "Détails du deal")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Lead", "Prospect")} id="lead" error={errors.lead}>
            <select value={lead} onChange={(e) => setLead(e.target.value)} className={inputCls}>
              <option value="">{L("Select a qualified lead", "Choisir un prospect qualifié")}</option>
              {options.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{L("Property", "Bien")}</p>
            <p className="flex h-10 items-center rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground">
              {p ? `${p.title} · ${fmtPkr(p.price)}` : L("Chosen from the lead", "Repris du prospect")}
            </p>
          </div>
          <Field label={L("Responsible agent", "Agent responsable")} id="agentId">
            <select key={lead} name="agentId" defaultValue={l?.agentId ?? ""} className={inputCls}>
              <option value="">{L("Unassigned", "Non assigné")}</option>
              {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label={L("Offer amount (PKR)", "Montant de l'offre (PKR)")} id="offer" error={errors.offer}><input name="offer" type="number" min={0} className={inputCls} /></Field>
          <Field label={L("Expected close date", "Date de clôture prévue")} id="closeDate" error={errors.closeDate}><input name="closeDate" type="date" className={inputCls} /></Field>
          <Field label={L("Notes", "Notes")} id="notes" className="sm:col-span-2"><textarea name="notes" rows={3} className={textareaCls} /></Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={state === "pending"} className={cn(btn.primary, "disabled:opacity-60")}>
          {state === "pending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Create deal", "Créer le deal")}
        </button>
        <Link href="/deals" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}