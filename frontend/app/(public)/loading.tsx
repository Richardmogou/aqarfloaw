export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <span className="sr-only">Loading…</span>
      <div className="h-9 w-72 rounded bg-muted" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-80 rounded-xl bg-muted" />)}
      </div>
    </div>
  );
}