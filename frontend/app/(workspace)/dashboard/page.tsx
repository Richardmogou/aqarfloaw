const STATS = [
  {
    label: "Available properties",
    value: "—",
    cardClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    blobClass: "bg-blue-500",
    delay: "animation-delay-[0ms]",
  },
  {
    label: "New inquiries",
    value: "—",
    cardClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    blobClass: "bg-emerald-500",
    delay: "animation-delay-[80ms]",
  },
  {
    label: "Upcoming visits",
    value: "—",
    cardClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    blobClass: "bg-amber-500",
    delay: "animation-delay-[160ms]",
  },
  {
    label: "Open deals",
    value: "—",
    cardClass: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    blobClass: "bg-violet-500",
    delay: "animation-delay-[240ms]",
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="animate-slide-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s an overview of your activity today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`animate-slide-up group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${stat.cardClass}`}
          >
            {/* Glow blob */}
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-40 ${stat.blobClass}`} />

            {/* Top accent bar */}
            <div className={`absolute left-0 top-0 h-0.5 w-full ${stat.blobClass} opacity-60`} />

            <p className="relative text-xs font-semibold uppercase tracking-wider opacity-75">{stat.label}</p>
            <p className="relative mt-4 text-4xl font-bold tracking-tight">{stat.value}</p>

            {/* Bottom shimmer on hover */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
}
