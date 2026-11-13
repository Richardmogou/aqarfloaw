import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function serverApi<T>(path: string): Promise<T> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const res = await fetch(`${backendUrl}/api/v1${path}`, {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
    cache: "no-store",
  }).catch((cause) => {
    throw new Error(`API unreachable at ${backendUrl} (is the backend running?)`, { cause });
  });
  if (res.status === 401) redirect("/login?expired=1");
  if (res.status === 403) redirect("/forbidden");
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API ${res.status} on GET ${path}`);
  return res.json();
}

const PUBLIC_TIMEOUT_MS = 5000;

export type PublicResult<T> = { ok: true; data: T } | { ok: false; status: number | null };

/** Public pages must still render when the API is down, so failures come back as a value instead of an error page. */
export async function publicApi<T>(path: string): Promise<PublicResult<T>> {
  try {
    const res = await fetch(`${backendUrl}/api/v1${path}`, { cache: "no-store", signal: AbortSignal.timeout(PUBLIC_TIMEOUT_MS) });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error(`Public API unreachable: ${backendUrl}/api/v1${path}`, error);
    return { ok: false, status: null };
  }
}
