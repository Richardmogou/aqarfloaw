import { HomeExplorer } from "@/components/public/home-explorer";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
      <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        {t("home.titleStart")}<span className="text-primary">{t("home.titleAccent")}</span>{t("home.titleEnd")}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{t("home.subtitle")}</p>
      <HomeExplorer />
    </div>
  );
}