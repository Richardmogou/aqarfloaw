import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { btn } from "@/components/ui/styles";
import { PropertiesTable } from "@/features/properties/properties-table";
import { getT } from "@/lib/i18n/server";

export default async function PropertiesPage() {
  const t = await getT();
  return (
    <>
      <PageHeader title={t("workspace.properties.title")} description={t("workspace.properties.description")}>
        <Link href="/properties/new" className={btn.primary}><Plus className="h-4 w-4" /> {t("workspace.properties.add")}</Link>
      </PageHeader>
      <PropertiesTable />
    </>
  );
}
