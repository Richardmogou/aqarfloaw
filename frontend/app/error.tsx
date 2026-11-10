"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Service temporarily unavailable</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        AqarFlow could not reach its server. Check your connection and try again.
      </p>
      <button
        onClick={retry}
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
