import Link from "next/link";
import { cn } from "@/lib/utils";

type CardLink = { href: string; linkLabel: string } | { href?: undefined; linkLabel?: undefined };

export function Card({ title, href, linkLabel, className, children }: {
  title?: string; className?: string; children: React.ReactNode;
} & CardLink) {
  return (
    <section className={cn("rounded-2xl border border-border/70 bg-card p-6 shadow-sm", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {href && <Link href={href} className="text-sm font-medium text-primary hover:underline">{linkLabel}</Link>}
        </div>
      )}
      {children}
    </section>
  );
}
