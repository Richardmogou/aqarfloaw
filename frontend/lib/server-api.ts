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
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API ${res.status} on GET ${path}`);
  return res.json();
}
