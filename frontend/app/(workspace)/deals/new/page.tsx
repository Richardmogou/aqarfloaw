import { PageHeader } from "@/components/ui/page-header";
import { DealForm } from "@/features/deals/deal-form";
import { getL } from "@/lib/i18n/server";

export default function NewDealPage({ searchParams }: { searchParams: { lead?: string } }) {
  const L = getL();
  return (
    <>
      <PageHeader title={L("New deal", "Nouveau deal")} back={{ href: "/deals", label: L("Back to deals", "Retour aux deals") }} />
      <DealForm leadId={searchParams.lead ?? ""} />
    </>
  );
}