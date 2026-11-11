import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  primary: { card: "border-primary/20 bg-primary/[0.06]", icon: "bg-primary/15 text-primary" },
  success: { card: "border-success/25 bg-success/[0.07]", icon: "bg-success/15 text-success" },
  warning: { card: "border-warning/30 bg-warning/[0.08]", icon: "bg-warning/20 text-warning" },
  danger: { card: "border-danger/25 bg-danger/[0.06]", icon: "bg-danger/15 text-danger" },
  violet: { card: "border-violet-500/20 bg-violet-500/[0.06]", icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  neutral: { card: "border-border bg-card", icon: "bg-muted text-muted-foreground" },
};

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: {
  label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: keyof typeof TONES;
}) {
  const style = TONES[tone];
  return (
    <div className={cn("flex items-center gap-5 rounded-2xl border p-5 shadow-sm", style.card)}>
      <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full", style.icon)}>
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        <p className="mt-0.5 text-3xl font-bold leading-tight tracking-tight">{value}</p>
        {hint && <p className="mt-1 truncate text-sm text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
