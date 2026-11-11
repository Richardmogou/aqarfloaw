"use client";
import { FileText, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { field } from "@/components/ui/styles";
import { fmtPkr } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import { DEALS, DEAL_STAGES, DEAL_STAGE, agentName, getLead, getProperty, isOpenDeal } from "@/lib/mock-data";

export function DealsBoard() {
  const L = useL();
  const [stages, setStages] = useState<Record<number, string>>(() => Object.fromEntries(DEALS.map((d) => [d.id, d.stage])));
  const stageOf = (id: number) => stages[id];
  const label = (s: string) => L(DEAL_STAGE[s].en, DEAL_STAGE[s].fr);

  const open = DEALS.filter((d) => isOpenDeal(stageOf(d.id)));
  const pipeline = open.reduce((sum, d) => sum + (d.offer ?? 0), 0);
  const won = DEALS.filter((d) => stageOf(d.id) === "closed_won").length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={L("Open deals", "Deals en cours")} value={open.length} icon={FileText} tone="primary" />
        <StatCard label={L("Pipeline value", "Valeur du pipeline")} value={fmtPkr(pipeline)} hint={L("Sum of open offers", "Somme des offres en cours")} icon={Wallet} tone="warning" />
        <StatCard label={L("Closed won", "Conclus")} value={won} icon={Trophy} tone="success" />
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const col = DEALS.filter((d) => stageOf(d.id) === stage);
          return (
            <section key={stage} aria-label={label(stage)} className="w-72 shrink-0 rounded-xl border border-border bg-muted/40 p-3">
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{label(stage)}</h2>
                <Badge tone={DEAL_STAGE[stage].tone}>{col.length}</Badge>
              </header>
              <ul className="space-y-3">
                {col.map((d) => {
                  const p = getProperty(d.propertyId)!;
                  const lead = getLead(d.leadId)!;
                  return (
                    <li key={d.id} className="rounded-lg border border-border bg-card p-3">
                      <Link href={`/deals/${d.id}`} className="block hover:opacity-80">
                        <p className="font-medium">{p.title}</p>
                        <p className="text-sm text-muted-foreground">{lead.name}</p>
                        <p className="mt-2 text-sm font-semibold">{d.offer ? fmtPkr(d.offer) : L("No offer yet", "Pas encore d'offre")}</p>
                      </Link>
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar name={agentName(d.agentId)!} className="h-6 w-6 text-[10px]" />
                        <select aria-label={L("Move to stage", "Déplacer vers l'étape")} value={stageOf(d.id)}
                          onChange={(e) => setStages((s) => ({ ...s, [d.id]: e.target.value }))} className={`${field} h-8 flex-1 text-xs`}>
                          {DEAL_STAGES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                        </select>
                      </div>
                    </li>
                  );
                })}
                {col.length === 0 && <li className="px-1 py-4 text-center text-xs text-muted-foreground">{L("No deals", "Aucun deal")}</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}