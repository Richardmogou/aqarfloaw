import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { VisitsView } from "@/features/visits/visits-view";

export default function VisitsPage() {
  return (
    <>
      <PageHeader title="Visites" description="Planifiez et suivez vos visites en toute simplicité.">
        <button type="button" className={btn.primary}><Plus className="h-4 w-4" /> Planifier une visite</button>
      </PageHeader>
      <VisitsView />
    </>
  );
}