"use client";
import { ChevronLeft, ChevronRight, LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
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
  const [view, setView] = useState<"grid" | "list">("list");
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

  const label = "block text-xs font-semibold text-foreground/80 uppercase tracking-wider";
  const seg = (active: boolean) =>
    cn("flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all", active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
      <div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
            <span>{L("Filters & Search", "Filtres & Recherche")}</span>
          </span>
          {chips.length > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              {chips.length}
            </span>
          )}
        </button>

        <aside
          aria-label={L("Filters", "Filtres")}
          className={cn(
            "mt-3 space-y-6 rounded-2xl border border-border/80 bg-card p-5 shadow-sm lg:sticky lg:top-24 lg:mt-0 lg:block",
            showFilters ? "block" : "hidden"
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>{L("Filters", "Filtres")}</span>
            </span>
            {chips.length > 0 && (
              <button
                type="button"
                onClick={() => setF(EMPTY)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{L("Reset", "Effacer")}</span>
              </button>
            )}
          </div>

          <div role="radiogroup" aria-label={L("Buy or rent", "Acheter ou louer")} className="flex rounded-xl bg-muted/60 p-1 border border-border/50">
            {[["", L("All", "Tous")], ["sale", L("Buy", "Acheter")], ["rent", L("Rent", "Louer")]].map(([v, text]) => (
              <button key={v} type="button" role="radio" aria-checked={f.purpose === v} onClick={() => update({ purpose: v })} className={seg(f.purpose === v)}>
                {text}
              </button>
            ))}
          </div>

          <div>
            <label className={label}>{L("Keyword / Search", "Mot-clé / Recherche")}</label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={f.q}
                onChange={(e) => update({ q: e.target.value })}
                maxLength={80}
                placeholder={L("Area, project, reference…", "Secteur, projet, réf…")}
                className={cn(field, "w-full pl-10")}
              />
            </div>
          </div>

          <div>
            <label className={label}>{L("City", "Ville")}</label>
            <select value={f.city} onChange={(e) => update({ city: e.target.value })} className={cn(field, "mt-1.5 w-full")}>
              <option value="">{L("All cities in Pakistan", "Toutes les villes")}</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={label}>{L("Property type", "Type de bien")}</label>
            <select value={f.type} onChange={(e) => update({ type: e.target.value })} className={cn(field, "mt-1.5 w-full")}>
              <option value="">{L("All property types", "Tous les types")}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
            </select>
          </div>

          <fieldset>
            <legend className={label}>{L("Bedrooms", "Chambres")}</legend>
            <div className="mt-2 flex gap-1.5">
              {["", "1", "2", "3", "4", "5"].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={f.beds === n}
                  onClick={() => update({ beds: n })}
                  className={cn(
                    "h-9 flex-1 rounded-xl border text-xs font-semibold transition-all",
                    f.beds === n ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card hover:bg-muted text-muted-foreground"
                  )}
                >
                  {n ? `${n}+` : L("Any", "Tous")}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <span className={label}>{L("Price range (PKR)", "Fourchette de prix (PKR)")}</span>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              <div>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={f.min}
                  placeholder={L("Min", "Min")}
                  onChange={(e) => update({ min: amount(e.target.value) })}
                  className={cn(field, "w-full text-xs")}
                />
                {Number(f.min) > 0 && <span className="mt-1 block text-[11px] font-medium text-foreground">{fmtPkr(Number(f.min))}</span>}
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={f.max}
                  placeholder={L("Max", "Max")}
                  onChange={(e) => update({ max: amount(e.target.value) })}
                  className={cn(field, "w-full text-xs")}
                />
                {Number(f.max) > 0 && <span className="mt-1 block text-[11px] font-medium text-foreground">{fmtPkr(Number(f.max))}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setF(EMPTY)}
            className="w-full rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {L("Clear all filters", "Réinitialiser tous les filtres")}
          </button>
        </aside>
      </div>

      <section aria-label={L("Results", "Résultats")} aria-busy={pending} className={cn("transition-opacity", pending && "opacity-60")}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-extrabold text-foreground text-base">{results.total}</span>{" "}
              {results.total === 1 ? L("property available", "bien disponible") : L("properties available", "biens disponibles")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>{L("Sort:", "Trier :")}</span>
              <select
                value={f.sort}
                onChange={(e) => update({ sort: e.target.value })}
                className={cn(field, "h-9 rounded-lg text-xs font-semibold text-foreground")}
              >
                <option value="newest">{L("Newest first", "Plus récents d'abord")}</option>
                <option value="price_asc">{L("Price: Low to High", "Prix croissant")}</option>
                <option value="price_desc">{L("Price: High to Low", "Prix décroissant")}</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              <button
                type="button"
                aria-label={L("Grid view", "Vue grille")}
                onClick={() => setView("grid")}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                  view === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={L("List view", "Vue liste")}
                onClick={() => setView("list")}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                  view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            <li className="text-xs font-semibold text-muted-foreground mr-1">{L("Active filters:", "Filtres actifs :")}</li>
            {chips.map(([key, text]) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => update({ [key]: "" })}
                  aria-label={`${L("Remove filter", "Retirer le filtre")}: ${text}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition"
                >
                  <span>{text}</span>
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {results.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center shadow-sm">
            <p className="text-lg font-bold text-foreground">
              {L("No property matches your search criteria.", "Aucun bien ne correspond à vos critères de recherche.")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {L("Try broadening your price range or clearing some filters.", "Essayez d'élargir la fourchette de prix ou de retirer certains filtres.")}
            </p>
            <button
              type="button"
              onClick={() => setF(EMPTY)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{L("Reset all filters", "Réinitialiser tous les filtres")}</span>
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {results.items.map((p) => (
              <PropertyCard key={p.slug} p={p} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {results.items.map((p) => (
              <PropertyCard key={p.slug} p={p} layout="list" />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label={L("Previous page", "Page précédente")}
              disabled={current === 1 || pending}
              onClick={() => go(f, current - 1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === current ? "page" : undefined}
                disabled={pending}
                onClick={() => go(f, n)}
                className={cn(
                  "h-10 min-w-10 rounded-xl border px-3.5 text-sm font-semibold shadow-sm transition",
                  n === current
                    ? "border-primary bg-primary text-primary-foreground shadow-primary/20"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label={L("Next page", "Page suivante")}
              disabled={current === pages || pending}
              onClick={() => go(f, current + 1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
