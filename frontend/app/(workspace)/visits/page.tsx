import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { VisitsView } from "@/features/visits/visits-view";
import { getT } from "@/lib/i18n/server";

export default async function VisitsPage() {
  const t = await getT();
  return (
    <>
      <PageHeader title={t("workspace.visits.title")} description={t("workspace.visits.description")}>
        <button type="button" className={btn.primary}><Plus className="h-4 w-4" /> {t("workspace.visits.add")}</button>
      </PageHeader>
      <VisitsView />
    </>
  );
}
