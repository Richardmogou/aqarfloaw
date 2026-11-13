import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { LeadsTable } from "@/features/leads/leads-table";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import { LEAD_FILTERS, LEAD_PAGE_SIZE, leadQuery, type LeadFilters, type LeadPage } from "@/lib/leads";
import type { AgencyMember } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function LeadsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const L = getL();
  const user = await requireUser();
  const filters: LeadFilters = Object.fromEntries(
    LEAD_FILTERS.flatMap((key) => (typeof searchParams[key] === "string" ? [[key, searchParams[key]]] : [])),
  );
  const [page, members] = await Promise.all([
    serverApi<LeadPage>(`/leads?page_size=${LEAD_PAGE_SIZE}&${leadQuery(filters)}`),
    serverApi<AgencyMember[]>("/users"),
  ]);
  return (
    <>
      <PageHeader
        title={L("Leads", "Prospects")}
        description={L("Track your leads, assign them to agents and move faster towards a deal.", "Suivez vos prospects, attribuez-les à vos agents et avancez vers une transaction.")}
      >
        <Link href="/leads/new" className={btn.primary}><Plus className="h-4 w-4" /> {L("New lead", "Nouveau prospect")}</Link>
      </PageHeader>
      <LeadsTable page={page} members={members} filters={filters} isAdmin={user.role === "admin"} />
    </>
  );
}
