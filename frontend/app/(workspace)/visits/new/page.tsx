import { PageHeader } from "@/components/ui/page-header";
import { VisitForm } from "@/features/visits/visit-form";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import type { LeadPage } from "@/lib/leads";
import type { AgencyMember, PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";
import type { VisitPage } from "@/lib/visits";

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: { lead?: string; property?: string };
}) {
  const L = getL();
  const [user, propertiesPage, leadsPage, members, upcomingVisits] = await Promise.all([
    requireUser(),
    serverApi<PropertyPage>("/properties?page_size=100"),
    serverApi<LeadPage>("/leads?page_size=100"),
    serverApi<AgencyMember[]>("/users"),
    serverApi<VisitPage>("/visits?group=upcoming"),
  ]);

  return (
    <>
      <PageHeader
        title={L("Schedule a visit", "Planifier une visite")}
        back={{ href: "/visits", label: L("Back to visits", "Retour aux visites") }}
      />
      <VisitForm
        properties={propertiesPage.items}
        leads={leadsPage.items}
        members={members}
        existingVisits={upcomingVisits.items}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
        leadId={searchParams.lead ?? ""}
        propertyId={searchParams.property ?? ""}
      />
    </>
  );
}
