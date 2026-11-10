import { Building2, CalendarDays, ClipboardCheck, FileText, MapPin, Plus, UserCheck, UserPlus, Users, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Thumb } from "@/components/ui/thumb";
import { btn } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { LEADS, PROPERTY_STATUS, VISITS, WORKSPACE_PROPERTIES, conflictIds, isUpcoming } from "@/lib/mock-data";

const TASKS = [
  { icon: UserPlus, title: "Nouvelle demande de contact", sub: "Appartement à Lahore", ago: "Il y a 12 min" },
  { icon: CalendarCheck, title: "Visite confirmée", sub: "Maison à Islamabad", ago: "Il y a 1 h" },
  { icon: ClipboardCheck, title: "Suivi à effectuer", sub: "Client intéressé par une villa", ago: "Il y a 2 h" },
  { icon: UserCheck, title: "Lead attribué à un agent", sub: "Demande pour un terrain", ago: "Il y a 3 h" },
];

export default function DashboardPage() {
  const published = WORKSPACE_PROPERTIES.filter((p) => p.published);
  const available = published.filter((p) => p.status === "available").length;
  const newLeads = LEADS.filter((l) => l.stage === "new").length;
  const unassigned = LEADS.filter((l) => !l.agentId).length;
  const upcoming = VISITS.filter((v) => isUpcoming(v.status)).length;
  const conflicts = conflictIds(VISITS).size;

  return (
    <>
      <PageHeader title="Tableau de bord" description="Un coup d'œil sur votre activité aujourd'hui." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Biens disponibles" value={available} hint={`${published.length} publiés sur ${WORKSPACE_PROPERTIES.length}`} icon={Building2} tone="primary" />
        <StatCard label="Nouvelles demandes" value={newLeads} hint={`${unassigned} sans agent`} icon={Users} tone="success" />
        <StatCard label="Visites à venir" value={upcoming} hint={conflicts ? `${conflicts} en conflit d'horaire` : "Aucun conflit"} icon={CalendarDays} tone="warning" />
        <StatCard label="Deals ouverts" value="—" hint="Module Deals : jour 6" icon={FileText} tone="neutral" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Card title="Tâches récentes" href="/leads">
          <ul className="divide-y divide-border">
            {TASKS.map((t) => (
              <li key={t.title} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{t.sub}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{t.ago}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Biens récents" href="/properties" linkLabel="Voir tous">
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
            <h2 className="text-xl font-semibold leading-snug">Transformons des recherches en nouveaux foyers</h2>
            <p className="mt-2 text-sm opacity-80">AqarFlow accompagne votre agence à chaque étape.</p>
          </div>
          <Link href="/properties/new" className={`${btn.outline} border-transparent text-foreground`}>
            <Plus className="h-4 w-4" /> Ajouter un bien
          </Link>
        </Card>
      </div>
    </>
  );
}