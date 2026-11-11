"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { btn, field } from "@/components/ui/styles";
import { useL } from "@/lib/i18n/provider";
import { DEAL_STAGES, DEAL_STAGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Aperçu : l'étape est locale, l'enregistrement via l'API (POST /deals/{id}/stage) viendra ensuite
export function DealStage({ initial }: { initial: string }) {
  const L = useL();
  const [stage, setStage] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const label = (s: string) => L(DEAL_STAGE[s].en, DEAL_STAGE[s].fr);

  return (
    <Card title={L("Stage", "Étape")}>
      <Badge tone={DEAL_STAGE[saved].tone}>{label(saved)}</Badge>
      <label className="mt-4 block text-sm font-medium">
        {L("Move to", "Passer à")}
        <select value={stage} onChange={(e) => setStage(e.target.value)} className={cn(field, "mt-2 w-full")}>
          {DEAL_STAGES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </label>
      <button type="button" disabled={stage === saved} onClick={() => setSaved(stage)} className={cn(btn.primary, "mt-3 w-full disabled:opacity-50")}>
        {L("Update stage", "Mettre à jour l'étape")}
      </button>
    </Card>
  );
}