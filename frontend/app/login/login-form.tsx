"use client";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, api } from "@/lib/api";
import { useT } from "@/lib/i18n/provider";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? "").trim(),
          password: String(form.get("password") ?? ""),
        }),
      });
      router.replace(next);
      router.refresh();
    } catch (caught) {
      const status = caught instanceof ApiError ? caught.status : 0;
      setError(t(status === 401 ? "auth.invalid" : status === 429 ? "auth.tooMany" : "auth.unavailable"));
      setPending(false);
    }
  }

  const describedBy = error ? "login-error" : undefined;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <input id="email" name="email" type="email" autoComplete="email" required
            aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required
            aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={`${inputClass} pr-10`} />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
            aria-pressed={show}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p id="login-error" role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {pending ? t("auth.signingIn") : t("auth.signIn")}
      </button>
    </form>
  );
}