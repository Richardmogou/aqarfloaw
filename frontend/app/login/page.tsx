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

// Photo provisoire. Pour utiliser votre propre image : placez-la dans public/images/login-building.jpg
// puis remplacez cette valeur par "/images/login-building.jpg".
const HERO_IMAGE = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80";

export default async function LoginPage({ searchParams }: { searchParams: { next?: string | string[] } }) {
  const next = safeRedirectPath(searchParams.next);
  const user = await getCurrentUser().catch(() => null); // API indisponible : on affiche quand même le formulaire
  if (user) redirect(next);
  const t = await getT();

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau image (écrans larges) */}
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/60 to-sidebar/30" />

        <Link href="/" className="relative text-xl font-semibold">AqarFlow</Link>
        <h2 className="relative max-w-md text-4xl font-bold leading-tight">{t("auth.headline")}</h2>
        <p className="relative text-xs text-sidebar-foreground/70">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </aside>

      {/* Formulaire */}
      <section className="relative flex min-h-screen items-start justify-center overflow-y-auto bg-background p-6 pt-16 sm:items-center sm:p-10">
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