import Link from "next/link";
import { cn } from "@/lib/utils";

export function Card({ title, href, linkLabel = "Voir tout", className, children }: {
  title?: string; href?: string; linkLabel?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{title}</h2>
          {href && <Link href={href} className="text-sm text-primary hover:underline">{linkLabel}</Link>}
        </div>
      )}
      {children}
    </section>
  );
}