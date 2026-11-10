import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export type Role = "admin" | "agent";

export type CurrentUser = {
  id: string;
  agency_id: string;
  full_name: string;
  email: string;
  role: Role;
};

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
    cache: "no-store",
  }).catch((cause) => {
    throw new Error(`API unreachable at ${backendUrl} (is the backend running?)`, { cause });
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Session check failed: API ${res.status}`);
  return res.json();
});

export async function requireUser(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}
