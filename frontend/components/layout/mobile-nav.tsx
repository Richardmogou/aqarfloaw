"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Role } from "@/lib/auth";
import { SidebarNav } from "./sidebar";

export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-2 text-muted-foreground hover:bg-sidebar-active/60"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav role={role} onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
