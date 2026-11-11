"use client";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { btn } from "@/components/ui/styles";
import { useL } from "@/lib/i18n/provider";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const L = useL();
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <TriangleAlert className="h-12 w-12 text-muted-foreground" aria-hidden />
      <p className="text-sm font-semibold text-muted-foreground">500</p>
      <h1 className="text-2xl font-semibold">{L("Something went wrong", "Une erreur est survenue")}</h1>
      <p className="max-w-sm text-muted-foreground">{L("An unexpected error occurred. Please try again.", "Une erreur inattendue s'est produite. Veuillez réessayer.")}</p>
      {error.digest && <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={reset} className={btn.primary}>{L("Try again", "Réessayer")}</button>
        <Link href="/" className={btn.outline}>{L("Home", "Accueil")}</Link>
      </div>
    </main>
  );
}