"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { field } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { useL, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const CITIES = ["Islamabad", "Lahore", "Karachi"];
const TYPES = ["villa", "apartment", "duplex", "house"];
const MAX_SALE = [10_000_000, 20_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000];
const MAX_RENT = [50_000, 100_000, 200_000, 300_000, 500_000, 1_000_000];

export function HeroSearch() {
  const router = useRouter();
  const L = useL();
  const t = useT();
  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const qs = new URLSearchParams({ purpose });
    for (const k of ["city", "type", "max", "beds", "q"]) {
      const v = String(f.get(k) ?? "").trim();
      if (v) qs.set(k, v);
    }
    router.push(`/listings?${qs.toString()}`);
  }

  return (
    <div className="mt-8 max-w-5xl rounded-2xl bg-card p-4 text-foreground shadow-2xl sm:p-5">
      <div role="radiogroup" aria-label={L("Buy or rent", "Acheter ou louer")} className="mb-4 inline-flex rounded-lg bg-muted p-1">
        {(["sale", "rent"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={purpose === v}
            onClick={() => setPurpose(v)}
            className={cn("rounded-md px-6 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              purpose === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {v === "sale" ? L("Buy", "Acheter") : L("Rent", "Louer")}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs font-medium text-muted-foreground lg:col-span-1">
          {L("City", "Ville")}
          <select name="city" className={`${field} mt-1 w-full`}>
            <option value="">{L("All cities", "Toutes les villes")}</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground lg:col-span-2">
          {L("Area or keyword", "Zone ou mot-clé")}
          <input name="q" placeholder={L("e.g. DHA Phase 5, F-7, Clifton", "ex. DHA Phase 5, F-7, Clifton")} className={`${field} mt-1 w-full`} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          {L("Property type", "Type de bien")}
          <select name="type" className={`${field} mt-1 w-full`}>
            <option value="">{L("All types", "Tous les types")}</option>
            {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          {L("Max price", "Prix max")}
          <select key={purpose} name="max" className={`${field} mt-1 w-full`}>
            <option value="">{L("Any price", "Tout prix")}</option>
            {(purpose === "sale" ? MAX_SALE : MAX_RENT).map((n) => <option key={n} value={n}>{fmtPkr(n)}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          {L("Bedrooms", "Chambres")}
          <select name="beds" className={`${field} mt-1 w-full`}>
            <option value="">{L("Any", "Toutes")}</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </label>
        <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-2 lg:col-span-6">
          <Search className="h-4 w-4" aria-hidden /> {L("Find properties", "Trouver des biens")}
        </button>
      </form>
    </div>
  );
}