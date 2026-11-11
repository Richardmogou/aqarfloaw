import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { VisitsView } from "@/features/visits/visits-view";
import { getL } from "@/lib/i18n/server";

export default function VisitsPage() {
  const L = getL();
  return (
    <>
      <PageHeader title={L("Visits", "Visites")} description={L("Schedule and track your visits with ease.", "Planifiez et suivez vos visites en toute simplicité.")}>
        <Link href="/visits/new" className={btn.primary}><Plus className="h-4 w-4" /> {L("Schedule a visit", "Planifier une visite")}</Link>
      </PageHeader>
      <VisitsView />
    </>
  );
}