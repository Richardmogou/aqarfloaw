import { PageHeader } from "@/components/ui/page-header";
import { LeadForm } from "@/features/leads/lead-form";
import { getL } from "@/lib/i18n/server";

export default function NewLeadPage() {
  const L = getL();
  return (
    <>
      <PageHeader title={L("New lead", "Nouveau prospect")} back={{ href: "/leads", label: L("Back to leads", "Retour aux prospects") }} />
      <LeadForm />
    </>
  );
}