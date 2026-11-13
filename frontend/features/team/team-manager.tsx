"use client";
import { Loader2, Phone, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, FormBanner, inputCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import type { TeamMember } from "@/lib/leads";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function TeamManager({ members, currentUserId, isAdmin }: {
  members: TeamMember[]; currentUserId: string; isAdmin: boolean;
}) {
  const L = useL();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");

  async function createMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const errs: Record<string, string> = {};
    if (get("fullName").length < 2) errs.fullName = L("Enter a full name.", "Saisissez un nom complet.");
    if (!/^\S+@\S+\.\S+$/.test(get("email"))) errs.email = L("Enter a valid email address.", "Saisissez une adresse e-mail valide.");
    if (get("phone") && !normalizePhone(get("phone"))) errs.phone = L("Enter a valid phone number.", "Saisissez un numéro valide.");
    if (get("password").length < 12) errs.password = L("Password must be at least 12 characters.", "Le mot de passe doit contenir au moins 12 caractères.");
    setErrors(errs);
    setBanner("");
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await api<TeamMember>("/users", {
        method: "POST",
        body: JSON.stringify({
          full_name: get("fullName"),
          email: get("email"),
          phone: get("phone") || null,
          password: get("password"),
          role: get("role") || "agent",
        }),
      });
      form.reset();
      setShowForm(false);
      startTransition(() => router.refresh());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setErrors((s) => ({ ...s, email: L("A user with this email already exists.", "Un utilisateur avec cet e-mail existe déjà.") }));
      } else {
        setBanner(L("Could not create the team member. Try again.", "Impossible d'ajouter ce membre. Réessayez."));
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: TeamMember) {
    await api(`/users/${member.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !member.is_active }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setShowForm((s) => !s)} className={btn.primary}>
            <UserPlus className="h-4 w-4" aria-hidden />
            {showForm ? L("Close form", "Fermer le formulaire") : L("Add team member", "Ajouter un membre")}
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <Card title={L("New team member", "Nouveau membre de l'équipe")}>
          <form onSubmit={createMember} noValidate className="space-y-4">
            {banner && <FormBanner tone="error">{banner}</FormBanner>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={L("Full name", "Nom complet")} id="fullName" required error={errors.fullName}>
                <input name="fullName" required maxLength={200} className={inputCls} />
              </Field>
              <Field label={L("Email", "E-mail")} id="email" required error={errors.email}>
                <input name="email" type="email" required maxLength={255} className={inputCls} />
              </Field>
              <Field label={L("Phone (optional)", "Téléphone (facultatif)")} id="phone" error={errors.phone}>
                <input name="phone" type="tel" placeholder="+92 300 1234567" maxLength={30} className={inputCls} />
              </Field>
              <Field label={L("Temporary password (12+ chars)", "Mot de passe initial (12+ car.)")} id="password" required error={errors.password}>
                <input name="password" type="password" required minLength={12} maxLength={256} className={inputCls} />
              </Field>
              <Field label={L("Role", "Rôle")} id="role">
                <select name="role" defaultValue="agent" className={inputCls}>
                  <option value="agent">{L("Agent", "Agent")}</option>
                  <option value="admin">{L("Administrator", "Administrateur")}</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className={cn(btn.primary, "disabled:opacity-60")}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {L("Create account", "Créer le compte")}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className={btn.outline}>
                {L("Cancel", "Annuler")}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", pending && "opacity-60")}>
        {members.map((m) => {
          const stats: [string, number][] = [
            [L("Properties", "Biens"), m.properties_count],
            [L("Leads", "Prospects"), m.leads_count],
            [L("Upcoming visits", "Visites à venir"), m.upcoming_visits_count],
            [L("Open deals", "Deals en cours"), m.open_deals_count],
          ];
          return (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.full_name} className="h-12 w-12 text-base" />
                  <div>
                    <p className="font-semibold">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.role === "admin" ? L("Administrator", "Administrateur") : L("Agent", "Agent")}
                    </p>
                    {m.phone && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" aria-hidden /> {m.phone}
                      </p>
                    )}
                  </div>
                </div>
                <Badge tone={m.is_active ? "success" : "neutral"}>
                  {m.is_active ? L("Active", "Actif") : L("Inactive", "Inactif")}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                {stats.map(([k, n]) => (
                  <div key={k}>
                    <dd className="text-xl font-semibold">{n}</dd>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                  </div>
                ))}
              </dl>
              {isAdmin && m.id !== currentUserId && (
                <div className="mt-4 border-t border-border pt-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleActive(m)}
                    className={cn(btn.outline, "h-8 w-full text-xs")}
                  >
                    {m.is_active ? L("Deactivate account", "Désactiver le compte") : L("Activate account", "Réactiver le compte")}
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
