"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { LocaleSwitcher } from "@/lib/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function ProfileMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useT();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        aria-label={t("common.account")}
        aria-expanded={open}
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted"
      >
        <Avatar name={name} className="h-8 w-8" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">{name}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {mounted && open && createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[300] w-72 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-card/90"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-4">
            <Avatar name={name} className="h-10 w-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("common.language")}</span>
              <LocaleSwitcher />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("common.theme")}</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="border-t border-border px-2 py-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              {t("auth.signOut")}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
