import { MessageCircle, Phone } from "lucide-react";
import { btn } from "@/components/ui/styles";
import { telLink, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ContactButtons({ message, callLabel, waLabel, className }: {
  message: string; callLabel: string; waLabel: string; className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <a href={telLink()} className={btn.outline}><Phone className="h-4 w-4" aria-hidden /> {callLabel}</a>
      <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={cn(btn.outline, "border-success/50")}>
        <MessageCircle className="h-4 w-4 text-success" aria-hidden /> {waLabel}
      </a>
    </div>
  );
}