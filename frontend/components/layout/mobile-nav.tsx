"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Sidebar as SidebarNav } from "./sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && open && createPortal(
        <>
          <div
            className="fixed inset-0 z-[200] bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[201] flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-2 text-muted-foreground hover:bg-sidebar-active/60"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav onNavigate={() => setOpen(false)} className="flex w-full" />
          </div>
        </>,
        document.body
      )}
    </>
  );
}
