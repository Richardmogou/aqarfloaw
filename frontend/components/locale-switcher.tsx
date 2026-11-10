"use client";
import { useRouter } from "next/navigation";
import { COOKIE, LOCALES } from "@/lib/i18n/dictionaries";
import { useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();

  const change = (l: string) => {
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div role="group" aria-label={t("common.language")} className="flex rounded-md border border-border bg-card p-0.5 text-xs font-semibold">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => change(l)}
          className={cn(
            "rounded-sm px-2 py-1 uppercase text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            locale === l && "bg-primary text-primary-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}