"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useT } from "@/lib/i18n/provider";

const LINKS = [
  { href: "/#biens", key: "nav.properties" },
  { href: "/agents", key: "nav.agents" },
  { href: "/services", key: "nav.services" },
  { href: "/a-propos", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold tracking-tight">AqarFlow</Link>

        <nav aria-label={t("common.mainNav")} className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          {/* TODO J2 : /login */}
          <Link href="/login" className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-primary md:block">
            {t("nav.agencySpace")}
          </Link>
          <button
            aria-label={open ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-md p-2 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label={t("common.mobileNav")} className="absolute left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2.5 text-sm hover:bg-muted">
              {t(l.key)}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg border border-primary px-2 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/10">
            {t("nav.agencySpace")}
          </Link>
        </nav>
      )}
    </header>
  );
}