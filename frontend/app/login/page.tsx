import { Building2, CalendarDays, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · AqarFlow" };

const POINTS = [
  { icon: Building2, key: "auth.point1" },
  { icon: Users, key: "auth.point2" },
  { icon: CalendarDays, key: "auth.point3" },
];

export default async function LoginPage({ searchParams }: { searchParams: { next?: string | string[] } }) {
  const next = safeRedirectPath(searchParams.next);
  const user = await getCurrentUser().catch(() => null); // API indisponible : on affiche quand même le formulaire
  if (user) redirect(next);
  const t = await getT();

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau de marque (écrans larges) */}
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <Link href="/" className="relative text-xl font-semibold">AqarFlow</Link>

        <div className="relative max-w-md space-y-8">
          <h2 className="text-4xl font-bold leading-tight">{t("auth.headline")}</h2>
          <ul className="space-y-4">
            {POINTS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3 text-sm text-sidebar-foreground/80">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-foreground/10">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="pt-1.5">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/60">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </aside>

      {/* Formulaire */}
      <section className="relative flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link href="/" className="text-lg font-semibold lg:hidden">AqarFlow</Link>
            <h1 className="text-3xl font-semibold tracking-tight">{t("auth.welcome")}</h1>
            <p className="text-muted-foreground">{t("auth.subtitle")}</p>
          </div>

          <LoginForm next={next} />

          <Link href="/" className="block text-center text-sm text-primary hover:underline">{t("auth.backHome")}</Link>
        </div>
      </section>
    </main>
  );
}