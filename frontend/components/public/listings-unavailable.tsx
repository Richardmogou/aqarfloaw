import { CloudOff, MessageCircle, RotateCw } from "lucide-react";
import Link from "next/link";
import { btn } from "@/components/ui/styles";
import { getL } from "@/lib/i18n/server";

export function ListingsUnavailable({ retryHref }: { retryHref: string }) {
  const L = getL();
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-muted"><CloudOff className="h-7 w-7 text-muted-foreground" aria-hidden /></span>
      <div>
        <p className="text-lg font-semibold">{L("Listings are temporarily unavailable", "Les annonces sont momentanément indisponibles")}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {L("We could not load the properties right now. Please try again in a few moments, or contact us directly.",
            "Nous n'avons pas pu charger les biens pour le moment. Réessayez dans quelques instants ou contactez-nous directement.")}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={retryHref} className={btn.primary}><RotateCw className="h-4 w-4" aria-hidden /> {L("Try again", "Réessayer")}</a>
        <Link href="/contact" className={btn.outline}><MessageCircle className="h-4 w-4" aria-hidden /> {L("Contact us", "Nous contacter")}</Link>
      </div>
    </div>
  );
}
