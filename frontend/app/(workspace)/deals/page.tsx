import { PlaceholderPage } from "@/components/placeholder-page";
import { getT } from "@/lib/i18n/server";

export default async function DealsPage() {
  const t = await getT();
  return <PlaceholderPage title={t("workspace.deals.title")} description={t("workspace.deals.description")} day="6" />;
}
