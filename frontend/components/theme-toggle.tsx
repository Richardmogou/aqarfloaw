"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", key: "common.light", icon: Sun },
  { value: "dark", key: "common.dark", icon: Moon },
  { value: "system", key: "common.system", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-28" aria-hidden />;

  return (
    <div role="radiogroup" aria-label={t("common.theme")} className="flex rounded-md border border-border bg-card p-0.5">
      {OPTIONS.map(({ value, key, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={t(key)}
          title={t(key)}
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-sm p-1.5 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            theme === value && "bg-primary text-primary-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}