"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FormBanner, inputCls } from "@/components/ui/form";
import { btn, field } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import { DEAL_STAGES, DEAL_STAGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DealStage({
  dealId,
  initialStage,
  initialOffer,
  initialAgreed,
}: {
  dealId: string;
  initialStage: string;
  initialOffer: string | null;
  initialAgreed: string | null;
}) {
  const L = useL();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState(initialStage);
  const [offer, setOffer] = useState(initialOffer ? String(Number(initialOffer)) : "");
  const [agreed, setAgreed] = useState(initialAgreed ? String(Number(initialAgreed)) : "");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState("");
  const label = (s: string) => L(DEAL_STAGE[s]?.en ?? s, DEAL_STAGE[s]?.fr ?? s);

  async function saveUpdate() {
    setSaving(true);
    setBanner("");
    try {
      await api(`/deals/${dealId}/stage`, {
        method: "POST",
        body: JSON.stringify({
          stage,
          offer_amount: offer.trim() ? String(Number(offer)) : null,
          agreed_amount: agreed.trim() ? String(Number(agreed)) : null,
        }),
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
        setBanner(L("Could not update the deal.", "Impossible de mettre à jour le deal."));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title={L("Pipeline & amounts", "Étape et montants")}>
      {banner && (
        <div className="mb-3">
          <FormBanner tone="error">{banner}</FormBanner>
        </div>
      )}
      <Badge tone={DEAL_STAGE[initialStage]?.tone ?? "neutral"}>{label(initialStage)}</Badge>

      <label className="mt-4 block text-sm font-medium">
        {L("Move to", "Passer à")}
        <select value={stage} onChange={(e) => setStage(e.target.value)} className={cn(field, "mt-1.5 w-full")}>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>{label(s)}</option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium">
        {L("Offer amount (PKR)", "Montant de l'offre (PKR)")}
        <input
          type="number"
          min={0}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          className={cn(inputCls, "mt-1.5")}
        />
      </label>

      <label className="mt-4 block text-sm font-medium">
        {L("Agreed amount (PKR)", "Montant convenu (PKR)")}
        <input
          type="number"
          min={0}
          value={agreed}
          onChange={(e) => setAgreed(e.target.value)}
          className={cn(inputCls, "mt-1.5")}
        />
      </label>

      <button
        type="button"
        disabled={saving || pending}
        onClick={saveUpdate}
        className={cn(btn.primary, "mt-4 w-full disabled:opacity-50")}
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {L("Update deal", "Mettre à jour le deal")}
      </button>
    </Card>
  );
}
