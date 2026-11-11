export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail: unknown = null) {
    super(`API ${status}`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // FormData needs the browser-generated multipart boundary, so no JSON content type for it.
  const contentType: Record<string, string> = init?.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { ...contentType, "X-Requested-With": "aqarflow", ...init?.headers },
  });
  if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login")) {
    window.location.assign(`/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`);
  }
  if (!res.ok) throw new ApiError(res.status, await res.json().then((body) => body?.detail ?? null, () => null));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
