const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
export const field = `h-11 rounded-xl border border-border bg-card px-3.5 text-sm shadow-sm ${focus}`;
export const btn = {
  primary: `inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition hover:brightness-110 ${focus}`,
  outline: `inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted ${focus}`,
};
export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const td = "px-4 py-4 align-middle";
