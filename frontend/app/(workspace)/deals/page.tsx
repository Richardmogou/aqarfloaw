import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { DealsBoard } from "@/features/deals/deals-board";
import { getL, getT } from "@/lib/i18n/server";

export default async function DealsPage() {
  const t = await getT();
  const L = getL();
  return (
    <>
      <PageHeader title={t("workspace.deals.title")} description={t("workspace.deals.description")}>
        <Link href="/deals/new" className={btn.primary}><Plus className="h-4 w-4" aria-hidden /> {L("New deal", "Nouveau deal")}</Link>
      </PageHeader>
      <DealsBoard />
    </>
  );
}
