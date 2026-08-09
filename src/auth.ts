import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { resetBadges } from "./badges";
import { resetProgress, setProgress } from "./progress";
import type { PlayerProgress } from "./data";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  email?: string;
  provider?: "github" | "google";
}

export type AuthUser = GitHubUser;

const LISTENERS = new Set<() => void>();
let currentUser: GitHubUser | null = null;
let sessionChecked = false;

function notify() {
  LISTENERS.forEach((cb) => cb());
}

export function getUser(): GitHubUser | null {
  return currentUser;
}

export function isSignedIn(): boolean {
  return currentUser !== null;
}

export function isSessionChecked(): boolean {
  return sessionChecked;
}

// Backend returns { login, name, avatar_url, ... } from serialize_user
function parseUser(raw: Record<string, unknown> | null): GitHubUser | null {
  if (!raw || (!raw.login && !raw.email)) return null;
  return {
    login: String(raw.login ?? raw.github_login ?? raw.email ?? ""),
    name: raw.name ? String(raw.name) : null,
    avatar_url: String(raw.avatar_url ?? ""),
    html_url: String(raw.html_url ?? ""),
    public_repos: Number(raw.public_repos ?? 0),
    followers: Number(raw.followers ?? 0),
    following: Number(raw.following ?? 0),
    email: raw.email ? String(raw.email) : undefined,
    provider: raw.provider === "google" ? "google" : "github",
  };
}

export async function signInWithGitHub(username: string): Promise<GitHubUser> {
  const cleaned = username.trim().replace(/^@/, "");
  if (!cleaned) throw new Error("Please enter a GitHub username");

  const data = await apiFetch<{ user: Record<string, unknown>; progress?: PlayerProgress }>("/api/auth/github-username", {
    method: "POST",
    body: JSON.stringify({ username: cleaned }),
  });

  const user = parseUser(data.user);
  if (!user) throw new Error("Failed to parse user data from server");
  if (data.progress) setProgress(data.progress);
  currentUser = user;
  sessionChecked = true;
  notify();
  return user;
}

export async function signInWithGoogle(email: string, name?: string, avatarUrl?: string): Promise<GitHubUser> {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || !cleaned.includes("@")) throw new Error("Please enter a valid Google email");

  const data = await apiFetch<{ user: Record<string, unknown>; progress?: PlayerProgress }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ email: cleaned, name, avatar_url: avatarUrl }),
  });

  const user = parseUser(data.user);
  if (!user) throw new Error("Failed to parse user data from server");
  if (data.progress) setProgress(data.progress);
  currentUser = user;
  sessionChecked = true;
  notify();
  return user;
}

export async function signOut() {
  await apiFetch("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined);
  currentUser = null;
  sessionChecked = true;
  resetProgress();
  resetBadges();
  notify();
}

export async function refreshSession(): Promise<GitHubUser | null> {
  try {
    const data = await apiFetch<{ user: Record<string, unknown> | null; progress?: PlayerProgress | null }>("/api/me");
    currentUser = parseUser(data.user);
    if (data.progress) setProgress(data.progress);
  } catch {
    currentUser = null;
  }
  sessionChecked = true;
  notify();
  return currentUser;
}

export function useAuth() {
  const [user, setUser] = useState<GitHubUser | null>(() => getUser());
  const [checked, setChecked] = useState(() => isSessionChecked());

  useEffect(() => {
    const cb = () => {
      setUser(getUser());
      setChecked(isSessionChecked());
    };
    LISTENERS.add(cb);
    if (!sessionChecked) {
      refreshSession().catch(() => undefined);
    }
    return () => {
      LISTENERS.delete(cb);
    };
  }, []);

  return { user, isSignedIn: user !== null, sessionChecked: checked };
}
