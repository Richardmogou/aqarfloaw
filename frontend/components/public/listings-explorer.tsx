"use client";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { field } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { useL, useT } from "@/lib/i18n/provider";
import {
  EMPTY_LISTING_FILTERS as EMPTY, LISTING_CITIES as CITIES, LISTING_TYPES as TYPES, priceAmount as amount,
  type ListingFilters as Filters, type PublicPropertyPage,
} from "@/lib/public-properties";
import { cn } from "@/lib/utils";
import { PropertyCard } from "./property-card";

const FILTER_DEBOUNCE_MS = 400;

function listingsUrl(pathname: string, filters: Filters, page = 1) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && !(key === "sort" && value === "newest")) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function ListingsExplorer({ filters, results }: { filters: Filters; results: PublicPropertyPage }) {
  const L = useL();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState<Filters>(filters);
  const [showFilters, setShowFilters] = useState(false);
  const applied = useRef(JSON.stringify(filters));
  const update = (patch: Partial<Filters>) => setF((s) => ({ ...s, ...patch }));
  const go = (next: Filters, page = 1) => startTransition(() => router.replace(listingsUrl(pathname, next, page), { scroll: false }));

  useEffect(() => {
    const key = JSON.stringify(f);
    if (key === applied.current) return;
    const timer = setTimeout(() => { applied.current = key; go(f); }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f]);

  const pages = Math.max(1, Math.ceil(results.total / results.page_size));
  const current = results.page;

  const chips: [keyof Filters, string][] = [];
  if (f.purpose) chips.push(["purpose", f.purpose === "sale" ? L("For sale", "À vendre") : L("For rent", "À louer")]);
  if (f.city) chips.push(["city", f.city]);
  if (f.type) chips.push(["type", t(`type.${f.type}`)]);
  if (f.beds) chips.push(["beds", `${f.beds}+ ${L("beds", "ch.")}`]);
  if (f.min) chips.push(["min", `≥ ${fmtPkr(Number(f.min))}`]);
  if (f.max) chips.push(["max", `≤ ${fmtPkr(Number(f.max))}`]);
  if (f.q) chips.push(["q", `“${f.q}”`]);

  const label = "block text-xs font-medium text-muted-foreground";
  const seg = (active: boolean) =>
    cn("flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <button type="button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium lg:hidden">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" aria-hidden /> {L("Filters", "Filtres")}</span>
          {chips.length > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{chips.length}</span>}
        </button>

        <aside aria-label={L("Filters", "Filtres")} className={cn("mt-3 space-y-5 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:mt-0 lg:block", showFilters ? "block" : "hidden")}>
          <div role="radiogroup" aria-label={L("Buy or rent", "Acheter ou louer")} className="flex rounded-lg bg-muted p-1">
            {[["", L("All", "Tous")], ["sale", L("Buy", "Acheter")], ["rent", L("Rent", "Louer")]].map(([v, text]) => (
              <button key={v} type="button" role="radio" aria-checked={f.purpose === v} onClick={() => update({ purpose: v })} className={seg(f.purpose === v)}>{text}</button>
            ))}
          </div>
          <label className={label}>{L("Keyword", "Mot-clé")}
            <input value={f.q} onChange={(e) => update({ q: e.target.value })} maxLength={80} placeholder={L("Area, title…", "Zone, titre…")} className={`${field} mt-1 w-full`} />
          </label>
          <label className={label}>{L("City", "Ville")}
            <select value={f.city} onChange={(e) => update({ city: e.target.value })} className={`${field} mt-1 w-full`}>
              <option value="">{L("All cities", "Toutes les villes")}</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={label}>{L("Property type", "Type de bien")}
            <select value={f.type} onChange={(e) => update({ type: e.target.value })} className={`${field} mt-1 w-full`}>
              <option value="">{L("All types", "Tous les types")}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
            </select>
          </label>
          <fieldset>
            <legend className={label}>{L("Bedrooms", "Chambres")}</legend>
            <div className="mt-1 flex gap-1.5">
              {["", "1", "2", "3", "4", "5"].map((n) => (
                <button key={n} type="button" aria-pressed={f.beds === n} onClick={() => update({ beds: n })}
                  className={cn("h-9 flex-1 rounded-md border text-sm", f.beds === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted")}>
                  {n ? `${n}+` : L("Any", "Tous")}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>{L("Min price (PKR)", "Prix min (PKR)")}
              <input type="number" min={0} inputMode="numeric" value={f.min} onChange={(e) => update({ min: amount(e.target.value) })} className={`${field} mt-1 w-full`} />
              {Number(f.min) > 0 && <span className="mt-1 block text-foreground">{fmtPkr(Number(f.min))}</span>}
            </label>
            <label className={label}>{L("Max price (PKR)", "Prix max (PKR)")}
              <input type="number" min={0} inputMode="numeric" value={f.max} onChange={(e) => update({ max: amount(e.target.value) })} className={`${field} mt-1 w-full`} />
              {Number(f.max) > 0 && <span className="mt-1 block text-foreground">{fmtPkr(Number(f.max))}</span>}
            </label>
          </div>
          <button type="button" onClick={() => setF(EMPTY)} className="text-sm font-medium text-primary hover:underline">{L("Reset all filters", "Réinitialiser les filtres")}</button>
        </aside>
      </div>

      <section aria-label={L("Results", "Résultats")} aria-busy={pending} className={cn("transition-opacity", pending && "opacity-60")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium" aria-live="polite">
            {results.total} {results.total === 1 ? L("property", "bien") : L("properties", "biens")}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {L("Sort by", "Trier par")}
            <select value={f.sort} onChange={(e) => update({ sort: e.target.value })} className={field}>
              <option value="newest">{L("Newest", "Plus récents")}</option>
              <option value="price_asc">{L("Price: low to high", "Prix croissant")}</option>
              <option value="price_desc">{L("Price: high to low", "Prix décroissant")}</option>
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {chips.map(([key, text]) => (
              <li key={key}>
                <button type="button" onClick={() => update({ [key]: "" })} aria-label={`${L("Remove filter", "Retirer le filtre")}: ${text}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:bg-muted">
                  {text} <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {results.items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-medium">{L("No property matches your search.", "Aucun bien ne correspond à votre recherche.")}</p>
            <button type="button" onClick={() => setF(EMPTY)} className="mt-3 text-sm text-primary underline">{L("Reset filters", "Réinitialiser les filtres")}</button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">{results.items.map((p) => <PropertyCard key={p.slug} p={p} layout="list" />)}</div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
            <button type="button" aria-label={L("Previous page", "Page précédente")} disabled={current === 1 || pending} onClick={() => go(f, current - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-current={n === current ? "page" : undefined} disabled={pending} onClick={() => go(f, n)}
                className={cn("h-9 min-w-9 rounded-lg border px-3 text-sm", n === current ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted")}>{n}</button>
            ))}
            <button type="button" aria-label={L("Next page", "Page suivante")} disabled={current === pages || pending} onClick={() => go(f, current + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </nav>
        )}
      </section>
    </div>
  );
}
