import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={"blue-" + id} x1="6" y1="34" x2="24" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={"flow-" + id} x1="4" y1="28" x2="36" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <path
        d="M7 33V18.2C7 17.2 7.5 16.2 8.4 15.6L19 7.8C19.6 7.3 20.4 7.3 21 7.8L31.6 15.6C32.5 16.2 33 17.2 33 18.2V33"
        stroke={"url(#blue-" + id + ")"}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 33V24.5C14 23.7 14.7 23 15.5 23H24.5C25.3 23 26 23.7 26 24.5V33"
        stroke={"url(#blue-" + id + ")"}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M4 25.5C10 21.5 16 21.5 20 24.5C24 27.5 30 27 36 21.5"
        stroke={"url(#flow-" + id + ")"}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <circle cx="20" cy="14" r="2" fill={"url(#flow-" + id + ")"} />
    </svg>
  );
}

export function Logo({ variant = "full", size = "md", className, href = "/" }: LogoProps) {
  const sizeMap = {
    sm: { mark: 24, text: "text-lg", gap: "gap-2" },
    md: { mark: 32, text: "text-xl", gap: "gap-2.5" },
    lg: { mark: 40, text: "text-2xl", gap: "gap-3" },
  };

  const current = sizeMap[size];

  const content = (
    <span className={cn("inline-flex items-center select-none", current.gap, className)}>
      {variant !== "text" && <LogoMark size={current.mark} />}
      {variant !== "mark" && (
        <span className={cn("font-extrabold tracking-tight text-foreground flex items-center", current.text)}>
          <span>Aqar</span>
          <span className="text-primary">Flow</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5 inline-block" />
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
