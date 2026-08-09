// Trim whitespace + trailing slashes from VITE_API_BASE so copy-paste mistakes
// (e.g. "https://x.onrender.com " or "https://x.onrender.com/") never break URLs.
export const API_BASE = (((import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE) ?? "").trim().replace(/\/+$/, "");

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