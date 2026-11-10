"use client";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/provider";
import { PROPERTIES } from "@/lib/mock-properties";
import { PropertyCard } from "./property-card";

const CITIES = ["Islamabad", "Lahore", "Karachi"];
const TYPES = ["villa", "apartment", "duplex", "house"];
const EMPTY = { city: "", type: "", purpose: "", max: "" };
const field =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function HomeExplorer() {
  const t = useT();
  const [f, setF] = useState(EMPTY);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const results = useMemo(() => {
    const max = Number(f.max);
    return PROPERTIES.filter(
      (p) =>
        (!f.city || p.city === f.city) &&
        (!f.type || p.type === f.type) &&
        (!f.purpose || p.purpose === f.purpose) &&
        (!max || p.price <= max),
    );
  }, [f]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById("biens")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted-foreground">{t("home.city")}
            <select value={f.city} onChange={set("city")} className={`${field} mt-1`}>
              <option value="">{t("home.anyCity")}</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">{t("home.type")}
            <select value={f.type} onChange={set("type")} className={`${field} mt-1`}>
              <option value="">{t("home.anyType")}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">{t("home.purpose")}
            <select value={f.purpose} onChange={set("purpose")} className={`${field} mt-1`}>
              <option value="">{t("home.anyPurpose")}</option>
              <option value="sale">{t("card.sale")}</option>
              <option value="rent">{t("card.rent")}</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">{t("home.budget")}
            <input type="number" min={0} inputMode="numeric" placeholder={t("home.budgetPlaceholder")} value={f.max} onChange={set("max")} className={`${field} mt-1`} />
          </label>
        </div>
        <button type="submit" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-extrabold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Search className="h-4 w-4" /> {t("home.search")}
        </button>
      </form>

      <section id="biens" className="scroll-mt-24 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("home.featured")}</h2>
          <span className="text-sm text-muted-foreground">{t(results.length === 1 ? "home.countOne" : "home.countOther", { n: results.length })}</span>
        </div>
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-medium">{t("home.empty")}</p>
            <button onClick={() => setF(EMPTY)} className="mt-3 text-sm text-primary underline">{t("home.reset")}</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </>
  );
}