import type { Metadata } from "next";
import { ListingsExplorer } from "@/components/public/listings-explorer";
import { getL } from "@/lib/i18n/server";
import { parseListingParams, type ListingFilters, type PublicPropertyPage } from "@/lib/public-properties";
import { serverApi } from "@/lib/server-api";

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
  const results = await serverApi<PublicPropertyPage>(`/public/properties?${query}`);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{L("Properties in Pakistan", "Biens au Pakistan")}</h1>
      <p className="mt-2 text-muted-foreground">{L("Browse published listings and contact the agent directly.", "Parcourez les annonces publiées et contactez directement l'agent.")}</p>
      <ListingsExplorer filters={filters} results={results} />
    </div>
  );
}
