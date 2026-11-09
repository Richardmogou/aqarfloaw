const STATS = [
  { label: "Available properties", value: "—", tone: "bg-primary/10 text-primary" },
  { label: "New inquiries", value: "—", tone: "bg-success/10 text-success" },
  { label: "Upcoming visits", value: "—", tone: "bg-warning/10 text-warning" },
  { label: "Open deals", value: "—", tone: "bg-muted text-muted-foreground" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s an overview of your activity today.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className={`rounded-lg border border-border p-5 ${stat.tone}`}>
            <p className="text-sm font-medium">{stat.label}</p>
            <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
