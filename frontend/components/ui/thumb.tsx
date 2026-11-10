import { cn } from "@/lib/utils";

export function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={cn("bg-muted object-cover", className)} />;
}