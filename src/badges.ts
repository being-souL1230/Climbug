/**
 * badges.ts — shared badge definitions + backend-backed unlock state.
 *
 * The 50 badge definitions live here (single source of truth) and the unlock
 * state is computed by the backend (/api/badges) from real solve/streak data.
 */

import { useEffect, useState } from "react";
import type { IconName } from "./components/GameIcon";
import { apiFetch } from "./api";

/* ═══════════════ Badge definitions (ids must match backend badges.py) ═══════════════ */

export interface Badge {
  id: number;
  name: string;
  desc: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  icon: IconName;
  unlock: string;
  category: string;
}

export const badges: Badge[] = [
  // Debugging Streaks (1-10)
  { id: 1, name: "First Blood", desc: "Solve your first bug", rarity: "Common", icon: "bug", unlock: "Level 1", category: "Debugging Streaks" },
  { id: 2, name: "Bug Streak I", desc: "Solve 3 bugs in a day", rarity: "Common", icon: "flame", unlock: "Level 3", category: "Debugging Streaks" },
  { id: 3, name: "Bug Streak II", desc: "Solve 7 bugs in a day", rarity: "Rare", icon: "flame", unlock: "Level 7", category: "Debugging Streaks" },
  { id: 4, name: "Bug Streak III", desc: "Solve 15 bugs in a day", rarity: "Epic", icon: "flame", unlock: "Level 12", category: "Debugging Streaks" },
  { id: 5, name: "Week Warrior", desc: "7-day solving streak", rarity: "Rare", icon: "star", unlock: "Level 8", category: "Debugging Streaks" },
  { id: 6, name: "Month Legend", desc: "30-day solving streak", rarity: "Epic", icon: "star", unlock: "Level 18", category: "Debugging Streaks" },
  { id: 7, name: "Century Club", desc: "100 bugs solved total", rarity: "Epic", icon: "trophy", unlock: "Level 15", category: "Debugging Streaks" },
  { id: 8, name: "Speed Demon", desc: "Solve 5 Advanced or Nightmare bugs in under 10 min each", rarity: "Rare", icon: "lightning", unlock: "Level 10", category: "Debugging Streaks" },
  { id: 9, name: "Night Owl", desc: "Solve 10 bugs between 12am-6am", rarity: "Common", icon: "crystal", unlock: "Level 6", category: "Debugging Streaks" },
  { id: 10, name: "Dawn Raider", desc: "Solve 10 bugs between 5am-9am", rarity: "Common", icon: "crystal", unlock: "Level 6", category: "Debugging Streaks" },

  // Speed Milestones (11-20)
  { id: 11, name: "Speedrunner I", desc: "Solve an Advanced or Nightmare bug in under 2 minutes", rarity: "Rare", icon: "lightning", unlock: "Level 5", category: "Speed Milestones" },
  { id: 12, name: "Speedrunner II", desc: "Solve 10 Advanced or Nightmare bugs in under 5 minutes", rarity: "Epic", icon: "lightning", unlock: "Level 14", category: "Speed Milestones" },
  { id: 13, name: "Lightning Hands", desc: "Solve 3 bugs in under 1 minute each", rarity: "Legendary", icon: "lightning", unlock: "Level 22", category: "Speed Milestones" },
  { id: 14, name: "Quick Fix", desc: "Fix 5 bugs in a single session", rarity: "Common", icon: "sword", unlock: "Level 4", category: "Speed Milestones" },
  { id: 15, name: "Marathon Fixer", desc: "Solve 25 bugs in one sitting", rarity: "Epic", icon: "sword", unlock: "Level 16", category: "Speed Milestones" },
  { id: 16, name: "One Shot", desc: "Solve 5 bugs on first attempt", rarity: "Rare", icon: "target", unlock: "Level 9", category: "Speed Milestones" },
  { id: 17, name: "No Hints Needed", desc: "Solve 20 bugs without using hints", rarity: "Epic", icon: "target", unlock: "Level 13", category: "Speed Milestones" },
  { id: 18, name: "Perfect Run", desc: "Solve 5 bugs with 0 XP penalty", rarity: "Rare", icon: "shield", unlock: "Level 11", category: "Speed Milestones" },
  { id: 19, name: "Time Lord", desc: "Beat the timer on 20 hard challenges", rarity: "Legendary", icon: "timer", unlock: "Level 25", category: "Speed Milestones" },
  { id: 20, name: "Blazing Fast", desc: "Average solve time under 3 minutes (10+ timed solves)", rarity: "Epic", icon: "lightning", unlock: "Level 19", category: "Speed Milestones" },

  // Problem Solvers (21-30)
  { id: 21, name: "Python Novice", desc: "Solve 10 Python challenges", rarity: "Common", icon: "python", unlock: "Level 4", category: "Problem Solvers" },
  { id: 22, name: "Python Master", desc: "Solve all Python challenges", rarity: "Legendary", icon: "python", unlock: "Level 28", category: "Problem Solvers" },
  { id: 23, name: "JS Hunter", desc: "Solve 10 JavaScript challenges", rarity: "Common", icon: "javascript", unlock: "Level 5", category: "Problem Solvers" },
  { id: 24, name: "JS God", desc: "Solve all JavaScript challenges", rarity: "Legendary", icon: "javascript", unlock: "Level 29", category: "Problem Solvers" },
  { id: 25, name: "SQL Sniper", desc: "Solve 10 SQL challenges", rarity: "Common", icon: "sql", unlock: "Level 6", category: "Problem Solvers" },
  { id: 26, name: "SQL Overlord", desc: "Solve all SQL challenges", rarity: "Legendary", icon: "sql", unlock: "Level 30", category: "Problem Solvers" },
  { id: 27, name: "Multi-Stack", desc: "Solve challenges in 3 different tracks", rarity: "Rare", icon: "code", unlock: "Level 10", category: "Problem Solvers" },
  { id: 28, name: "Nightmare Slayer", desc: "Solve 10 Nightmare challenges", rarity: "Epic", icon: "sword", unlock: "Level 20", category: "Problem Solvers" },
  { id: 29, name: "Boss Slayer", desc: "Defeat 5 boss battles", rarity: "Legendary", icon: "bug", unlock: "Level 24", category: "Problem Solvers" },
  { id: 30, name: "Challenge Conqueror", desc: "Solve 100 challenges total", rarity: "Epic", icon: "trophy", unlock: "Level 21", category: "Problem Solvers" },

  // Community & Social (31-38)
  { id: 31, name: "Guild Member", desc: "Join a guild", rarity: "Common", icon: "shield", unlock: "Level 7", category: "Community" },
  { id: 32, name: "Guild Leader", desc: "Reach rank #1 in your guild", rarity: "Epic", icon: "shield", unlock: "Level 17", category: "Community" },
  { id: 33, name: "Mentor", desc: "Help 5 other users solve challenges", rarity: "Rare", icon: "people", unlock: "Level 13", category: "Community" },
  { id: 34, name: "Community Star", desc: "Receive 50 upvotes on solutions", rarity: "Epic", icon: "star", unlock: "Level 18", category: "Community" },
  { id: 35, name: "Bug Reporter", desc: "Report 10 valid bugs", rarity: "Rare", icon: "bug", unlock: "Level 11", category: "Community" },
  { id: 36, name: "Event Participant", desc: "Participate in 5 events", rarity: "Common", icon: "crystal", unlock: "Level 9", category: "Community" },
  { id: 37, name: "Leaderboard Climber", desc: "Reach top 100 global", rarity: "Rare", icon: "trophy", unlock: "Level 15", category: "Community" },
  { id: 38, name: "Global Legend", desc: "Reach top 10 global", rarity: "Legendary", icon: "trophy", unlock: "Level 27", category: "Community" },

  // Special Events (39-45)
  { id: 39, name: "Launch Day Hero", desc: "Solved a bug on launch day", rarity: "Rare", icon: "crystal", unlock: "Special", category: "Special Events" },
  { id: 40, name: "Halloween Hunter", desc: "Solved 20 bugs during Halloween event", rarity: "Epic", icon: "bug", unlock: "Special", category: "Special Events" },
  { id: 41, name: "New Year Solver", desc: "Solved 31 bugs in January", rarity: "Epic", icon: "star", unlock: "Special", category: "Special Events" },
  { id: 42, name: "Anniversary Badge", desc: "1-year anniversary member", rarity: "Legendary", icon: "trophy", unlock: "Special", category: "Special Events" },
  { id: 43, name: "Beta Tester", desc: "Participated in closed beta", rarity: "Epic", icon: "shield", unlock: "Special", category: "Special Events" },
  { id: 44, name: "Bug Hunt Champion", desc: "Won a community bug hunt", rarity: "Legendary", icon: "trophy", unlock: "Special", category: "Special Events" },
  { id: 45, name: "Seasonal Legend", desc: "Complete all seasonal events", rarity: "Legendary", icon: "crystal", unlock: "Special", category: "Special Events" },

  // Hidden / Secret (46-50)
  { id: 46, name: "Shadow Debugger", desc: "Solve 50 bugs with 0 hints", rarity: "Legendary", icon: "bug", unlock: "Secret", category: "Hidden" },
  { id: 47, name: "Ghost in the Machine", desc: "Solve a bug at exactly midnight", rarity: "Epic", icon: "crystal", unlock: "Secret", category: "Hidden" },
  { id: 48, name: "Code Phantom", desc: "Reach level 30", rarity: "Legendary", icon: "shield", unlock: "Secret", category: "Hidden" },
  { id: 49, name: "The Unbreakable", desc: "Maintain a 100-day streak", rarity: "Legendary", icon: "star", unlock: "Secret", category: "Hidden" },
  { id: 50, name: "Debug Deity", desc: "Solve every single challenge", rarity: "Legendary", icon: "trophy", unlock: "Secret", category: "Hidden" },

  // New artwork badges (51-58) — added by the team
  { id: 51, name: "Hexagon Phoenix", desc: "Solve 15 bugs total", rarity: "Common", icon: "flame", unlock: "Level 3", category: "Milestones" },
  { id: 52, name: "Shield Lightning", desc: "Solve bugs in 2 different tracks", rarity: "Common", icon: "shield", unlock: "Level 4", category: "Milestones" },
  { id: 53, name: "Star Dragon", desc: "Solve 3 Advanced challenges", rarity: "Common", icon: "star", unlock: "Level 6", category: "Milestones" },
  { id: 54, name: "Diamond Crown", desc: "Reach level 5", rarity: "Common", icon: "diamond", unlock: "Level 5", category: "Milestones" },
  { id: 55, name: "Medal Owl", desc: "Solve 5 bugs in a single day", rarity: "Common", icon: "crystal", unlock: "Level 7", category: "Milestones" },
  { id: 56, name: "Grail Chalice", desc: "Solve 150 bugs total", rarity: "Legendary", icon: "trophy", unlock: "Level 26", category: "Milestones" },
  { id: 57, name: "Cosmic Orb", desc: "Solve 10 bugs in under 1 minute each", rarity: "Legendary", icon: "crystal", unlock: "Level 27", category: "Milestones" },
  { id: 58, name: "Samurai Katana", desc: "Solve 25 bugs with 0 XP penalty", rarity: "Legendary", icon: "sword", unlock: "Level 28", category: "Milestones" },
];

/* ═══════════════ Backend-backed unlock state (singleton) ═══════════════ */

const LISTENERS = new Set<() => void>();
let _unlocked = new Set<number>();
let _total = 0;
let _loaded = false;
let _fetching: Promise<void> | null = null;

function notify() {
  LISTENERS.forEach((cb) => cb());
}

async function load(): Promise<void> {
  if (_loaded) return;
  if (!_fetching) {
    _fetching = apiFetch<{ unlocked: number[]; total: number }>("/api/badges")
      .then((data) => {
        _unlocked = new Set(data.unlocked ?? []);
        _total = data.total ?? 0;
        _loaded = true;
      })
      .catch(() => {
        // Keep whatever we had; mark as loaded so we don't retry forever.
        _loaded = true;
      })
      .finally(() => {
        _fetching = null;
        notify();
      });
  }
  return _fetching;
}

/** Refetch badges immediately (e.g. after solving a challenge). */
export function refreshBadges(): Promise<void> {
  _loaded = false;
  _fetching = null;
  return load();
}

/** Reset on sign-out so stale data is not shown to the next user. */
export function resetBadges() {
  _unlocked = new Set();
  _total = 0;
  _loaded = false;
  _fetching = null;
  notify();
}

export function useBadges() {
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set(_unlocked));
  const [total, setTotal] = useState(_total);
  const [loaded, setLoaded] = useState(_loaded);

  useEffect(() => {
    const cb = () => {
      setUnlocked(new Set(_unlocked));
      setTotal(_total);
      setLoaded(_loaded);
    };
    LISTENERS.add(cb);
    load();
    return () => {
      LISTENERS.delete(cb);
    };
  }, []);

  return { unlocked, total, loaded };
}
