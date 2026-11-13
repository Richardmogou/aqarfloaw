import { PageHeader } from "@/components/ui/page-header";
import { LeadForm } from "@/features/leads/lead-form";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import type { AgencyMember, PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function NewLeadPage() {
  const L = getL();
  const [user, propertiesPage, members] = await Promise.all([
    requireUser(),
    serverApi<PropertyPage>("/properties?page_size=100"),
    serverApi<AgencyMember[]>("/users"),
  ]);
  return (
    <>
      <PageHeader title={L("New lead", "Nouveau prospect")} back={{ href: "/leads", label: L("Back to leads", "Retour aux prospects") }} />
      <LeadForm properties={propertiesPage.items} members={members} isAdmin={user.role === "admin"} />
    </>
  );
}
