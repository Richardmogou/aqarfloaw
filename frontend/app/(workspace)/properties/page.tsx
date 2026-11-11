import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { PropertiesTable } from "@/features/properties/properties-table";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PAGE_SIZE, PROPERTY_FILTERS, propertyQuery, type AgencyMember, type PropertyFilters, type PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function PropertiesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const t = await getT();
  const user = await requireUser();
  const filters: PropertyFilters = Object.fromEntries(
    PROPERTY_FILTERS.flatMap((key) => (typeof searchParams[key] === "string" ? [[key, searchParams[key]]] : [])),
  );
  const [page, members] = await Promise.all([
    serverApi<PropertyPage>(`/properties?page_size=${PAGE_SIZE}&${propertyQuery(filters)}`),
    serverApi<AgencyMember[]>("/users"),
  ]);
  return (
    <>
      <PageHeader title={t("workspace.properties.title")} description={t("workspace.properties.description")}>
        {user.role === "admin" && (
          <Link href="/properties/new" className={btn.primary}><Plus className="h-4 w-4" /> {t("workspace.properties.add")}</Link>
        )}
      </PageHeader>
      <PropertiesTable page={page} members={members} filters={filters} canEdit={user.role === "admin"} />
    </>
  );
}
