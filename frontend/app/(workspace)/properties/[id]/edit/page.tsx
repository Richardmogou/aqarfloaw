import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PropertyForm } from "@/features/properties/property-form";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import { isUuid, type AgencyMember, type ApiProperty } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  await requireUser("admin");
  const [property, members] = await Promise.all([
    serverApi<ApiProperty>(`/properties/${params.id}`),
    serverApi<AgencyMember[]>("/users"),
  ]);
  const L = getL();
  return (
    <>
      <PageHeader title={L("Edit property", "Modifier le bien")} description={`${property.reference_code} · ${property.title}`} back={{ href: `/properties/${property.id}`, label: L("Back to property", "Retour au bien") }} />
      <PropertyForm property={property} members={members} />
    </>
  );
}
