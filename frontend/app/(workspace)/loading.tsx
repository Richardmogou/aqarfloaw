export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Loading…</span>
      <div className="space-y-2"><div className="h-7 w-48 rounded bg-muted" /><div className="h-4 w-72 rounded bg-muted" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
      </div>
      <div className="h-72 rounded-xl bg-muted" />
    </div>
  );
}