import { Bell, ChevronDown, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <label className="relative w-full max-w-md">
        <span className="sr-only">Rechercher</span>
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher un bien, un lead, une visite…"
          className="h-9 w-full rounded-full border border-border bg-muted pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button aria-label="Notifications (non lues)" className="relative rounded-md p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden />
        </button>
        <button aria-label="Menu du compte" className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted">
          <Avatar name="Agence Khayber" className="h-9 w-9" />
          <span className="hidden text-sm font-medium sm:block">Agence Khayber</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}