"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { useL, useT } from "@/lib/i18n/provider";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Skyline } from "./skyline";

export function Sidebar({ onNavigate, className }: { onNavigate?: () => void; className?: string } = {}) {
  const pathname = usePathname();
  const t = useT();
  const L = useL();
  return (
    <aside className={cn("sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-sidebar to-[hsl(222_68%_10%)] text-sidebar-foreground md:flex", className)}>
      <div className="px-6 pb-6 pt-7">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
          <LogoMark size={32} />
          <span>Aqar<span className="text-primary">Flow</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5 inline-block" /></span>
        </Link>
        <p className="mt-2 text-sm leading-snug text-sidebar-foreground/60">{L("Real estate, further together", "L'immobilier plus loin ensemble")}</p>
      </div>
      <nav className="flex flex-col gap-1 px-3" aria-label={t("common.mainNav")}>
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
                active && "bg-gradient-to-r from-sidebar-active to-primary text-sidebar-foreground shadow-lg shadow-black/20",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden /> {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Skyline className="w-full text-sidebar-foreground/20" />
        <p className="px-6 pb-6 pt-4 text-sm leading-snug text-sidebar-foreground/60">{L("Opportunities all across Pakistan", "Des opportunités dans tout le Pakistan")}</p>
      </div>
    </aside>
  );
}
