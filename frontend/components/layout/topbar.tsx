import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <label className="relative w-full max-w-md">
        <span className="sr-only">Search</span>
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search properties, leads, visits..."
          className="h-9 w-full rounded-md border border-border bg-muted pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button aria-label="Notifications" className="rounded-md p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
