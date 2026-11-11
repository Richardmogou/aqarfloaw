import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { btn } from "@/components/ui/styles";
import { getL } from "@/lib/i18n/server";

export default function ForbiddenPage() {
  const L = getL();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldAlert className="h-12 w-12 text-muted-foreground" aria-hidden />
      <p className="text-sm font-semibold text-muted-foreground">403</p>
      <h1 className="text-2xl font-semibold">{L("Access denied", "Accès refusé")}</h1>
      <p className="max-w-sm text-muted-foreground">{L("You do not have permission to view this page. Contact your agency administrator if you think this is a mistake.", "Vous n'avez pas l'autorisation de voir cette page. Contactez l'administrateur de votre agence si vous pensez qu'il s'agit d'une erreur.")}</p>
      <Link href="/dashboard" className={btn.primary}>{L("Back to dashboard", "Retour au tableau de bord")}</Link>
    </main>
  );
}