import { Building2, FileText, Home, KeyRound, TrendingUp, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { btn } from "@/components/ui/styles";
import { getL } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Our services" };

export default function ServicesPage() {
  const L = getL();
  const items = [
    { icon: Home, t: L("Buying", "Achat"), d: L("Find the right property and negotiate with confidence.", "Trouvez le bon bien et négociez en confiance.") },
    { icon: KeyRound, t: L("Renting", "Location"), d: L("Houses and apartments for rent, with visits arranged for you.", "Maisons et appartements à louer, avec visites organisées.") },
    { icon: TrendingUp, t: L("Selling", "Vente"), d: L("Publish your property and reach serious buyers.", "Publiez votre bien et touchez des acheteurs sérieux.") },
    { icon: Building2, t: L("Property management", "Gestion de biens"), d: L("Tenant search, rent follow-up and maintenance coordination.", "Recherche de locataires, suivi des loyers et coordination de la maintenance.") },
    { icon: Wallet, t: L("Investment advice", "Conseil en investissement"), d: L("Market insight on Islamabad, Lahore and Karachi.", "Analyse du marché d'Islamabad, Lahore et Karachi.") },
    { icon: FileText, t: L("Documentation support", "Aide aux documents"), d: L("We help you gather documents. Legal checks stay with qualified professionals.", "Nous vous aidons à réunir les documents. Les vérifications juridiques restent confiées à des professionnels qualifiés.") },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{L("Our services", "Nos services")}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{L("From the first search to the keys in your hand.", "De la première recherche à la remise des clés.")}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-xl border border-border bg-card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
            <h2 className="mt-4 font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <Link href="/contact" className={`${btn.primary} mt-10`}>{L("Talk to us", "Parlez-nous")}</Link>
    </div>
  );
}