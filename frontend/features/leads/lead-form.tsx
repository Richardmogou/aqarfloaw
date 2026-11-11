"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { useL } from "@/lib/i18n/provider";
import { AGENTS, EN, PUBLIC_PROPERTIES, SOURCE_LABEL } from "@/lib/mock-data";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function LeadForm() {
  const L = useL();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "pending") return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const errs: Record<string, string> = {};
    if (get("name").length < 2) errs.name = L("Please enter a name.", "Veuillez saisir un nom.");
    const phone = normalizePhone(get("phone"));
    if (!phone) errs.phone = L("Enter a valid phone number, e.g. +92 300 1234567.", "Saisissez un numéro valide, ex. +92 300 1234567.");
    if (get("email") && !/^\S+@\S+\.\S+$/.test(get("email"))) errs.email = L("Enter a valid email address.", "Saisissez une adresse e-mail valide.");
    const min = Number(get("budgetMin")) || 0, max = Number(get("budgetMax")) || 0;
    if (min && max && min > max) errs.budgetMax = L("Maximum budget must be at least the minimum.", "Le budget maximum doit être supérieur au minimum.");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState("pending");
    try {
      // await demoSave({ name: get("name"), phone, email: get("email") || null, contactMethod: get("contactMethod"), source: get("source"),
      //   propertyId: get("propertyId") || null, budgetMin: min || null, budgetMax: max || null, preferredLocation: get("location"),
      //   notes: get("notes"), agentId: get("agentId") || null, stage: "new" });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {state === "done" && (
        <FormBanner tone="success">
          {L("Lead created (demo, not saved yet).", "Prospect créé (démo, pas encore enregistré).")}{" "}
          <Link href="/leads" className="underline">{L("Back to leads", "Retour aux prospects")}</Link>
        </FormBanner>
      )}
      <Card title={L("Contact", "Contact")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Full name", "Nom complet")} id="name" error={errors.name}><input name="name" required className={inputCls} /></Field>
          <Field label={L("Phone", "Téléphone")} id="phone" error={errors.phone}><input name="phone" type="tel" placeholder="+92 300 1234567" required className={inputCls} /></Field>
          <Field label={L("Email (optional)", "E-mail (facultatif)")} id="email" error={errors.email}><input name="email" type="email" className={inputCls} /></Field>
          <Field label={L("Preferred contact method", "Moyen de contact préféré")} id="contactMethod">
            <select name="contactMethod" className={inputCls}>
              <option value="phone">{L("Phone call", "Appel")}</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">{L("Email", "E-mail")}</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card title={L("Request", "Demande")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Source", "Origine")} id="source">
            <select name="source" defaultValue="phone" className={inputCls}>
              {Object.keys(SOURCE_LABEL).map((k) => <option key={k} value={k}>{L(EN.source[k], SOURCE_LABEL[k])}</option>)}
            </select>
          </Field>
          <Field label={L("Property of interest", "Bien concerné")} id="propertyId">
            <select name="propertyId" className={inputCls}>
              <option value="">{L("None yet", "Aucun pour l'instant")}</option>
              {PUBLIC_PROPERTIES.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
          <Field label={L("Budget min (PKR)", "Budget min (PKR)")} id="budgetMin"><input name="budgetMin" type="number" min={0} className={inputCls} /></Field>
          <Field label={L("Budget max (PKR)", "Budget max (PKR)")} id="budgetMax" error={errors.budgetMax}><input name="budgetMax" type="number" min={0} className={inputCls} /></Field>
          <Field label={L("Preferred location", "Localisation souhaitée")} id="location"><input name="location" className={inputCls} /></Field>
          <Field label={L("Assign to agent", "Assigner à un agent")} id="agentId">
            <select name="agentId" className={inputCls}>
              <option value="">{L("Unassigned", "Non assigné")}</option>
              {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label={L("Notes", "Notes")} id="notes" className="sm:col-span-2"><textarea name="notes" rows={4} className={textareaCls} /></Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={state === "pending"} className={cn(btn.primary, "disabled:opacity-60")}>
          {state === "pending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Create lead", "Créer le prospect")}
        </button>
        <Link href="/leads" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}