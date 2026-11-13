"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import type { ApiLeadDetail } from "@/lib/leads";
import { EN, SOURCE_LABEL } from "@/lib/mock-data";
import { normalizePhone } from "@/lib/phone";
import type { AgencyMember, ApiProperty } from "@/lib/properties";
import { cn } from "@/lib/utils";

export function LeadForm({ properties, members, isAdmin }: {
  properties: ApiProperty[]; members: AgencyMember[]; isAdmin: boolean;
}) {
  const L = useL();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const errs: Record<string, string> = {};
    if (get("name").length < 2) errs.name = L("Please enter a name.", "Veuillez saisir un nom.");
    const phone = normalizePhone(get("phone"));
    if (!phone) errs.phone = L("Enter a valid phone number, e.g. +92 300 1234567.", "Saisissez un numéro valide, ex. +92 300 1234567.");
    if (get("email") && !/^\S+@\S+\.\S+$/.test(get("email"))) errs.email = L("Enter a valid email address.", "Saisissez une adresse e-mail valide.");
    const min = Number(get("budgetMin")) || 0;
    const max = Number(get("budgetMax")) || 0;
    if (min && max && min > max) errs.budgetMax = L("Maximum budget must be at least the minimum.", "Le budget maximum doit être supérieur au minimum.");
    setErrors(errs);
    setBanner("");
    if (Object.keys(errs).length) return;

    setPending(true);
    try {
      const created = await api<ApiLeadDetail>("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: get("name"),
          phone: get("phone"),
          email: get("email") || null,
          contact_type: get("contactType") || "buyer",
          source: get("source") || "phone",
          property_id: get("propertyId") || null,
          budget_min: min ? String(min) : null,
          budget_max: max ? String(max) : null,
          preferred_location: get("location") || null,
          message: get("notes") || null,
          assigned_agent_id: isAdmin ? (get("agentId") || null) : null,
        }),
      });
      router.push(`/leads/${created.id}`);
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setBanner(L("Please check the entered information.", "Veuillez vérifier les informations saisies."));
      } else {
        setBanner(L("Could not save the lead. Please try again.", "Impossible d'enregistrer le prospect. Réessayez."));
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && <FormBanner tone="error">{banner}</FormBanner>}

      <Card title={L("Contact", "Contact")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Full name", "Nom complet")} id="name" required error={errors.name}>
            <input name="name" required maxLength={200} className={inputCls} />
          </Field>
          <Field label={L("Phone", "Téléphone")} id="phone" required error={errors.phone}>
            <input name="phone" type="tel" placeholder="+92 300 1234567" required maxLength={30} className={inputCls} />
          </Field>
          <Field label={L("Email (optional)", "E-mail (facultatif)")} id="email" error={errors.email}>
            <input name="email" type="email" maxLength={255} className={inputCls} />
          </Field>
          <Field label={L("Client profile", "Profil du contact")} id="contactType">
            <select name="contactType" defaultValue="buyer" className={inputCls}>
              <option value="buyer">{L("Buyer", "Acheteur")}</option>
              <option value="tenant">{L("Tenant", "Locataire")}</option>
              <option value="seller">{L("Seller", "Vendeur")}</option>
              <option value="landlord">{L("Landlord", "Propriétaire bailleur")}</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card title={L("Request", "Demande")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Source", "Origine")} id="source">
            <select name="source" defaultValue="phone" className={inputCls}>
              {Object.keys(SOURCE_LABEL).map((k) => <option key={k} value={k}>{L(EN.source[k] ?? k, SOURCE_LABEL[k])}</option>)}
            </select>
          </Field>
          <Field label={L("Property of interest", "Bien concerné")} id="propertyId">
            <select name="propertyId" className={inputCls}>
              <option value="">{L("None yet", "Aucun pour l'instant")}</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.reference_code})</option>)}
            </select>
          </Field>
          <Field label={L("Budget min (PKR)", "Budget min (PKR)")} id="budgetMin">
            <input name="budgetMin" type="number" min={0} className={inputCls} />
          </Field>
          <Field label={L("Budget max (PKR)", "Budget max (PKR)")} id="budgetMax" error={errors.budgetMax}>
            <input name="budgetMax" type="number" min={0} className={inputCls} />
          </Field>
          <Field label={L("Preferred location", "Localisation souhaitée")} id="location">
            <input name="location" maxLength={200} placeholder="DHA Phase 6, Lahore" className={inputCls} />
          </Field>
          {isAdmin && (
            <Field label={L("Assign to agent", "Assigner à un agent")} id="agentId">
              <select name="agentId" className={inputCls}>
                <option value="">{L("Unassigned", "Non assigné")}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </Field>
          )}
          <Field label={L("Notes / inquiry details", "Notes / détails de la demande")} id="notes" className="sm:col-span-2">
            <textarea name="notes" rows={4} maxLength={5000} className={textareaCls} />
          </Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={cn(btn.primary, "disabled:opacity-60")}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Create lead", "Créer le prospect")}
        </button>
        <Link href="/leads" className={btn.outline}>{L("Cancel", "Annuler")}</Link>
      </div>
    </form>
  );
}
