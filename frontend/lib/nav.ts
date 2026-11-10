import { Building2, CalendarDays, FileText, LayoutDashboard, Users, UserCog, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/auth";

export type NavItem = { href: string; label: string; icon: LucideIcon; roles?: Role[] };

// MVP navigation (Settings are planned for phase 2)
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/visits", label: "Visits", icon: CalendarDays },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/team", label: "Team", icon: UserCog, roles: ["admin"] },
];
