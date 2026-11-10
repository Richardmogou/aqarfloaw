import { Building2, CalendarCheck, CalendarDays, ClipboardCheck, FileText, MapPin, Plus, UserCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Thumb } from "@/components/ui/thumb";
import { btn } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { LEADS, PROPERTY_STATUS, VISITS, WORKSPACE_PROPERTIES, conflictIds, isUpcoming } from "@/lib/mock-data";
import { getT } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const t = await getT();

  const TASKS = [
    { icon: UserPlus, title: t("workspace.dashboard.newLead"), sub: t("workspace.dashboard.leadSub1"), ago: t("workspace.dashboard.ago1") },
    { icon: CalendarCheck, title: t("workspace.visits.title"), sub: "Islamabad", ago: t("workspace.dashboard.ago1") },
    { icon: ClipboardCheck, title: t("workspace.leads.title"), sub: t("workspace.dashboard.leadSub2"), ago: t("workspace.dashboard.ago2") },
    { icon: UserCheck, title: t("workspace.dashboard.leadAssigned"), sub: t("workspace.dashboard.leadSub2"), ago: t("workspace.dashboard.ago2") },
  ];

  const published = WORKSPACE_PROPERTIES.filter((p) => p.published);
  const available = published.filter((p) => p.status === "available").length;
  const newLeads = LEADS.filter((l) => l.stage === "new").length;
  const unassigned = LEADS.filter((l) => !l.agentId).length;
  const upcoming = VISITS.filter((v) => isUpcoming(v.status)).length;
  const conflicts = conflictIds(VISITS).size;

  return (
    <>
      <PageHeader title={t("workspace.dashboard.title")} description={t("workspace.dashboard.description")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("nav.properties")} value={available} hint={`${published.length} / ${WORKSPACE_PROPERTIES.length}`} icon={Building2} tone="primary" />
        <StatCard label={t("workspace.dashboard.newLeads")} value={newLeads} hint={t("workspace.dashboard.noAgent", { n: unassigned })} icon={Users} tone="success" />
        <StatCard label={t("nav.visits")} value={upcoming} hint={conflicts ? `${conflicts} conflict` : "No conflict"} icon={CalendarDays} tone="warning" />
        <StatCard label={t("workspace.dashboard.openDeals")} value="—" hint={t("workspace.dashboard.dealHint")} icon={FileText} tone="neutral" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Card title={t("nav.leads")} href="/leads">
          <ul className="divide-y divide-border">
            {TASKS.map((task) => (
              <li key={task.title} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <task.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{task.sub}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{task.ago}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("nav.properties")} href="/properties">
          <ul className="divide-y divide-border">
            {WORKSPACE_PROPERTIES.slice(0, 3).map((p) => (
              <li key={p.id}>
                <Link href={`/properties/${p.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                  <Thumb src={p.image} alt="" className="h-14 w-16 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {p.city}</p>
                    <p className="text-sm font-semibold">{fmtPkr(p.price)}</p>
                  </div>
                  <Badge tone={PROPERTY_STATUS[p.status].tone}>{PROPERTY_STATUS[p.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col justify-between gap-6 border-transparent bg-primary text-primary-foreground">
          <div>
            <h2 className="text-xl font-semibold leading-snug">{t("workspace.dashboard.cta")}</h2>
          </div>
          <Link href="/properties/new" className={`${btn.outline} border-transparent text-foreground`}>
            <Plus className="h-4 w-4" /> {t("workspace.dashboard.ctaBtn")}
          </Link>
        </Card>
      </div>
    </>
  );
}
