import { cloneElement } from "react";
import { cn } from "@/lib/utils";
import { field } from "./styles";

export const inputCls = `${field} w-full`;
export const textareaCls =
  "w-full rounded-xl border border-border bg-card p-3.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Field({ label, id, error, hint, required, className, children }: {
  label: string; id: string; error?: string; hint?: string; required?: boolean; className?: string; children: React.ReactElement;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-destructive" aria-hidden> *</span>}</label>
      {cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-error` : undefined })}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FormBanner({ tone, children }: { tone: "success" | "error" | "warning"; children: React.ReactNode }) {
  const cls =
    tone === "success" ? "border-success/40 bg-success/10"
    : tone === "warning" ? "border-warning/40 bg-warning/10"
    : "border-destructive/40 bg-destructive/10";
  return <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg border px-4 py-3 text-sm", cls)}>{children}</p>;
}