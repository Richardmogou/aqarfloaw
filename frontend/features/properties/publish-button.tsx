"use client";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import { UNPUBLISHABLE_STATUSES } from "@/lib/properties";
import { cn } from "@/lib/utils";

export function PublishButton({ propertyId, published, status, fullWidth = false }: {
  propertyId: string; published: boolean; status: string; fullWidth?: boolean;
}) {
  const L = useL();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const blocked = !published && UNPUBLISHABLE_STATUSES.includes(status);

  async function toggle() {
    setPending(true);
    setError("");
    try {
      await api(`/properties/${propertyId}`, { method: "PATCH", body: JSON.stringify({ is_published: !published }) });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 422
        ? L("This property cannot be published with its current status.", "Ce bien ne peut pas être publié avec son statut actuel.")
        : L("The change could not be saved. Try again.", "La modification n'a pas pu être enregistrée. Réessayez."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", fullWidth ? "items-stretch" : "items-end")}>
      <button type="button" onClick={toggle} disabled={pending || blocked} className={cn(btn.primary, "disabled:opacity-60")}
        title={blocked ? L("A draft or inactive property cannot be published.", "Un bien en brouillon ou inactif ne peut pas être publié.") : undefined}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {published ? L("Unpublish", "Dépublier") : L("Publish listing", "Publier l'annonce")}
      </button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
