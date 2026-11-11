import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getL } from "@/lib/i18n/server";
import { AGENTS, DEALS, LEADS, VISITS, WORKSPACE_PROPERTIES, isOpenDeal, isUpcoming } from "@/lib/mock-data";

export default function TeamPage() {
  const L = getL();
  return (
    <>
      <PageHeader title={L("Team", "Équipe")} description={L("Agents of your agency and their current workload.", "Les agents de votre agence et leur charge actuelle.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => {
          const stats: [string, number][] = [
            [L("Properties", "Biens"), WORKSPACE_PROPERTIES.filter((p) => p.agentId === a.id).length],
            [L("Leads", "Prospects"), LEADS.filter((l) => l.agentId === a.id).length],
            [L("Upcoming visits", "Visites à venir"), VISITS.filter((v) => v.agentId === a.id && isUpcoming(v.status)).length],
            [L("Open deals", "Deals en cours"), DEALS.filter((d) => d.agentId === a.id && isOpenDeal(d.stage)).length],
          ];
          return (
            <Card key={a.id}>
              <div className="flex items-center gap-3">
                <Avatar name={a.name} className="h-12 w-12 text-base" />
                <div><p className="font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{L("Agent", "Agent")}</p></div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                {stats.map(([k, n]) => <div key={k}><dd className="text-xl font-semibold">{n}</dd><dt className="text-xs text-muted-foreground">{k}</dt></div>)}
              </dl>
            </Card>
          );
        })}
      </div>
    </>
  );
}