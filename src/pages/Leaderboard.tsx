import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GameIcon, { type IconName } from "../components/GameIcon";
import Navbar, { Footer } from "../components/Navbar";
import Reveal from "../components/Reveal";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { useAuth } from "../auth";
import { tracks } from "../data";
import { useProgress } from "../progress";
import { apiFetch } from "../api";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../utils/cn";

/* ═══════════════════════ Title / rank-tier system (mirrors Rewards page) ═══════════════════════ */
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

type ViewMode = "xp" | "badges" | "level" | "title";
type TimeRange = "all" | "month" | "week";
type Scope = "global" | "friends" | "guilds";

interface Player {
  id: string;
  login: string;
  name: string;
  handle: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  weeklyXp: number;
  monthlyXp: number;
  domainXp: Record<string, number>;
  trend: "up" | "down" | "flat";
  isYou?: boolean;
}



const rarityGlow: Record<number, string> = {
  1: "shadow-[0_0_40px_rgba(251,191,36,0.35)]",
  2: "shadow-[0_0_32px_rgba(203,213,225,0.25)]",
  3: "shadow-[0_0_32px_rgba(217,119,6,0.3)]",
};

const rankRing: Record<number, string> = {
  1: "ring-amber-400/70",
  2: "ring-zinc-300/50",
  3: "ring-amber-700/60",
};

/* ═══════════════════════ Component ═══════════════════════ */
export default function Leaderboard() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { user } = useAuth();
  const { progress } = useProgress();

  const [view, setView] = useState<ViewMode>("xp");
  const [range, setRange] = useState<TimeRange>("all");
  const [domain, setDomain] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<Scope>("global");
  const [remote, setRemote] = useState<Player[] | null>(null);

  // Real leaderboard from the backend — no fake bots. Refetches when the
  // Global / Friends / Guilds scope changes.
  useEffect(() => {
    let cancelled = false;
    setRemote(null);
    apiFetch<{ players: Array<{
      id: number; login: string; name: string; avatar: string;
      xp: number; level: number; badges: number;
      weeklyXp: number; monthlyXp: number;
      domainXp: Record<string, number>;
      trend: "up" | "down" | "flat"; isYou: boolean;
    }> }>(`/api/leaderboard?scope=${scope}`)
      .then((res) => {
        if (cancelled) return;
        setRemote(res.players.map((p) => ({
          id: String(p.id),
          login: p.login,
          name: p.name || p.login,
          handle: `@${p.login}`,
          avatar: p.avatar,
          xp: p.xp,
          level: p.level,
          badges: p.badges,
          weeklyXp: p.weeklyXp,
          monthlyXp: p.monthlyXp,
          domainXp: p.domainXp,
          trend: p.trend,
          isYou: p.isYou,
        })));
      })
      .catch(() => { if (!cancelled) setRemote([]); }); // backend down -> empty board, no fake bots
    return () => { cancelled = true; };
  }, [scope]);

  const you: Player = useMemo(() => {
    const domainXp: Record<string, number> = {};
    tracks.forEach((t) => {
      const solved = progress.completed.filter((id) => t.challenges.some((c) => c.id === id));
      domainXp[t.slug] = solved.reduce((sum, id) => {
        const c = t.challenges.find((ch) => ch.id === id);
        return sum + (c?.xp ?? 0);
      }, 0);
    });
    return {
      id: "you",
      login: user?.login ?? "you",
      name: user?.name || user?.login || "You",
      handle: user ? `@${user.login}` : "@guest",
      avatar: user?.avatar_url || "https://i.pravatar.cc/120?img=68",
      xp: progress.xp,
      level: progress.level,
      badges: Math.max(0, Math.floor(progress.completed.length / 2)),
      weeklyXp: Math.min(progress.xp, 180),
      monthlyXp: Math.min(progress.xp, 420),
      domainXp,
      trend: "up",
      isYou: true,
    };
  }, [user, progress]);

  const allPlayers = useMemo(() => {
    if (remote === null) return []; // still loading from the backend
    // The backend already includes the signed-in user (isYou) with exact badge
    // counts, weekly/monthly XP, and domain XP. We only patch xp/level from the
    // live progress hook so a freshly-solved challenge shows immediately; the
    // backend's precise badge numbers are kept as-is.
    const list = remote.some((p) => p.isYou)
      ? remote.map((p) => (p.isYou ? { ...p, xp: progress.xp, level: progress.level } : p))
      : [you, ...remote];
    return [...list].sort((a, b) => b.xp - a.xp);
  }, [remote, you, progress.xp, progress.level]);

  const scoreFor = (p: Player): number => {
    if (domain !== "ALL") return p.domainXp[domain] ?? 0;
    if (range === "week") return p.weeklyXp;
    if (range === "month") return p.monthlyXp;
    if (view === "badges") return p.badges;
    if (view === "level") return p.level;
    return p.xp;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allPlayers.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => scoreFor(b) - scoreFor(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlayers, search, view, range, domain]);

  const yourRank = filtered.findIndex((p) => p.isYou) + 1;
  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const domains = [{ slug: "ALL", name: "All Domains", icon: "target" as IconName }, ...tracks.slice(0, 10).map((t) => ({ slug: t.slug, name: t.name, icon: t.icon }))];

  useEffect(() => {
    if (!pageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scope = createScope({ root: pageRef.current }).add(() => {
      animate(".lb-row", {
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 420,
        delay: stagger(18),
        ease: "outQuad",
      });
      animate(".lb-podium", {
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.94, 1],
        duration: 550,
        delay: stagger(120, { start: 100 }),
        ease: "outBack",
      });
    });
    return () => scope.revert();
  }, [view, range, domain, search]);

  const viewLabel: Record<ViewMode, string> = {
    xp: "XP",
    badges: "Badges",
    level: "Level",
    title: "Title Tier",
  };

  return (
    <div ref={pageRef} className="relative flex min-h-screen flex-col overflow-hidden bg-[#050509]">
      {/* ═══════ Ambient animated background ═══════ */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="lb-grid absolute inset-0 opacity-40" />
        <div className="orb-a absolute -left-20 top-[-10%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="orb-b absolute right-[-10%] top-[20%] h-[380px] w-[380px] rounded-full bg-fuchsia-500/15 blur-[100px]" />
        <div className="orb-c absolute bottom-[-10%] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-500/10 blur-[120px]" />
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="twinkle absolute h-[3px] w-[3px] rounded-full bg-violet-300"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
              boxShadow: "0 0 6px rgba(196,181,253,0.8)",
            }}
          />
        ))}
      </div>

      <Navbar variant="app" />

      <main className="flex-1 px-4 pb-20 pt-6 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          {/* ═══════ Single unified premium container ═══════ */}
          <Reveal>
            <div className="anime-pop relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0a12]/90 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-sm">
              {/* top edge sheen */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/10 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[90px]" />

              {/* ── Header ── */}
              <div className="relative border-b border-white/[0.06] px-6 py-6 sm:px-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                        <GameIcon name="trophy" className="h-5 w-5 text-amber-300" />
                      </span>
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-white sm:text-[26px]">Global Leaderboard</h1>
                        <p className="text-xs text-zinc-500">Ranked debuggers across every track, tier, and title.</p>
                      </div>
                    </div>
                  </div>

                  {/* your rank summary */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-4 py-2.5">
                      <img src={you.avatar} alt={you.name} className="h-9 w-9 rounded-full border-2 border-violet-400/60" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Your Rank</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-lg font-black text-white">#{yourRank || "—"}</span>
                          <span className="text-[11px] text-zinc-500">{titleForLevel(you.level)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden gap-3 sm:flex">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-center">
                        <div className="font-mono text-sm font-bold text-amber-300">{you.xp}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">XP</div>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-center">
                        <div className="font-mono text-sm font-bold text-emerald-400">{you.badges}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Badges</div>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-center">
                        <div className="font-mono text-sm font-bold text-sky-300">{you.level}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Level</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Scope tabs: Global / Friends / Guilds ── */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {([
                    { key: "global" as Scope, label: "Global", icon: "trophy" as IconName },
                    { key: "friends" as Scope, label: "Friends", icon: "people" as IconName },
                    { key: "guilds" as Scope, label: "Guilds", icon: "shield" as IconName },
                  ]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setScope(s.key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200",
                        scope === s.key
                          ? "border-emerald-500/50 bg-gradient-to-b from-emerald-600/30 to-emerald-700/10 text-white shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                          : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      )}
                    >
                      <GameIcon name={s.icon} className="h-3.5 w-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* ── View mode tabs + search ── */}
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["xp", "badges", "level", "title"] as ViewMode[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200",
                          view === v
                            ? "border-violet-500/50 bg-gradient-to-b from-violet-600/30 to-violet-700/10 text-white shadow-[0_0_14px_rgba(139,92,246,0.25)]"
                            : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                        )}
                      >
                        {viewLabel[v]} Ranking
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
                      {(["all", "month", "week"] as TimeRange[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRange(r)}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-[10px] font-bold uppercase transition-all",
                            range === r ? "bg-white/15 text-white" : "text-zinc-500 hover:text-white"
                          )}
                        >
                          {r === "all" ? "All Time" : r === "month" ? "This Month" : "This Week"}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search debugger..."
                        className="w-[180px] rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.05]"
                      />
                      <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── Domain filter chips ── */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {domains.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => setDomain(d.slug)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200",
                        domain === d.slug
                          ? "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200"
                          : "border-white/[0.05] bg-white/[0.015] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                      )}
                    >
                      {d.slug !== "ALL" && <GameIcon name={d.icon} className="h-3 w-3" />}
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Podium: Top 3 ── */}
              <div className="relative flex items-end justify-center gap-3 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent px-4 py-6 sm:gap-4 sm:px-8">
                {[podium[1], podium[0], podium[2]].map((p, idx) => {
                  if (!p) return <div key={idx} className="w-[30%] max-w-[160px]" />;
                  const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                  const isFirst = rank === 1;
                  return (
                    <Link
                      to={`/user/${p.login}`}
                      key={p.id}
                      className={cn(
                        "lb-podium group relative flex w-[30%] max-w-[160px] flex-col items-center rounded-xl border px-3 transition-all duration-300 hover:-translate-y-1",
                        isFirst
                          ? "z-10 border-amber-400/30 bg-gradient-to-b from-amber-500/[0.08] to-transparent py-4"
                          : "border-white/[0.08] bg-white/[0.02] py-3",
                        rarityGlow[rank]
                      )}
                    >
                      {isFirst && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-lg">👑</div>
                      )}
                      <div className={cn("relative grid place-items-center rounded-full ring-2 ring-offset-2 ring-offset-[#0b0a12]", rankRing[rank], isFirst ? "h-14 w-14" : "h-11 w-11")}>
                        <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full object-cover" />
                        <span className={cn(
                          "absolute -bottom-1 grid h-4.5 w-4.5 place-items-center rounded-full border-2 border-[#0b0a12] text-[9px] font-black text-black",
                          rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-zinc-300" : "bg-amber-700 text-white"
                        )}>
                          {rank}
                        </span>
                      </div>
                      <p className="mt-2 w-full truncate text-center text-xs font-bold text-white">{p.name}{p.isYou && <span className="ml-1 text-violet-400">(You)</span>}</p>
                      <p className="truncate text-[9px] text-zinc-500">{titleForLevel(p.level)}</p>
                      <div className="mt-2 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
                        <GameIcon name="lightning" className="h-3 w-3 text-amber-300" />
                        <span className="font-mono text-xs font-bold text-amber-300">{scoreFor(p)}</span>
                        <span className="text-[9px] text-zinc-500">{domain !== "ALL" ? "dxp" : view === "xp" || range !== "all" ? "xp" : view}</span>
                      </div>
                      <span className="mt-2 text-[9px] font-semibold text-violet-400/0 transition-colors group-hover:text-violet-400">View profile →</span>
                    </Link>
                  );
                })}
              </div>

              {/* ── Table header ── */}
              <div className="hidden grid-cols-[3rem_1fr_6rem_6rem_6rem_5rem] items-center gap-4 border-b border-white/[0.06] bg-white/[0.015] px-6 py-2.5 sm:px-8 md:grid">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Rank</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Debugger</span>
                <span className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">Level</span>
                <span className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">Badges</span>
                <span className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">{domain !== "ALL" ? "Domain XP" : range !== "all" ? `${range} XP` : "XP"}</span>
                <span className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">Trend</span>
              </div>

              {/* ── Rows ── */}
              <div className="max-h-[520px] divide-y divide-white/[0.04] overflow-y-auto custom-scrollbar">
                {rest.map((p, i) => {
                  const rank = i + 4;
                  return (
                    <Link
                      to={`/user/${p.login}`}
                      key={p.id}
                      className={cn(
                        "lb-row group grid grid-cols-[2.5rem_1fr] items-center gap-3 px-6 py-3 transition-all duration-200 hover:bg-white/[0.03] sm:px-8 md:grid-cols-[3rem_1fr_6rem_6rem_6rem_5rem] md:gap-4",
                        p.isYou && "bg-violet-500/[0.06] ring-1 ring-inset ring-violet-500/30"
                      )}
                    >
                      <span className={cn("font-mono text-xs font-bold", p.isYou ? "text-violet-300" : "text-zinc-500")}>#{rank}</span>

                      <div className="flex min-w-0 items-center gap-3">
                        <img src={p.avatar} alt={p.name} className="h-9 w-9 shrink-0 rounded-full border border-white/10" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-bold text-white">{p.name}</span>
                            {p.isYou && <span className="shrink-0 rounded bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">YOU</span>}
                          </div>
                          <p className="truncate text-[11px] text-zinc-500">{p.handle} · {titleForLevel(p.level)}</p>
                          <span className="text-[9px] font-semibold text-violet-400/0 transition-colors group-hover:text-violet-400">View profile →</span>
                        </div>
                      </div>

                      <div className="hidden text-right md:block">
                        <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-bold text-sky-300">Lv {p.level}</span>
                      </div>

                      <div className="hidden items-center justify-end gap-1 text-right md:flex">
                        <GameIcon name="trophy" className="h-3.5 w-3.5 text-amber-300" />
                        <span className="font-mono text-xs font-bold text-zinc-300">{p.badges}</span>
                      </div>

                      <div className="hidden text-right md:block">
                        <span className="font-mono text-sm font-bold text-amber-300">{scoreFor(p)}</span>
                      </div>

                      <div className="hidden justify-end md:flex">
                        {p.trend === "up" && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            UP
                          </span>
                        )}
                        {p.trend === "down" && (
                          <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            DOWN
                          </span>
                        )}
                        {p.trend === "flat" && (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-500">— FLAT</span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {remote === null && (
                  <div className="px-8 py-14 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                    <p className="mt-3 text-sm text-zinc-500">Loading live rankings…</p>
                  </div>
                )}
                {remote !== null && filtered.length === 0 && (
                  <div className="px-8 py-14 text-center">
                    <GameIcon name="target" className="mx-auto h-8 w-8 text-zinc-700" />
                    <p className="mt-3 text-sm text-zinc-500">
                      {search
                        ? "No debuggers match your search."
                        : scope === "friends"
                        ? "You don't have any friends on the leaderboard yet — invite them to climb together!"
                        : scope === "guilds"
                        ? "You're not part of a guild yet — join one to see your teammates here."
                        : "No debuggers ranked yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Footer strip ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.015] px-6 py-3 sm:px-8">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live rankings · {filtered.length} debuggers ranked
                </div>
                <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Gold Tier</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-300" /> Silver Tier</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-700" /> Bronze Tier</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
