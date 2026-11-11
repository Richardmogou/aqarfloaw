import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { LeadsTable } from "@/features/leads/leads-table";
import { getL } from "@/lib/i18n/server";

export default function LeadsPage() {
  const L = getL();
  return (
    <>
      <PageHeader
        title={L("Leads", "Prospects")}
        description={L("Track your leads, assign them to agents and move faster towards a deal.", "Suivez vos prospects, attribuez-les à vos agents et avancez vers une transaction.")}
      >
        <Link href="/leads/new" className={btn.primary}><Plus className="h-4 w-4" /> {L("New lead", "Nouveau prospect")}</Link>
      </PageHeader>
      <LeadsTable />
    </>
  );
}