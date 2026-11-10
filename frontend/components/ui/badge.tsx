import { cn } from "@/lib/utils";

export type Tone = "success" | "info" | "warning" | "danger" | "neutral";

// Point coloré + texte au contraste standard : lisible en clair comme en sombre
const TONES: Record<Tone, { bg: string; dot: string }> = {
  success: { bg: "bg-success/15", dot: "bg-success" },
  info: { bg: "bg-primary/10", dot: "bg-primary" },
  warning: { bg: "bg-warning/20", dot: "bg-warning" },
  danger: { bg: "bg-danger/15", dot: "bg-danger" },
  neutral: { bg: "bg-muted", dot: "bg-muted-foreground" },
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const t = TONES[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", t.bg, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden />
      {children}
    </span>
  );
}