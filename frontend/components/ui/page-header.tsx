import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PageHeader({ title, description, back, children }: {
  title: string; description?: string; back?: { href: string; label: string }; children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {back.label}
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-base text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-start gap-3">{children}</div>}
    </div>
  );
}
