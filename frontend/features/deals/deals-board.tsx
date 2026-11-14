"use client";
import { FileText, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormBanner } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { field } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import type { DealPage } from "@/lib/deals";
import { fmtPkr } from "@/lib/format";
import { useL } from "@/lib/i18n/provider";
import { DEAL_STAGES, DEAL_STAGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DealsBoard({ page }: { page: DealPage }) {
  const L = useL();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [banner, setBanner] = useState("");
  const label = (s: string) => L(DEAL_STAGE[s]?.en ?? s, DEAL_STAGE[s]?.fr ?? s);

  async function moveStage(dealId: string, nextStage: string) {
    setUpdatingId(dealId);
    setBanner("");
    try {
      await api(`/deals/${dealId}/stage`, {
        method: "POST",
        body: JSON.stringify({ stage: nextStage }),
      });
      startTransition(() => router.refresh());
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setBanner(
          L(
            "This property already has a confirmed closed-won deal.",
            "Ce bien possède déjà un deal conclu (Closed won).",
          ),
        );
      } else {
        setBanner(L("Could not update deal stage.", "Impossible de mettre à jour l'étape du deal."));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={L("Open deals", "Deals en cours")} value={page.open_count} icon={FileText} tone="primary" />
        <StatCard
          label={L("Pipeline value", "Valeur du pipeline")}
          value={fmtPkr(Number(page.pipeline_value))}
          hint={L("Sum of open offers", "Somme des offres en cours")}
          icon={Wallet}
          tone="warning"
        />
        <StatCard label={L("Closed won", "Conclus")} value={page.closed_won_count} icon={Trophy} tone="success" />
      </div>

      {banner && (
        <div className="mt-4">
          <FormBanner tone="error">{banner}</FormBanner>
        </div>
      )}

      <div className={cn("mt-6 flex gap-4 overflow-x-auto pb-4 transition-opacity", pending && "opacity-60")}>
        {DEAL_STAGES.map((stage) => {
          const col = page.items.filter((d) => d.stage === stage);
          return (
            <section
              key={stage}
              aria-label={label(stage)}
              className="w-72 shrink-0 rounded-xl border border-border bg-muted/40 p-3"
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{label(stage)}</h2>
                <Badge tone={DEAL_STAGE[stage].tone}>{col.length}</Badge>
              </header>
              <ul className="space-y-3">
                {col.map((d) => {
                  const amount = d.agreed_amount ?? d.offer_amount;
                  const agent = d.agent_name ?? L("Agent", "Agent");
                  return (
                    <li key={d.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                      <Link href={`/deals/${d.id}`} className="block hover:opacity-80">
                        <p className="font-medium">{d.property.title}</p>
                        <p className="text-sm text-muted-foreground">{d.buyer_contact.name}</p>
                        <p className="mt-2 text-sm font-semibold">
                          {amount ? fmtPkr(Number(amount)) : L("No offer yet", "Pas encore d'offre")}
                        </p>
                      </Link>
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar name={agent} className="h-6 w-6 text-[10px]" />
                        <select
                          aria-label={L("Move to stage", "Déplacer vers l'étape")}
                          value={d.stage}
                          disabled={updatingId === d.id}
                          onChange={(e) => moveStage(d.id, e.target.value)}
                          className={`${field} h-8 flex-1 text-xs`}
                        >
                          {DEAL_STAGES.map((s) => (
                            <option key={s} value={s}>{label(s)}</option>
                          ))}
                        </select>
                      </div>
                    </li>
                  );
                })}
                {col.length === 0 && (
                  <li className="px-1 py-4 text-center text-xs text-muted-foreground">
                    {L("No deals", "Aucun deal")}
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
