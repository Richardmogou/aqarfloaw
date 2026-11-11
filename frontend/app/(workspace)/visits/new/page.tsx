import { PageHeader } from "@/components/ui/page-header";
import { VisitForm } from "@/features/visits/visit-form";
import { getL } from "@/lib/i18n/server";

export default function NewVisitPage({ searchParams }: { searchParams: { lead?: string; property?: string } }) {
  const L = getL();
  return (
    <>
      <PageHeader title={L("Schedule a visit", "Planifier une visite")} back={{ href: "/visits", label: L("Back to visits", "Retour aux visites") }} />
      <VisitForm leadId={searchParams.lead ?? ""} propertyId={searchParams.property ?? ""} />
    </>
  );
}