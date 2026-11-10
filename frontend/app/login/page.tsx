import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in · AqarFlow" };

export default async function LoginPage({ searchParams }: { searchParams: { next?: string | string[] } }) {
  const next = safeRedirectPath(searchParams.next);
  if (await getCurrentUser()) redirect(next);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">AqarFlow</h1>
          <p className="text-sm text-muted-foreground">Sign in to your agency workspace</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
