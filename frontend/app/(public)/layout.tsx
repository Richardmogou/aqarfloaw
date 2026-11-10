import { PublicNavbar } from "@/components/public/public-navbar";
import { getT } from "@/lib/i18n/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer id="contact" className="border-t border-border px-4 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:justify-between">
          <span className="font-bold text-foreground">AqarFlow</span>
          <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
        </div>
      </footer>
    </div>
  );
}