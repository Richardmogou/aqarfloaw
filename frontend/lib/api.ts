export class ApiError extends Error {
  constructor(public readonly status: number) {
    super(`API ${status}`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "aqarflow", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
