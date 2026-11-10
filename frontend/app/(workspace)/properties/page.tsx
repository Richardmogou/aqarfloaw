import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { PropertiesTable } from "@/features/properties/properties-table";

export default function PropertiesPage() {
  return (
    <>
      <PageHeader title="Biens" description="Gérez vos annonces et suivez leur performance facilement.">
        <Link href="/properties/new" className={btn.primary}><Plus className="h-4 w-4" /> Ajouter un bien</Link>
      </PageHeader>
      <PropertiesTable />
    </>
  );
}