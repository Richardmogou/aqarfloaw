"use client";
import { CalendarPlus, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { btn, field } from "@/components/ui/styles";
import { useL } from "@/lib/i18n/provider";
import { EN, LEAD_STAGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Aperçu : l'état est local, l'enregistrement via l'API arrive ensuite
export function LeadActions({ initialStage, leadId }: { initialStage: string; leadId: number }) {
  const L = useL();
  const [stage, setStage] = useState(initialStage);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const stageLabel = (k: string) => L(EN.leadStage[k], LEAD_STAGE[k].label);

  return (
    <div className="space-y-4">
      <Card>
        <Link href={`/visits/new?lead=${leadId}`} className={cn(btn.primary, "w-full")}>
          <CalendarPlus className="h-4 w-4" /> {L("Schedule a visit", "Planifier une visite")}
        </Link>
        <Link href={`/deals/new?lead=${leadId}`} className={cn(btn.outline, "mt-2 w-full")}>
          <FileText className="h-4 w-4" /> {L("Create deal", "Créer un deal")}
        </Link>
        <label className="mt-4 block text-sm font-medium">
          <span className="flex items-center justify-between">
            {L("Update status", "Mettre à jour le statut")} <Badge tone={LEAD_STAGE[stage].tone}>{stageLabel(stage)}</Badge>
          </span>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className={cn(field, "mt-2 w-full")}>
            {Object.keys(LEAD_STAGE).map((k) => <option key={k} value={k}>{stageLabel(k)}</option>)}
          </select>
        </label>
      </Card>

      <Card title={L("Quick notes", "Notes rapides")}>
        <label className="sr-only" htmlFor="note">{L("Add a note", "Ajouter une note")}</label>
        <textarea
          id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={L("Add a note…", "Ajouter une note…")}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button" disabled={!note.trim()} onClick={() => { setNotes((n) => [note.trim(), ...n]); setNote(""); }}
          className={cn(btn.outline, "mt-3 w-full disabled:opacity-50")}
        >
          {L("Add note", "Ajouter la note")}
        </button>
        {notes.length > 0 && <ul className="mt-4 space-y-2 text-sm">{notes.map((n, i) => <li key={i} className="rounded-lg bg-muted p-3">{n}</li>)}</ul>}
      </Card>
    </div>
  );
}