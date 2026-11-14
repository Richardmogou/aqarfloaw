"use client";
import { CalendarPlus, ChevronDown, FileText, Loader2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { btn, field } from "@/components/ui/styles";
import { api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import { EN, LEAD_STAGE } from "@/lib/mock-data";
import { memberName, type AgencyMember } from "@/lib/properties";
import { cn } from "@/lib/utils";

export function LeadAgentSelect({ leadId, assignedAgentId, members, isAdmin }: {
  leadId: string; assignedAgentId: string | null; members: AgencyMember[]; isAdmin: boolean;
}) {
  const L = useL();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const agent = memberName(members, assignedAgentId);

  async function onChange(nextAgentId: string) {
    await api(`/leads/${leadId}/assign`, {
      method: "POST",
      body: JSON.stringify({ assigned_agent_id: nextAgentId || null }),
    });
    setEditing(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        {agent ? (
          <span className="flex items-center gap-2.5 font-medium">
            <Avatar name={agent} />
            <span>{agent}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-muted">
              <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
            </span>
            {L("Unassigned", "À attribuer")}
          </span>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {agent ? L("Change", "Changer") : L("Assign", "Attribuer")}
          </button>
        )}
      </div>
      {isAdmin && editing && (
        <select
          aria-label={L("Responsible agent", "Agent responsable")}
          value={assignedAgentId ?? ""}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          className={cn(field, "h-9 w-full text-xs")}
        >
          <option value="">{L("Unassigned", "Non assigné")}</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      )}
    </div>
  );
}

export function LeadActions({ initialStage, leadId }: {
  initialStage: string; initialFollowUp?: string | null; leadId: string;
}) {
  const L = useL();
  const router = useRouter();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [stage, setStage] = useState(initialStage);
  const [note, setNote] = useState("");
  const [savingStage, setSavingStage] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const stageLabel = (k: string) => L(EN.leadStage[k] ?? k, LEAD_STAGE[k]?.label ?? k);

  async function updateStage(nextStage: string) {
    setStage(nextStage);
    setSavingStage(true);
    try {
      await api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ stage: nextStage }),
      });
      router.refresh();
    } finally {
      setSavingStage(false);
    }
  }

  async function submitActivity() {
    if (!note.trim() || savingNote) return;
    setSavingNote(true);
    try {
      await api(`/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify({ activity_type: "note", body: note.trim() }),
      });
      setNote("");
      router.refresh();
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2.5">
          <Link href={`/visits/new?lead=${leadId}`} className={cn(btn.primary, "h-11 w-full justify-start gap-3 px-4")}>
            <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
            <span>{L("Schedule a visit", "Planifier une visite")}</span>
          </Link>

          <Link
            href={`/deals/new?lead=${leadId}`}
            className="flex h-11 w-full items-center gap-3 rounded-xl bg-muted/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{L("Create a deal", "Créer un deal")}</span>
          </Link>

          <button
            type="button"
            onClick={() => noteRef.current?.focus()}
            className="flex h-11 w-full items-center gap-3 rounded-xl bg-muted/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{L("Add a note", "Ajouter une note")}</span>
          </button>

          <div className="relative">
            <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" aria-hidden />
            <select
              aria-label={L("Update status", "Mettre à jour le statut")}
              value={stage}
              disabled={savingStage}
              onChange={(e) => updateStage(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl bg-muted/70 pl-11 pr-9 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.keys(LEAD_STAGE).map((k) => (
                <option key={k} value={k}>
                  {L("Status", "Statut")} : {stageLabel(k)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </Card>

      <Card title={L("Quick notes", "Notes rapides")}>
        <label className="sr-only" htmlFor="note">{L("Add a note", "Ajouter une note")}</label>
        <textarea
          ref={noteRef}
          id="note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={L("Add a note…", "Ajouter une note...")}
          className="w-full rounded-xl border border-border/60 bg-muted/40 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          disabled={!note.trim() || savingNote}
          onClick={submitActivity}
          className={cn(btn.outline, "mt-3 w-full disabled:opacity-50")}
        >
          {savingNote && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {L("Save note", "Enregistrer la note")}
        </button>
      </Card>
    </div>
  );
}
