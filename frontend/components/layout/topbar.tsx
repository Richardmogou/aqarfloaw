import { Bell, Search } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProfileMenu } from "@/components/layout/profile-menu";
import type { CurrentUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";

export function Topbar({ user }: { user: CurrentUser }) {
  const L = getL();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MobileNav />
        <label className="relative w-full max-w-xl">
          <span className="sr-only">{L("Search", "Rechercher")}</span>
          <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder={L("Search a property, a lead, a visit…", "Rechercher un bien, un lead, une visite…")}
            className="h-10 w-full rounded-full border border-border bg-muted/60 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label={L("Notifications", "Notifications")} className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" aria-hidden />
        </button>
        <ProfileMenu name={user.full_name} email={user.email} />
      </div>
    </header>
  );
}
