"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ApiError, api } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logout() {
    setPending(true);
    setFailed(false);
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      // 401 means the session is already gone, which is the goal.
      if (!(error instanceof ApiError && error.status === 401)) {
        setFailed(true);
        setPending(false);
        return;
      }
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={pending}
      aria-label={failed ? "Sign out failed, retry" : "Sign out"}
      title={failed ? "Sign out failed, retry" : "Sign out"}
      className={`rounded-full p-2 ${failed ? "text-destructive" : "text-muted-foreground"} transition-colors hover:bg-white/20 disabled:opacity-50 dark:hover:bg-white/10`}
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
