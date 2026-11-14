"use client";
import {
  AlertTriangle, CalendarDays, CheckCircle2, Home, Loader2, MapPin, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { inputCls, textareaCls } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { btn, td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/format";
import { useL, useLocale, useT } from "@/lib/i18n/provider";
import { leadPropertyCover } from "@/lib/leads";
import { cn } from "@/lib/utils";
import {
  VISIT_STATUS_META, isUpcomingVisit, visitGroup, type ApiVisit, type VisitPage,
} from "@/lib/visits";

export function VisitsView({ page }: { page: VisitPage }) {
  const t = useT();
  const L = useL();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState("all");
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"completed" | "cancelled" | "no_show">("completed");
  const [outcomeText, setOutcomeText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const rows = page.items.filter((v) => tab === "all" || visitGroup(v.status) === tab);

  const TABS = [
    { key: "all", label: t("workspace.visits.tabAll") },
    { key: "upcoming", label: t("workspace.visits.tabUpcoming") },
    { key: "done", label: t("workspace.visits.tabDone") },
    { key: "cancelled", label: t("workspace.visits.tabCancelled") },
  ];

  function openResultDrawer(visit: ApiVisit) {
    if (activeVisitId === visit.id) {
      setActiveVisitId(null);
      return;
    }
    setActiveVisitId(visit.id);
    setResultStatus(
      visit.status === "cancelled" || visit.status === "no_show" ? visit.status : "completed",
    );
    setOutcomeText(visit.outcome ?? "");
  }

  async function confirmVisit(visitId: string) {
    setSavingId(visitId);
    try {
      await api(`/visits/${visitId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "confirmed" }),
      });
      startTransition(() => router.refresh());
    } finally {
      setSavingId(null);
    }
  }

  async function submitOutcome(visitId: string) {
    setSavingId(visitId);
    try {
      await api(`/visits/${visitId}/complete`, {
        method: "POST",
        body: JSON.stringify({
          status: resultStatus,
          outcome: outcomeText.trim() || null,
        }),
      });
      setActiveVisitId(null);
      startTransition(() => router.refresh());
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("workspace.visits.statUpcoming")}
          value={page.upcoming_count}
          hint={t("workspace.visits.statUpcomingHint")}
          icon={CalendarDays}
          tone="primary"
        />
        <StatCard
          label={t("workspace.visits.statDone")}
          value={page.completed_count}
          hint={t("workspace.visits.statDoneHint")}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label={t("workspace.visits.statCancelled")}
          value={page.cancelled_count}
          hint={t("workspace.visits.statCancelledHint")}
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          label={t("workspace.visits.statTotal")}
          value={page.total}
          hint={t("workspace.visits.statTotalHint")}
          icon={Users}
          tone="neutral"
        />
      </div>

      {page.conflict_count > 0 && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          {t("workspace.visits.conflict", { n: page.conflict_count })}
        </p>
      )}

      <div role="tablist" aria-label={t("workspace.visits.title")} className="mb-4 mt-6 flex flex-wrap gap-2">
        {TABS.map((tab_) => (
          <button
            key={tab_.key}
            role="tab"
            aria-selected={tab === tab_.key}
            onClick={() => setTab(tab_.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === tab_.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {tab_.label}
          </button>
        ))}
      </div>

      <div className={cn("overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm transition-opacity", pending && "opacity-60")}>
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={th}>{t("workspace.visits.colDateTime")}</th>
              <th className={th}>{t("workspace.visits.colProperty")}</th>
              <th className={th}>{t("workspace.visits.colLead")}</th>
              <th className={th}>{t("workspace.visits.colAgent")}</th>
              <th className={th}>{t("workspace.visits.colStatus")}</th>
              <th className={cn(th, "text-right")}>{L("Actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const p = v.property;
              const cover = leadPropertyCover(p);
              const st = VISIT_STATUS_META[v.status] ?? { en: v.status, fr: v.status, tone: "neutral" as const };
              const clash = v.has_conflict;
              const agent = v.agent_name ?? L("Agent", "Agent");
              const isOpenDrawer = activeVisitId === v.id;
              return (
                <Fragment key={v.id}>
                  <tr className={cn("border-t border-border transition-colors hover:bg-muted/30", clash && "bg-danger/10")}>
                    <td className={td}>
                      <p className="font-semibold">{fmtDate(v.starts_at, locale)}</p>
                      <p className="text-muted-foreground">{fmtTime(v.starts_at)} · {v.duration_minutes} min</p>
                      {v.meeting_point && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" aria-hidden /> {v.meeting_point}
                        </p>
                      )}
                    </td>
                    <td className={td}>
                      <Link href={`/properties/${p.id}`} className="group flex items-center gap-3">
                        {cover ? (
                          <Thumb src={cover} alt="" className="h-11 w-14 rounded-lg" />
                        ) : (
                          <span className="grid h-11 w-14 shrink-0 place-items-center rounded-lg bg-muted">
                            <Home className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold group-hover:text-primary">{p.title}</span>
                          <span className="text-xs text-muted-foreground">{p.city}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={td}>
                      <Link href={`/leads/${v.lead.id}`} className="flex items-center gap-2.5 hover:underline">
                        <Avatar name={v.lead.contact.name} />
                        <span>
                          <span className="block font-medium">{v.lead.contact.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.purpose === "sale" ? t("workspace.visits.buy") : t("workspace.visits.rent")}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className={td}>
                      <span className="flex items-center gap-2 font-medium">
                        <Avatar name={agent} />
                        {agent}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="flex items-center gap-2">
                        <Badge tone={st.tone}>{L(st.en, st.fr)}</Badge>
                        {clash && <AlertTriangle className="h-4 w-4 text-danger" aria-label={t("workspace.visits.conflictLabel")} />}
                      </span>
                    </td>
                    <td className={cn(td, "text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        {v.status === "requested" && (
                          <button
                            type="button"
                            disabled={savingId === v.id}
                            onClick={() => confirmVisit(v.id)}
                            className={cn(btn.outline, "h-8 px-3 py-1 text-xs")}
                          >
                            {L("Confirm", "Confirmer")}
                          </button>
                        )}
                        {isUpcomingVisit(v.status) ? (
                          <button
                            type="button"
                            onClick={() => openResultDrawer(v)}
                            className={cn(btn.outline, "h-8 px-3 py-1 text-xs")}
                          >
                            {t("workspace.visits.logResult")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openResultDrawer(v)}
                            className={cn(btn.outline, "h-8 px-3 py-1 text-xs")}
                          >
                            {t("workspace.visits.viewResult")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isOpenDrawer && (
                    <tr className="border-t border-border/60 bg-muted/30">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-[200px_1fr_auto] sm:items-end">
                          <div>
                            <label htmlFor={`status-${v.id}`} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                              {L("Outcome status", "Statut de la visite")}
                            </label>
                            <select
                              id={`status-${v.id}`}
                              value={resultStatus}
                              onChange={(e) => setResultStatus(e.target.value as "completed" | "cancelled" | "no_show")}
                              className={cn(inputCls, "h-9 text-xs")}
                            >
                              <option value="completed">{L("Completed", "Terminée")}</option>
                              <option value="cancelled">{L("Cancelled", "Annulée")}</option>
                              <option value="no_show">{L("No-show", "Absent")}</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor={`outcome-${v.id}`} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                              {L("Visit outcome / notes", "Compte-rendu de la visite")}
                            </label>
                            <textarea
                              id={`outcome-${v.id}`}
                              rows={2}
                              value={outcomeText}
                              onChange={(e) => setOutcomeText(e.target.value)}
                              placeholder={L("Client feedback, next steps or cancellation reason…", "Retour du client, suite à donner ou motif d'annulation...")}
                              className={cn(textareaCls, "text-xs")}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={savingId === v.id}
                              onClick={() => submitOutcome(v.id)}
                              className={cn(btn.primary, "h-9 px-4 text-xs")}
                            >
                              {savingId === v.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                              {L("Save result", "Enregistrer")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveVisitId(null)}
                              className={cn(btn.outline, "h-9 px-3 text-xs")}
                            >
                              {L("Close", "Fermer")}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {t("workspace.visits.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
