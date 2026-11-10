import { PlaceholderPage } from "@/components/placeholder-page";
import { getT } from "@/lib/i18n/server";

export default async function TeamPage() {
  const t = await getT();
  return <PlaceholderPage title={t("workspace.team.title")} description={t("workspace.team.description")} day="5" />;
}
