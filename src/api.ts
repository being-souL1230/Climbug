// Production backend URL (Render). In local dev (vite dev server) this is
// ignored — API_BASE stays "" and the dev proxy forwards /api to :8000.
// Override anytime via the VITE_API_BASE env var (Vercel → Settings → Env).
const _env = (import.meta as unknown as { env?: { VITE_API_BASE?: string; DEV?: boolean } }).env ?? {};
const _defaultApi = _env.DEV ? "" : "https://climbugg.onrender.com";
// Trim whitespace + trailing slashes so copy-paste mistakes never break URLs.
export const API_BASE = (_env.VITE_API_BASE ?? _defaultApi).trim().replace(/\/+$/, "");

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data as T;
}