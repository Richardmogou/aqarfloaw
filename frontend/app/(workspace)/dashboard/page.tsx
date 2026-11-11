import { Building2, CalendarCheck, CalendarDays, ClipboardList, FileText, Home, MapPin, Plus, UserCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Skyline } from "@/components/layout/skyline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Thumb } from "@/components/ui/thumb";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtPkrFull } from "@/lib/format";
import { getL, getLocale, getT } from "@/lib/i18n/server";
import { DEALS, EN, LEADS, PROPERTY_STATUS, VISITS, conflictIds, isOpenDeal, isUpcoming } from "@/lib/mock-data";
import { coverUrl, type PropertyPage } from "@/lib/properties";
import { serverApi } from "@/lib/server-api";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const t = await getT();
  const L = getL();
  const locale = getLocale();
  const user = await requireUser();
  const [recent, published, availablePublished] = await Promise.all([
    serverApi<PropertyPage>("/properties?page_size=3"),
    serverApi<PropertyPage>("/properties?page_size=1&is_published=true"),
    serverApi<PropertyPage>("/properties?page_size=1&is_published=true&status=available"),
  ]);

  const tasks = [
    { icon: UserPlus, tone: "bg-success/15 text-success", title: L("New contact request", "Nouvelle demande de contact"), sub: L("Apartment in Lahore", "Appartement à Lahore"), ago: L("12 min ago", "Il y a 12 min") },
    { icon: CalendarCheck, tone: "bg-primary/15 text-primary", title: L("Visit confirmed", "Visite confirmée"), sub: L("House in Islamabad", "Maison à Islamabad"), ago: L("1 h ago", "Il y a 1 h") },
    { icon: ClipboardList, tone: "bg-warning/20 text-warning", title: L("Follow-up due", "Suivi à effectuer"), sub: L("Client interested in a villa", "Client intéressé par une villa"), ago: L("2 h ago", "Il y a 2 h") },
    { icon: UserCheck, tone: "bg-violet-500/15 text-violet-600", title: L("Lead assigned to an agent", "Lead attribué à un agent"), sub: L("Request for a plot", "Demande pour un terrain"), ago: L("3 h ago", "Il y a 3 h") },
  ];

  const newLeads = LEADS.filter((l) => l.stage === "new").length;
  const unassigned = LEADS.filter((l) => !l.agentId).length;
  const upcoming = VISITS.filter((v) => isUpcoming(v.status)).length;
  const conflicts = conflictIds(VISITS).size;
  const openDeals = DEALS.filter((d) => isOpenDeal(d.stage)).length;
  const today = fmtDate(new Date().toISOString(), locale);

  return (
    <>
      <PageHeader title={t("workspace.dashboard.title")} description={t("workspace.dashboard.description")}>
        <p className="text-sm font-medium capitalize text-muted-foreground">{today}</p>
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={L("Available properties", "Biens disponibles")} value={availablePublished.total}
          hint={L(`${published.total} published · ${recent.total} in total`, `${published.total} publiés · ${recent.total} au total`)} icon={Building2} tone="primary" />
        <StatCard label={t("workspace.dashboard.newLeads")} value={newLeads} hint={t("workspace.dashboard.noAgent", { n: unassigned })} icon={Users} tone="success" />
        <StatCard label={L("Upcoming visits", "Visites à venir")} value={upcoming}
          hint={conflicts ? L(`${conflicts} schedule conflicts`, `${conflicts} conflits d'horaire`) : L("No schedule conflict", "Aucun conflit d'horaire")} icon={CalendarDays} tone="warning" />
        <StatCard label={t("workspace.dashboard.openDeals")} value={openDeals} hint={L("In progress", "En cours")} icon={FileText} tone="violet" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr_0.85fr]">
        <Card title={L("Recent activity", "Activité récente")} href="/leads" linkLabel={L("View all", "Voir tout")}>
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.title} className="flex items-center gap-4 py-3.5">
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", task.tone)}>
                  <task.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{task.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{task.sub}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{task.ago}</span>
              </li>
            ))}
          </ul>
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
                      {cover ? <Thumb src={cover} alt="" className="h-16 w-20 rounded-xl" />
                        : <span className="grid h-16 w-20 shrink-0 place-items-center rounded-xl bg-muted"><Home className="h-6 w-6 text-muted-foreground" aria-hidden /></span>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{p.title}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden /> {p.city}</p>
                        <p className="mt-0.5 font-bold">{fmtPkrFull(Number(p.price))}{p.purpose === "rent" && <span className="text-sm font-normal text-muted-foreground"> {t("card.perMonth")}</span>}</p>
                      </div>
                      <Badge tone={status?.tone ?? "neutral"}>{L(EN.propertyStatus[p.status] ?? p.status, status?.label ?? p.status)}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <section className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar via-[hsl(220_70%_22%)] to-primary p-7 text-white shadow-sm">
          <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold leading-snug">{t("workspace.dashboard.cta")}</h2>
            <p className="mt-2 text-sm text-white/75">{L("AqarFlow supports your agency at every step.", "AqarFlow accompagne votre agence à chaque étape.")}</p>
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
