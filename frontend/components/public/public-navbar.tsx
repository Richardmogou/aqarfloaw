"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { btn } from "@/components/ui/styles";
import { useL } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/listings?purpose=sale", en: "Buy", fr: "Acheter" },
  { href: "/listings?purpose=rent", en: "Rent", fr: "Louer" },
  { href: "/agents", en: "Agents", fr: "Agents" },
  { href: "/services", en: "Services", fr: "Services" },
  { href: "/about", en: "About", fr: "À propos" },
  { href: "/contact", en: "Contact", fr: "Contact" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const L = useL();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight">AqarFlow</Link>

        <nav aria-label={L("Main navigation", "Navigation principale")} className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {L(l.en, l.fr)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex"><LocaleSwitcher /><ThemeToggle /></div>
          <Link href="/login" className={cn(btn.primary, "hidden px-4 py-2 sm:inline-flex")}>{L("Agency portal", "Espace agence")}</Link>
          <button
            type="button"
            aria-label={open ? L("Close menu", "Fermer le menu") : L("Open menu", "Ouvrir le menu")}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-md p-2 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label={L("Mobile menu", "Menu mobile")} className="border-t border-border px-4 py-3 lg:hidden">
          {[...LINKS, { href: "/login", en: "Agency portal", fr: "Espace agence" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2.5 text-sm font-medium hover:bg-muted">
              {L(l.en, l.fr)}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 sm:hidden"><LocaleSwitcher /><ThemeToggle /></div>
        </nav>
      )}
    </header>
  );
}