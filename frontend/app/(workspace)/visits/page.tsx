import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { VisitsView } from "@/features/visits/visits-view";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import { serverApi } from "@/lib/server-api";
import type { VisitPage } from "@/lib/visits";

export default async function VisitsPage() {
  const L = getL();
  await requireUser();
  const page = await serverApi<VisitPage>("/visits");
  return (
    <>
      <PageHeader
        title={L("Visits", "Visites")}
        description={L("Schedule and track your visits with ease.", "Planifiez et suivez vos visites en toute simplicité.")}
      >
        <Link href="/visits/new" className={btn.primary}>
          <Plus className="h-4 w-4" aria-hidden /> {L("Schedule a visit", "Planifier une visite")}
        </Link>
      </PageHeader>
      <VisitsView page={page} />
    </>
  );
}
