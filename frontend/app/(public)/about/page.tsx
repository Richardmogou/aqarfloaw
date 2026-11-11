import type { Metadata } from "next";
import Link from "next/link";
import { btn } from "@/components/ui/styles";
import { getL } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  const L = getL();
  const values = [
    { t: L("Transparency", "Transparence"), d: L("Clear prices, honest descriptions and no hidden steps.", "Prix clairs, descriptions honnêtes, aucune étape cachée.") },
    { t: L("Direct contact", "Contact direct"), d: L("You talk to the agent, by phone or WhatsApp, without delay.", "Vous parlez à l'agent, par téléphone ou WhatsApp, sans délai.") },
    { t: L("Local knowledge", "Connaissance locale"), d: L("We work where we live: Islamabad, Lahore and Karachi.", "Nous travaillons là où nous vivons : Islamabad, Lahore et Karachi.") },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{L("About AqarFlow", "À propos d'AqarFlow")}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {L(
          "AqarFlow connects buyers, tenants and owners with agencies across Pakistan. Every listing is published by an agency, and every inquiry goes straight to a named agent.",
          "AqarFlow met en relation acheteurs, locataires et propriétaires avec des agences partout au Pakistan. Chaque annonce est publiée par une agence, et chaque demande arrive directement chez un agent identifié.",
        )}
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.t} className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">{v.t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>
      <Link href="/listings" className={`${btn.primary} mt-10`}>{L("Browse properties", "Parcourir les biens")}</Link>
    </div>
  );
}