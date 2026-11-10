import { PlaceholderPage } from "@/components/placeholder-page";
import { getT } from "@/lib/i18n/server";

export default async function Page() {
  const t = await getT();
  return <PlaceholderPage title={t("workspace.properties.addTitle")} description={t("workspace.properties.addDesc")} day="3" />;
}
