import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import { ListingsUnavailable } from "@/components/public/listings-unavailable";
import { getL } from "@/lib/i18n/server";
import { LISTING_CITIES, parseListingParams, type ListingFilters, type PublicPropertyPage } from "@/lib/public-properties";
import { publicApi } from "@/lib/server-api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Properties for sale and rent in Pakistan" };

const PAGE_SIZE = 12;
const API_PARAM: Record<keyof ListingFilters, string> = {
  purpose: "purpose", city: "city", type: "property_type", min: "min_price", max: "max_price",
  beds: "min_bedrooms", q: "q", sort: "sort",
};

export default async function ListingsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const L = getL();
  const { filters, page } = parseListingParams(searchParams);
  const query = new URLSearchParams({ page_size: String(PAGE_SIZE), page });
  for (const key of Object.keys(API_PARAM) as (keyof ListingFilters)[]) {
    if (filters[key]) query.set(API_PARAM[key], filters[key]);
  }
  const results = await publicApi<PublicPropertyPage>(`/public/properties?${query}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">{L("Home", "Accueil")}</Link>
          </li>
          <li aria-hidden="true" className="opacity-40">›</li>
          <li aria-current="page" className="font-semibold text-foreground">
            {L("Listings", "Annonces")}
          </li>
          {filters.city && (
            <>
              <li aria-hidden="true" className="opacity-40">›</li>
              <li className="font-semibold text-primary">{filters.city}</li>
            </>
          )}
        </ol>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {L("100% Verified Agency Listings", "Annonces d'agences 100% vérifiées")}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {L("Properties in Pakistan", "Biens immobiliers au Pakistan")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {L(
              "Browse villas, apartments, and duplexes verified by partner agencies across Islamabad, Lahore, and Karachi.",
              "Parcourez villas, appartements et duplex vérifiés par nos agences partenaires à Islamabad, Lahore et Karachi."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/listings"
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              !filters.city ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card hover:bg-muted text-muted-foreground"
            )}
          >
            {L("All cities", "Toutes les villes")}
          </Link>
          {LISTING_CITIES.map((c) => (
            <Link
              key={c}
              href={`/listings?city=${c}${filters.purpose ? `&purpose=${filters.purpose}` : ""}`}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
                filters.city === c ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card hover:bg-muted text-muted-foreground"
              )}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {results.ok ? (
        <ListingsExplorer filters={filters} results={results.data} />
      ) : (
        <div className="mt-8">
          <ListingsUnavailable retryHref="/listings" />
        </div>
      )}
    </div>
  );
}
