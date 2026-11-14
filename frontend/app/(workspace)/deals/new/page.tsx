import { PageHeader } from "@/components/ui/page-header";
import { DealForm } from "@/features/deals/deal-form";
import { requireUser } from "@/lib/auth";
import type { DealPage } from "@/lib/deals";
import { getL } from "@/lib/i18n/server";
import type { LeadPage } from "@/lib/leads";
import type { AgencyMember, PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const L = getL();
  const [user, leadsPage, propertiesPage, members, dealsPage] = await Promise.all([
    requireUser(),
    serverApi<LeadPage>("/leads?page_size=100"),
    serverApi<PropertyPage>("/properties?page_size=100"),
    serverApi<AgencyMember[]>("/users"),
    serverApi<DealPage>("/deals"),
  ]);

  return (
    <>
      <PageHeader
        title={L("New deal", "Nouveau deal")}
        back={{ href: "/deals", label: L("Back to deals", "Retour aux deals") }}
      />
      <DealForm
        leads={leadsPage.items}
        properties={propertiesPage.items}
        members={members}
        existingDeals={dealsPage.items}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
        leadId={searchParams.lead ?? ""}
      />
    </>
  );
}
