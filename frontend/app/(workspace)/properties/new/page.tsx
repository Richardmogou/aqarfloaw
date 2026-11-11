import { PageHeader } from "@/components/ui/page-header";
import { PropertyForm } from "@/features/properties/property-form";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import type { AgencyMember } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function NewPropertyPage() {
  await requireUser("admin");
  const members = await serverApi<AgencyMember[]>("/users");
  const L = getL();
  return (
    <>
      <PageHeader title={L("Add a property", "Ajouter un bien")} back={{ href: "/properties", label: L("Back to properties", "Retour aux biens") }} />
      <PropertyForm members={members} />
    </>
  );
}
