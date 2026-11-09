import { cn } from "@/lib/utils";

const KPIS = [
  { label: "Biens disponibles", value: "—", tone: "bg-primary/10 text-primary" },
  { label: "Nouvelles demandes", value: "—", tone: "bg-success/10 text-success" },
  { label: "Visites à venir", value: "—", tone: "bg-warning/10 text-warning" },
  { label: "Deals ouverts", value: "—", tone: "bg-muted-foreground/10 text-muted-foreground" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Un coup d&apos;œil sur votre activité aujourd&apos;hui.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className={cn("rounded-lg border border-border p-5", k.tone)}>
            <p className="text-sm font-medium text-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
