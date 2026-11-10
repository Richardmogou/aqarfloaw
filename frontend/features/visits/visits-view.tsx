"use client";
import { AlertTriangle, CalendarDays, CheckCircle2, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { btn, td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { fmtDate, fmtTime } from "@/lib/format";
import { VISITS, VISIT_STATUS, agentName, conflictIds, getLead, getProperty, isUpcoming } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const group = (s: string) => (isUpcoming(s) ? "upcoming" : s === "completed" ? "done" : "cancelled");
const TABS = [
  { key: "all", label: "Toutes" }, { key: "upcoming", label: "À venir" },
  { key: "done", label: "Terminées" }, { key: "cancelled", label: "Annulées" },
];

export function VisitsView() {
  const [tab, setTab] = useState("all");
  const conflicts = conflictIds(VISITS);
  const count = (g: string) => VISITS.filter((v) => group(v.status) === g).length;
  const rows = VISITS.filter((v) => tab === "all" || group(v.status) === tab).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="À venir" value={count("upcoming")} hint="Prochaines visites" icon={CalendarDays} tone="primary" />
        <StatCard label="Terminées" value={count("done")} hint="Visites réalisées" icon={CheckCircle2} tone="success" />
        <StatCard label="Annulées" value={count("cancelled")} hint="Annulées ou absents" icon={XCircle} tone="danger" />
        <StatCard label="Total" value={VISITS.length} hint="Toutes les visites" icon={Users} tone="neutral" />
      </div>

      {conflicts.size > 0 && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          {conflicts.size} visites se chevauchent pour un même agent. Modifiez l&apos;horaire ou changez d&apos;agent.
        </p>
      )}

      <div role="tablist" aria-label="Filtrer les visites" className="mb-4 mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr><th className={th}>Date et heure</th><th className={th}>Bien</th><th className={th}>Prospect</th><th className={th}>Agent</th><th className={th}>Statut</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((v) => {
              const p = getProperty(v.propertyId)!;
              const lead = getLead(v.leadId)!;
              const st = VISIT_STATUS[v.status];
              const clash = conflicts.has(v.id);
              return (
                <tr key={v.id} className={cn("border-t border-border", clash && "bg-danger/10")}>
                  <td className={td}>
                    <p className="font-medium">{fmtDate(v.start)}</p>
                    <p className="text-muted-foreground">{fmtTime(v.start)} · {v.minutes} min</p>
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-3"><Thumb src={p.image} alt="" className="h-10 w-14 rounded-md" /><span><span className="block font-medium">{p.title}</span><span className="text-xs text-muted-foreground">{p.city}</span></span></span>
                  </td>
                  <td className={td}><span className="flex items-center gap-2"><Avatar name={lead.name} /><span><span className="block font-medium">{lead.name}</span><span className="text-xs text-muted-foreground">{p.purpose === "sale" ? "Achat" : "Location"}</span></span></span></td>
                  <td className={td}><span className="flex items-center gap-2"><Avatar name={agentName(v.agentId)!} />{agentName(v.agentId)}</span></td>
                  <td className={td}>
                    <span className="flex items-center gap-2">
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {clash && <AlertTriangle className="h-4 w-4 text-danger" aria-label="Conflit d'horaire" />}
                    </span>
                  </td>
                  <td className={td}>
                    {isUpcoming(v.status) ? <button type="button" className={`${btn.outline} px-3 py-1.5`}>Enregistrer le résultat</button>
                      : v.status === "completed" ? <button type="button" className={`${btn.outline} px-3 py-1.5`}>Voir le résultat</button>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Aucune visite dans cette catégorie.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}