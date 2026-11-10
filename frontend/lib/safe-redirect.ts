// Rejects "//host", "/\host" and control characters, which browsers turn into off-site redirects.
const SAFE_PATH = /^\/(?![/\\])[^\\\u0000-\u001f]*$/;

export function safeRedirectPath(next: string | string[] | undefined): string {
  return typeof next === "string" && SAFE_PATH.test(next) ? next : "/dashboard";
}
