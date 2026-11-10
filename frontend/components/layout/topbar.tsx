import { Bell, Search } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProfileMenu } from "@/components/layout/profile-menu";
import type { CurrentUser } from "@/lib/auth";

export function Topbar({ user }: { user: CurrentUser }) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-white/60 px-4 backdrop-blur-md dark:bg-black/30 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <label className="relative w-full max-w-md">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search properties, leads, visits..."
            className="h-9 w-full rounded-full border border-white/20 bg-white/50 pl-9 pr-3 text-sm backdrop-blur-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-white/5"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/20 dark:hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden />
        </button>
        <ProfileMenu name={user.full_name} email={user.email} />
      </div>
    </header>
  );
}