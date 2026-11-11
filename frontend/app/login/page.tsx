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

export default async function LoginPage({ searchParams }: { searchParams: { next?: string | string[]; expired?: string } }) {  const next = safeRedirectPath(searchParams.next);
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
      <section className="relative flex min-h-screen items-start justify-center overflow-y-auto p-6 pt-16 sm:items-center sm:p-10">
        {/* Arrière-plan dégradé */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.10),transparent_60%)] bg-background" />

        {/* Arrière-plan SVG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img aria-hidden src="/background-loginform.svg" alt="" className="pointer-events-none absolute bottom-0 left-0 right-0 -z-10 w-full object-contain object-bottom opacity-[0.025] dark:opacity-[0.04]" />

        {/* Formes géométriques flottantes */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse [animation-delay:1.5s]" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl animate-pulse [animation-delay:3s]" />
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Branding */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">A</span>
              AqarFlow
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">{t("auth.welcome")}</h1>
            <p className="text-muted-foreground">{t("auth.subtitle")}</p>
          </div>

          {/* Carte formulaire glassmorphism */}
          <div className="rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            {searchParams.expired && (
              <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">{t("auth.expired")}</p>
            )}
            <LoginForm next={next} />
          </div>

          <Link href="/" className="block text-center text-sm text-primary hover:underline">{t("auth.backHome")}</Link>
        </div>
      </section>
    </main>
  );
}