import { Building2, CalendarDays, FileText, LayoutDashboard, Users, UserCog, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; key: string; icon: LucideIcon };

// Menu MVP (Settings = phase 2)
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/properties", key: "nav.properties", icon: Building2 },
  { href: "/leads", key: "nav.leads", icon: Users },
  { href: "/visits", key: "nav.visits", icon: CalendarDays },
  { href: "/deals", key: "nav.deals", icon: FileText },
  { href: "/team", key: "nav.team", icon: UserCog },
];