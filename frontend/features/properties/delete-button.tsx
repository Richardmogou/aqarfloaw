"use client";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const danger = "border-destructive/50 text-destructive hover:bg-destructive/10";

export function DeleteButton({ propertyId, title }: { propertyId: string; title: string }) {
  const L = useL();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    try {
      await api(`/properties/${propertyId}`, { method: "DELETE" });
    } catch (caught) {
      // 404 means it is already gone (deleted in another tab), which is the outcome the user asked for.
      if (!(caught instanceof ApiError && caught.status === 404)) {
        setError(L("The property could not be deleted. Try again.", "Le bien n'a pas pu être supprimé. Réessayez."));
        setPending(false);
        return;
      }
    }
    router.replace("/properties");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={cn(btn.outline, danger)}>
        <Trash2 className="h-4 w-4" aria-hidden /> {L("Delete", "Supprimer")}
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-labelledby="delete-property-question" className="flex flex-col items-end gap-1">
      <p id="delete-property-question" className="text-xs text-muted-foreground">
        {L(`Delete “${title}”? It will be removed from the website and the list.`, `Supprimer « ${title} » ? Il sera retiré du site et de la liste.`)}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => setConfirming(false)} disabled={pending} className={cn(btn.outline, "disabled:opacity-60")} autoFocus>
          {L("Cancel", "Annuler")}
        </button>
        <button type="button" onClick={remove} disabled={pending} className={cn(btn.outline, danger, "disabled:opacity-60")}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          {L("Confirm deletion", "Confirmer la suppression")}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
