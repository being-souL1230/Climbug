import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameIcon, { type IconName } from "../components/GameIcon";
import { apiFetch } from "../api";
import { badges as allBadges, type Badge } from "../badges";
import { getBadgeImage } from "../badgeImages";
import { tracks } from "../data";
import { cn } from "../utils/cn";

/* ═══════════ Title / rank-tier system (mirrors Leaderboard/Rewards) ═══════════ */
const TITLES: { level: number; title: string }[] = [
  { level: 1, title: "Debug Recruit" },
  { level: 3, title: "Bug Hunter" },
  { level: 5, title: "Code Sentinel" },
  { level: 7, title: "Error Slayer" },
  { level: 10, title: "Debug Master" },
  { level: 12, title: "Bug Whisperer" },
  { level: 15, title: "Stack Overlord" },
  { level: 18, title: "Nightmare Walker" },
  { level: 20, title: "Code Phantom" },
  { level: 25, title: "Debug Deity" },
  { level: 30, title: "Immortal Debugger" },
];
function titleForLevel(level: number): string {
  return [...TITLES].reverse().find((t) => level >= t.level)?.title ?? "Debug Recruit";
}

const DIFF_META: Record<string, { color: string; text: string; border: string; bar: string }> = {
  Beginner: { color: "#34d399", text: "text-emerald-400", border: "border-emerald-500/40", bar: "from-emerald-500 to-teal-400" },
  Intermediate: { color: "#38bdf8", text: "text-sky-400", border: "border-sky-500/40", bar: "from-sky-500 to-cyan-400" },
  Advanced: { color: "#fbbf24", text: "text-amber-400", border: "border-amber-500/40", bar: "from-amber-500 to-orange-400" },
  Nightmare: { color: "#fb7185", text: "text-rose-400", border: "border-rose-500/40", bar: "from-rose-500 to-red-400" },
};

const RARITY_STYLE: Record<Badge["rarity"], string> = {
  Common: "border-zinc-500/40",
  Rare: "border-sky-500/40",
  Epic: "border-violet-500/50",
  Legendary: "border-amber-400/60",
};

const SOCIAL_ICONS: Record<string, { label: string; color: string }> = {
  github_url: { label: "GitHub", color: "#e8e8e8" },
  linkedin_url: { label: "LinkedIn", color: "#0a66c2" },
  leetcode_url: { label: "LeetCode", color: "#ffa116" },
  gitlab_url: { label: "GitLab", color: "#fc6d26" },
  twitter_url: { label: "X / Twitter", color: "#1d9bf0" },
  portfolio_url: { label: "Portfolio", color: "#22d3ee" },
  stackoverflow_url: { label: "Stack Overflow", color: "#f48024" },
  devto_url: { label: "Dev.to", color: "#a855f7" },
};

interface PublicProfile {
  user: { id: number; login: string; name: string; avatar: string; memberSince: string; isSelf: boolean };
  stats: { xp: number; level: number; streak: number; solved: number; rank: number };
  solvesByDifficulty: Array<{ difficulty: string; count: number; xp: number }>;
  solvesByTrack: Array<{ slug: string; count: number; xp: number }>;
  badges: number[];
  profile: Record<string, string>;
}

interface SearchUser {
  id: number;
  login: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
}

/* ── Difficulty distribution card ── */
function DiffCard({ diff, count, xp, total }: { diff: string; count: number; xp: number; total: number }) {
  const meta = DIFF_META[diff] ?? DIFF_META.Beginner;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={cn("group rounded-xl border bg-white/[0.02] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04]", meta.border)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
          <span className={cn("text-[10px] font-black uppercase tracking-wider", meta.text)}>{diff}</span>
        </span>
        <span className="font-mono text-sm font-black text-white">{count}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", meta.bar)} style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-600">
        <span>{pct}% of solves</span>
        <span className="font-mono">{xp.toLocaleString()} xp</span>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { login: routeLogin } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState(routeLogin ?? "");
  const [searchResults, setSearchResults] = useState<SearchUser[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLogin = routeLogin ?? null;

  // Fetch profile whenever the URL username changes
  useEffect(() => {
    if (!activeLogin) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProfile(null);
    apiFetch<PublicProfile>(`/api/users/${encodeURIComponent(activeLogin)}`)
      .then((d) => { if (!cancelled) setProfile(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeLogin]);

  const doSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim().replace(/^@/, "");
    if (!q) return;
    setSearching(true);
    apiFetch<{ users: SearchUser[] }>(`/api/users/search?q=${encodeURIComponent(q)}`)
      .then((d) => setSearchResults(d.users))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  };

  const openProfile = (login: string) => {
    navigate(`/user/${login}`);
    setQuery(login);
    setSearchResults(null);
  };

  // Unlocked badges joined with definitions
  const unlockedBadges = useMemo(() => {
    if (!profile) return [];
    const set = new Set(profile.badges);
    return allBadges.filter((b) => set.has(b.id));
  }, [profile]);

  // Track name/icon lookup (stack tracks are in `tracks`)
  const trackMeta = useMemo(() => {
    const m = new Map<string, { name: string; icon: IconName }>();
    tracks.forEach((t) => m.set(t.slug, { name: t.name, icon: t.icon }));
    return m;
  }, []);

  const totalSolved = profile?.stats.solved ?? 0;
  const isYou = profile?.user.isSelf ?? false;

  return (
    <div ref={pageRef} className="min-h-screen bg-[#07070b] text-zinc-100 selection:bg-violet-500/30">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[15%] h-[420px] w-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[500px] rounded-full bg-amber-500/8 blur-[140px]" />
      </div>

      <Navbar variant="app" />

      <main className="relative mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* ═══════════ SEARCH BAR ═══════════ */}
        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0c0b14]/90 p-4 shadow-xl backdrop-blur-sm">
          <form onSubmit={doSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search debugger by username…  (e.g. ava-sterling)"
                className="w-full rounded-xl border border-white/10 bg-[#0e0d18] py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/60 focus:bg-[#111020]"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(124,58,237,0.35)] transition-all hover:bg-violet-500 disabled:opacity-40"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {/* Search results dropdown */}
          {searchResults && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0d18]">
              {searchResults.length === 0 ? (
                <p className="px-4 py-4 text-xs text-zinc-500">No debuggers found for “{query.trim()}”.</p>
              ) : (
                searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => openProfile(u.login)}
                    className="flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-violet-500/[0.07]"
                  >
                    <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full border border-white/10" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{u.name}</span>
                      <span className="block truncate text-[11px] text-zinc-500">@{u.login}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-right">
                      <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-300">Lv {u.level}</span>
                      <span className="font-mono text-xs font-bold text-amber-300">{u.xp} XP</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        {/* ═══════════ PROFILE ═══════════ */}
        {!activeLogin ? (
          <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-20 text-center">
            <GameIcon name="people" className="mx-auto h-12 w-12 text-zinc-700" />
            <h2 className="mt-4 text-lg font-black text-white">Find a Debugger</h2>
            <p className="mt-1 text-sm text-zinc-500">Search a username above to view their public profile — badges, stats, and more.</p>
          </section>
        ) : loading ? (
          <section className="rounded-2xl border border-white/[0.07] bg-[#0c0b14] py-24 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            <p className="mt-3 text-sm text-zinc-500">Loading profile…</p>
          </section>
        ) : error || !profile ? (
          <section className="rounded-2xl border border-rose-500/20 bg-rose-950/20 py-20 text-center">
            <GameIcon name="bug" className="mx-auto h-10 w-10 text-rose-400/70" />
            <h2 className="mt-3 text-lg font-black text-white">User not found</h2>
            <p className="mt-1 text-sm text-zinc-400">{error ?? "No such debugger exists."}</p>
          </section>
        ) : (
          <div className="space-y-5">
            {/* ═══════ HEADER CARD ═══════ */}
            <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#120d20] via-[#0d0b17] to-[#120d1c] p-6 shadow-2xl sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={profile.user.avatar}
                      alt={profile.user.name}
                      className="h-20 w-20 rounded-2xl border-2 border-violet-400/40 object-cover shadow-[0_0_28px_rgba(139,92,246,0.35)]"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-violet-400/50 bg-violet-600 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                      #{profile.stats.rank}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-2xl font-black tracking-tight text-white">{profile.user.name}</h1>
                      {isYou && (
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">YOU</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-400">@{profile.user.login}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        {titleForLevel(profile.stats.level)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-300">
                        Joined {new Date(profile.user.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat chips */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:gap-3">
                  {[
                    { label: "Level", value: profile.stats.level, color: "text-violet-300" },
                    { label: "XP", value: profile.stats.xp.toLocaleString(), color: "text-amber-300" },
                    { label: "Streak", value: profile.stats.streak, color: "text-orange-300", icon: "flame" as IconName },
                    { label: "Solved", value: profile.stats.solved, color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-center transition-all hover:border-white/[0.14]">
                      <div className={cn("flex items-center justify-center gap-1 font-mono text-lg font-black", s.color)}>
                        {s.icon && <GameIcon name={s.icon} className="h-4 w-4" />}
                        {s.value}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════ DIFFICULTY BREAKDOWN ═══════ */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#0c0b14] p-5">
              <div className="mb-3.5 flex items-center gap-2">
                <div className="h-4 w-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Solved by Difficulty</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {["Beginner", "Intermediate", "Advanced", "Nightmare"].map((d) => {
                  const row = profile.solvesByDifficulty.find((x) => x.difficulty === d);
                  return <DiffCard key={d} diff={d} count={row?.count ?? 0} xp={row?.xp ?? 0} total={totalSolved} />;
                })}
              </div>
            </section>

            {/* ═══════ TRACKS + PROFILE DETAILS ═══════ */}
            <section className="grid gap-5 lg:grid-cols-2">
              {/* Track breakdown */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0c0b14] p-5">
                <div className="mb-3.5 flex items-center gap-2">
                  <div className="h-4 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">Track Breakdown</h2>
                </div>
                {profile.solvesByTrack.length === 0 ? (
                  <p className="py-4 text-center text-xs text-zinc-600">No challenges solved yet.</p>
                ) : (
                  <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                    {[...profile.solvesByTrack].sort((a, b) => b.xp - a.xp).map((t) => {
                      const meta = trackMeta.get(t.slug);
                      const maxXp = Math.max(1, ...profile.solvesByTrack.map((x) => x.xp));
                      return (
                        <div key={t.slug} className="group flex items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-white/[0.03]">
                          {meta ? (
                            <GameIcon name={meta.icon} className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:scale-125" />
                          ) : (
                            <GameIcon name="code" className="h-4 w-4 shrink-0 text-zinc-500" />
                          )}
                          <span className="w-28 truncate text-xs font-semibold text-zinc-200">{meta?.name ?? t.slug}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700" style={{ width: `${Math.max(4, (t.xp / maxXp) * 100)}%` }} />
                          </div>
                          <span className="w-12 shrink-0 text-right font-mono text-[11px] font-bold text-zinc-300">{t.count} solved</span>
                          <span className="w-14 shrink-0 text-right font-mono text-[10px] text-amber-300/90">{t.xp} xp</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* About + social links (public fields only) */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0c0b14] p-5">
                <div className="mb-3.5 flex items-center gap-2">
                  <div className="h-4 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">Profile Details</h2>
                </div>
                {Object.keys(profile.profile).length === 0 ? (
                  <p className="py-4 text-center text-xs text-zinc-600">
                    {isYou ? "Add details from your Profile page to share them here." : "This debugger hasn't shared profile details yet."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {profile.profile.about && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                        <GameIcon name="crystal" className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                        <p className="text-xs leading-relaxed text-zinc-300">{profile.profile.about}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SOCIAL_ICONS).map(([key, s]) => {
                        const url = profile.profile[key];
                        if (!url) return null;
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 transition-all hover:border-white/25 hover:text-white"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                            {s.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ═══════ BADGE COLLECTION (unlocked only) ═══════ */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#0c0b14] p-5">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">Badge Collection</h2>
                </div>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                  {unlockedBadges.length} / {allBadges.length} unlocked
                </span>
              </div>

              {unlockedBadges.length === 0 ? (
                <p className="py-6 text-center text-xs text-zinc-600">No badges unlocked yet — solve challenges to earn your first!</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                  {unlockedBadges.map((b) => (
                    <div
                      key={b.id}
                      title={`${b.name} — ${b.desc}`}
                      className={cn(
                        "group flex flex-col items-center rounded-xl border bg-white/[0.02] p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]",
                        RARITY_STYLE[b.rarity]
                      )}
                    >
                      <div className="relative">
                        <img src={getBadgeImage(b)} alt={b.name} className="h-14 w-14 rounded-full border border-white/10 object-cover shadow-[0_0_14px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
                        {b.rarity === "Legendary" && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-black shadow-md">★</span>
                        )}
                      </div>
                      <p className="mt-2 w-full truncate text-[11px] font-bold text-zinc-200 group-hover:text-white">{b.name}</p>
                      <span className={cn("mt-0.5 rounded px-1.5 py-px text-[8px] font-black uppercase tracking-wider", 
                        b.rarity === "Common" ? "bg-zinc-500/10 text-zinc-400" : b.rarity === "Rare" ? "bg-sky-500/10 text-sky-300" : b.rarity === "Epic" ? "bg-violet-500/10 text-violet-300" : "bg-amber-500/10 text-amber-300")}>
                        {b.rarity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* back to leaderboard */}
            <div className="text-center">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-600/10 px-4 py-2 text-xs font-bold text-violet-300 transition-all hover:bg-violet-600/20 hover:text-violet-200"
              >
                <GameIcon name="trophy" className="h-3.5 w-3.5" />
                View Full Leaderboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
