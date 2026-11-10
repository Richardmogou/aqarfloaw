"use client";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
          <Home className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">AqarFlow</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Navigation principale">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground",
                active && "bg-white/15 text-sidebar-foreground shadow-sm ring-1 ring-white/10",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", active && "text-primary-foreground")} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-sidebar text-sidebar-foreground md:flex">
      <SidebarNav role={role} />
    </aside>
  );
}
