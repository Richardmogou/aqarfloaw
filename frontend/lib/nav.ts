import { Building2, CalendarDays, FileText, LayoutDashboard, Users, UserCog, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Menu MVP (Paramètres = phase 2)
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/properties", label: "Biens", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/visits", label: "Visites", icon: CalendarDays },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/team", label: "Équipe", icon: UserCog },
];
