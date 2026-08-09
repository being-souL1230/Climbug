/**
 * progress.ts — backend-backed singleton for player progress.
 *
 * Mirrors the auth.ts pattern: module-level state shared across all hook
 * instances so every page re-renders when progress changes.
 *
 * Usage:
 *   const { progress, loading, refresh } = useProgress();
 *
 * After a challenge submit you can push the backend response directly:
 *   import { setProgress } from "../progress";
 *   setProgress(result.progress);
 */

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import type { PlayerProgress } from "./data";

const DEFAULT: PlayerProgress = {
  xp: 0,
  level: 1,
  completed: [],
  streak: 0,
  lastActive: "",
  attempts: {},
  rank: 0,
};

const LISTENERS = new Set<() => void>();
let _progress: PlayerProgress = { ...DEFAULT };
let _loaded = false;
let _fetching: Promise<PlayerProgress> | null = null;

function notify() {
  LISTENERS.forEach((cb) => cb());
}

export function getProgress(): PlayerProgress {
  return _progress;
}

/** Push an already-fetched progress object (e.g. from a submit response). */
export function setProgress(p: PlayerProgress) {
  _progress = p;
  _loaded = true;
  notify();
}

/** Fetch fresh progress from /api/progress and broadcast to all listeners. */
export async function fetchProgress(): Promise<PlayerProgress> {
  // Deduplicate concurrent fetches
  if (_fetching) return _fetching;
  _fetching = apiFetch<PlayerProgress>("/api/progress")
    .then((data) => {
      _progress = data;
      _loaded = true;
      notify();
      return _progress;
    })
    .catch(() => {
      _loaded = true;
      notify();
      return _progress;
    })
    .finally(() => {
      _fetching = null;
    });
  return _fetching;
}

/** Reset (called on sign-out so stale data is not shown to the next user). */
export function resetProgress() {
  _progress = { ...DEFAULT };
  _loaded = false;
  _fetching = null;
  notify();
}

export function useProgress() {
  const [p, setP] = useState<PlayerProgress>(() => getProgress());
  const [loading, setLoading] = useState(!_loaded);

  useEffect(() => {
    const cb = () => {
      setP(getProgress());
      setLoading(false);
    };
    LISTENERS.add(cb);

    if (!_loaded) {
      fetchProgress().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      LISTENERS.delete(cb);
    };
  }, []);

  return { progress: p, loading, refresh: fetchProgress };
}
