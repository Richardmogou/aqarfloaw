import {
  Building2, CalendarCheck, CalendarDays, ClipboardList, FileText, Home, MapPin, Plus, UserCheck, UserPlus, Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Skyline } from "@/components/layout/skyline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Thumb } from "@/components/ui/thumb";
import { requireUser } from "@/lib/auth";
import type { DealPage } from "@/lib/deals";
import { fmtDate, fmtPkrFull, fmtRelative } from "@/lib/format";
import { getL, getLocale, getT } from "@/lib/i18n/server";
import type { LeadPage } from "@/lib/leads";
import { EN, PROPERTY_STATUS } from "@/lib/mock-data";
import { coverUrl, type PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";
import { cn } from "@/lib/utils";
import type { VisitPage } from "@/lib/visits";

export default async function DashboardPage() {
  const t = await getT();
  const L = getL();
  const locale = getLocale();
  const user = await requireUser();
  const [recent, published, availablePublished, newLeadsPage, unassignedPage, recentLeadsPage, visitsPage, dealsPage] =
    await Promise.all([
      serverApi<PropertyPage>("/properties?page_size=3"),
      serverApi<PropertyPage>("/properties?page_size=1&is_published=true"),
      serverApi<PropertyPage>("/properties?page_size=1&is_published=true&status=available"),
      serverApi<LeadPage>("/leads?page_size=1&stage=new"),
      serverApi<LeadPage>("/leads?page_size=1&unassigned=true"),
      serverApi<LeadPage>("/leads?page_size=4"),
      serverApi<VisitPage>("/visits"),
      serverApi<DealPage>("/deals"),
    ]);

  const liveFeed: { id: string; href: string; icon: LucideIcon; tone: string; title: string; sub: string; ago: string }[] = [];

  for (const v of visitsPage.items.slice(0, 2)) {
    liveFeed.push({
      id: `visit-${v.id}`,
      href: "/visits",
      icon: CalendarCheck,
      tone: "bg-primary/15 text-primary",
      title: v.status === "completed"
        ? L("Visit completed", "Visite terminée")
        : L("Visit scheduled", "Visite planifiée"),
      sub: `${v.lead.contact.name} · ${v.property.title}`,
      ago: fmtRelative(v.created_at, locale),
    });
  }

  for (const d of dealsPage.items.slice(0, 2)) {
    liveFeed.push({
      id: `deal-${d.id}`,
      href: `/deals/${d.id}`,
      icon: ClipboardList,
      tone: "bg-warning/20 text-warning",
      title: d.stage === "closed_won"
        ? L("Deal closed won", "Deal conclu")
        : L("Deal in pipeline", "Deal en cours"),
      sub: `${d.buyer_contact.name} · ${d.property.title}`,
      ago: fmtRelative(d.updated_at, locale),
    });
  }

  for (const l of recentLeadsPage.items.slice(0, 3)) {
    liveFeed.push({
      id: `lead-${l.id}`,
      href: `/leads/${l.id}`,
      icon: l.assigned_agent_id ? UserCheck : UserPlus,
      tone: l.assigned_agent_id ? "bg-violet-500/15 text-violet-600" : "bg-success/15 text-success",
      title: l.assigned_agent_id
        ? L("Lead assigned to an agent", "Lead attribué à un agent")
        : L("New contact request", "Nouvelle demande de contact"),
      sub: `${l.contact.name}${l.property ? ` · ${l.property.title}` : ""}`,
      ago: fmtRelative(l.created_at, locale),
    });
  }

  const tasks = liveFeed.slice(0, 4);

  const newLeads = newLeadsPage.total;
  const unassigned = unassignedPage.total;
  const upcoming = visitsPage.upcoming_count;
  const conflicts = visitsPage.conflict_count;
  const openDeals = dealsPage.open_count;
  const today = fmtDate(new Date().toISOString(), locale);

  return (
    <>
      <PageHeader title={t("workspace.dashboard.title")} description={t("workspace.dashboard.description")}>
        <p className="text-sm font-medium capitalize text-muted-foreground">{today}</p>
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={L("Available properties", "Biens disponibles")}
          value={availablePublished.total}
          hint={L(`${published.total} published · ${recent.total} in total`, `${published.total} publiés · ${recent.total} au total`)}
          icon={Building2}
          tone="primary"
        />
        <StatCard
          label={t("workspace.dashboard.newLeads")}
          value={newLeads}
          hint={t("workspace.dashboard.noAgent", { n: unassigned })}
          icon={Users}
          tone="success"
        />
        <StatCard
          label={L("Upcoming visits", "Visites à venir")}
          value={upcoming}
          hint={conflicts ? L(`${conflicts} schedule conflicts`, `${conflicts} conflits d'horaire`) : L("No schedule conflict", "Aucun conflit d'horaire")}
          icon={CalendarDays}
          tone="warning"
        />
        <StatCard
          label={t("workspace.dashboard.openDeals")}
          value={openDeals}
          hint={L(`${dealsPage.closed_won_count} closed won`, `${dealsPage.closed_won_count} conclus`)}
          icon={FileText}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
        <Card title={L("Recent activity", "Activité récente")} href="/leads" linkLabel={L("View all", "Voir tout")}>
          {tasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {L("No recent activity yet.", "Aucune activité récente pour le moment.")}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link href={task.href} className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-muted/60">
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", task.tone)}>
                      <task.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{task.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{task.sub}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{task.ago}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={L("Recent properties", "Biens récents")} href="/properties" linkLabel={L("View all", "Voir tout")}>
          {recent.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{L("No property yet.", "Aucun bien pour le moment.")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.items.map((p) => {
                const cover = coverUrl(p);
                const status = PROPERTY_STATUS[p.status];
                return (
                  <li key={p.id}>
                    <Link href={`/properties/${p.id}`} className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-muted/60">
                      {cover ? (
                        <Thumb src={cover} alt="" className="h-16 w-20 rounded-xl" />
                      ) : (
                        <span className="grid h-16 w-20 shrink-0 place-items-center rounded-xl bg-muted">
                          <Home className="h-6 w-6 text-muted-foreground" aria-hidden />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{p.title}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden /> {p.city}
                        </p>
                        <p className="mt-0.5 font-bold">
                          {fmtPkrFull(Number(p.price))}
                          {p.purpose === "rent" && <span className="text-sm font-normal text-muted-foreground"> {t("card.perMonth")}</span>}
                        </p>
                      </div>
                      <Badge tone={status?.tone ?? "neutral"}>{L(EN.propertyStatus[p.status] ?? p.status, status?.label ?? p.status)}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <section className="relative flex min-h-[320px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar via-[hsl(220_70%_22%)] to-primary p-7 text-white shadow-sm">
          <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold leading-snug">{t("workspace.dashboard.cta")}</h2>
            <p className="mt-2 text-sm text-white/75">
              {L("AqarFlow supports your agency at every step.", "AqarFlow accompagne votre agence à chaque étape.")}
            </p>
          </div>
          <Skyline className="pointer-events-none absolute inset-x-0 bottom-20 w-full text-white/15" />
          {user.role === "admin" ? (
            <Link href="/properties/new" className="relative inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90">
              <Plus className="h-5 w-5" aria-hidden /> {t("workspace.dashboard.ctaBtn")}
            </Link>
          ) : (
            <Link href="/properties" className="relative inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90">
              <Building2 className="h-5 w-5" aria-hidden /> {L("Browse properties", "Voir les biens")}
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
