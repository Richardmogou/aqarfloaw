"use client";
import { Globe, Home, MapPin, MessageCircle, MoreHorizontal, Phone, Share2, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchField } from "@/components/ui/filter-select";
import { btn, field, td, th } from "@/components/ui/styles";
import { Thumb } from "@/components/ui/thumb";
import { api } from "@/lib/api";
import { fmtRelative } from "@/lib/format";
import { useL, useLocale, useT } from "@/lib/i18n/provider";
import { leadPropertyCover, leadQuery, type LeadFilters, type LeadPage } from "@/lib/leads";
import { EN, LEAD_STAGE, SOURCE_LABEL } from "@/lib/mock-data";
import { memberName, type AgencyMember } from "@/lib/properties";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

const SOURCE_ICON: Record<string, LucideIcon> = {
  website: Globe,
  phone: Phone,
  whatsapp: MessageCircle,
  instagram: Share2,
};

export function LeadsTable({ page, members, filters, isAdmin }: {
  page: LeadPage; members: AgencyMember[]; filters: LeadFilters; isAdmin: boolean;
}) {
  const t = useT();
  const L = useL();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q ?? "");
  const [openAssignId, setOpenAssignId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  function navigate(changes: LeadFilters) {
    const next = { ...filters, page: undefined, ...changes };
    const query = leadQuery(next);
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    if (search === (filters.q ?? "")) return;
    const timer = setTimeout(() => navigate({ q: search }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function assignAgent(leadId: string, agentId: string) {
    if (!agentId) return;
    setAssigningId(leadId);
    try {
      await api(`/leads/${leadId}/assign`, {
        method: "POST",
        body: JSON.stringify({ assigned_agent_id: agentId }),
      });
      setOpenAssignId(null);
      startTransition(() => router.refresh());
    } finally {
      setAssigningId(null);
    }
  }

  const stageOptions = Object.keys(LEAD_STAGE).map((value) => ({
    value,
    label: L(EN.leadStage[value] ?? value, LEAD_STAGE[value].label),
  }));
  const sourceOptions = Object.keys(SOURCE_LABEL).map((value) => ({
    value,
    label: L(EN.source[value] ?? value, SOURCE_LABEL[value]),
  }));
  const agentFilterValue = filters.unassigned === "true" ? "none" : (filters.assigned_agent_id ?? "");
  const pageCount = Math.max(1, Math.ceil(page.total / page.page_size));

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchField placeholder={t("workspace.leads.searchPlaceholder")} value={search} onChange={setSearch} />
        <FilterSelect label={t("workspace.leads.allStages")} value={filters.stage ?? ""}
          onChange={(stage) => navigate({ stage })} options={stageOptions} />
        <FilterSelect label={t("workspace.leads.allSources")} value={filters.source ?? ""}
          onChange={(source) => navigate({ source })} options={sourceOptions} />
        {isAdmin && (
          <FilterSelect
            label={t("workspace.leads.allAgents")}
            value={agentFilterValue}
            onChange={(value) => navigate(
              value === "none"
                ? { unassigned: "true", assigned_agent_id: undefined }
                : { unassigned: undefined, assigned_agent_id: value || undefined },
            )}
            options={[
              { value: "none", label: t("workspace.leads.unassigned") },
              ...members.map((m) => ({ value: m.id, label: m.full_name })),
            ]}
          />
        )}
      </div>

      <div className={cn("overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm transition-opacity", pending && "opacity-60")} aria-busy={pending}>
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={th}>{t("workspace.leads.colName")}</th>
              <th className={th}>{t("workspace.leads.colProperty")}</th>
              <th className={th}>{t("workspace.leads.colStage")}</th>
              <th className={th}>{t("workspace.leads.colSource")}</th>
              <th className={th}>{t("workspace.leads.colDate")}</th>
              <th className={th}>{t("workspace.leads.colAgent")}</th>
              <th className={cn(th, "text-right")}>{L("Actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((lead) => {
              const prop = lead.property;
              const cover = leadPropertyCover(prop);
              const stageMeta = LEAD_STAGE[lead.stage] ?? { label: lead.stage, tone: "neutral" as const };
              const stageLabel = L(EN.leadStage[lead.stage] ?? lead.stage, stageMeta.label);
              const sourceLabel = L(EN.source[lead.source] ?? lead.source, SOURCE_LABEL[lead.source] ?? lead.source);
              const SourceIcon = SOURCE_ICON[lead.source] ?? Globe;
              const agent = memberName(members, lead.assigned_agent_id);
              return (
                <tr key={lead.id} className="border-t border-border transition-colors hover:bg-muted/40">
                  <td className={td}>
                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <Avatar name={lead.contact.name} />
                      <span>{lead.contact.name}</span>
                    </Link>
                  </td>
                  <td className={td}>
                    {prop ? (
                      <Link href={`/properties/${prop.id}`} className="group flex items-center gap-3">
                        {cover ? (
                          <Thumb src={cover} alt="" className="h-11 w-14 rounded-lg" />
                        ) : (
                          <span className="grid h-11 w-14 shrink-0 place-items-center rounded-lg bg-muted">
                            <Home className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold group-hover:text-primary">{prop.title}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" aria-hidden /> {prop.city}
                          </span>
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{lead.preferred_location || L("General inquiry", "Demande générale")}</span>
                    )}
                  </td>
                  <td className={td}>
                    <Badge tone={lead.stage === "new" ? "danger" : stageMeta.tone}>{stageLabel}</Badge>
                  </td>
                  <td className={td}>
                    <span className="inline-flex items-center gap-2 text-foreground">
                      <SourceIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {sourceLabel}
                    </span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>
                    {fmtRelative(lead.created_at, locale)}
                  </td>
                  <td className={td}>
                    {agent ? (
                      <span className="flex items-center gap-2.5 font-medium">
                        <Avatar name={agent} />
                        {agent}
                      </span>
                    ) : isAdmin ? (
                      openAssignId === lead.id ? (
                        <select
                          aria-label={`${t("workspace.leads.assign")} ${lead.contact.name}`}
                          defaultValue=""
                          disabled={assigningId === lead.id}
                          onChange={(e) => assignAgent(lead.id, e.target.value)}
                          className={`${field} h-8 text-xs`}
                        >
                          <option value="" disabled>{t("workspace.leads.assignTo")}</option>
                          {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-muted">
                              <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
                            </span>
                            {L("Unassigned", "À attribuer")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOpenAssignId(lead.id)}
                            className={cn(btn.primary, "h-8 rounded-lg px-3 py-1 text-xs")}
                          >
                            {L("Assign to an agent", "Attribuer à un agent")}
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-muted-foreground">{t("workspace.leads.unassigned")}</span>
                    )}
                  </td>
                  <td className={cn(td, "text-right")}>
                    <Link
                      href={`/leads/${lead.id}`}
                      aria-label={`${t("workspace.leads.open")} ${lead.contact.name}`}
                      className="inline-grid h-8 w-8 place-items-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {page.items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t("workspace.leads.empty")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{t(page.items.length > 1 ? "workspace.leads.countPlural" : "workspace.leads.count", { n: page.items.length, total: page.total })}</p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button type="button" className={cn(btn.outline, "disabled:opacity-50")} disabled={page.page <= 1 || pending}
              onClick={() => navigate({ page: String(page.page - 1) })}>{L("Previous", "Précédent")}</button>
            <span>{page.page} / {pageCount}</span>
            <button type="button" className={cn(btn.outline, "disabled:opacity-50")} disabled={page.page >= pageCount || pending}
              onClick={() => navigate({ page: String(page.page + 1) })}>{L("Next", "Suivant")}</button>
          </div>
        )}
      </div>
    </>
  );
}
