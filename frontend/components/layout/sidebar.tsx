"use client";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-6 text-xl font-semibold">
        <Home className="h-6 w-6" /> AqarFlow
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Navigation principale">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-active/60",
                active && "bg-sidebar-active",
              )}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <SidebarNav />
    </aside>
  );
}
