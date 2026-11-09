import { Construction } from "lucide-react";

export function PlaceholderPage({ title, description, day }: { title: string; description: string; day: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <Construction className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">This page is under construction</p>
        <p className="text-sm text-muted-foreground">Planned for {day}.</p>
      </div>
    </div>
  );
}
