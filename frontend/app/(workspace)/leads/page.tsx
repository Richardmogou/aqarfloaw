import { PageHeader } from "@/components/ui/page-header";
import { LeadsTable } from "@/features/leads/leads-table";
import { getT } from "@/lib/i18n/server";

export default async function LeadsPage() {
  const t = await getT();
  return (
    <>
      <PageHeader title={t("workspace.leads.title")} description={t("workspace.leads.description")} />
      <LeadsTable />
    </>
  );
}
