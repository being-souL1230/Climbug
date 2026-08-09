import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import GameIcon, { type IconName } from "../components/GameIcon";
import Logo from "../components/Logo";
import Reveal from "../components/Reveal";
import { dailyChallenges, findChallenge, tracks } from "../data";
import { useAuth } from "../auth";
import { useBadges } from "../badges";
import { useProgress } from "../progress";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { apiFetch } from "../api";
import { badges as allBadges } from "../badges";
import { cn } from "../utils/cn";

interface DailyItem {
  id?: number;
  title: string;
  icon: IconName;
  xp: number;
  difficulty?: string;
  solved: boolean;
}

const sideIcons = [
  { icon: "home" as IconName, label: "Home", to: "/" },
  { icon: "bug" as IconName, label: "Boss Battles", to: "/dashboard" },
  { icon: "sword" as IconName, label: "Challenges", to: "/tracks" },
  { icon: "brain" as IconName, label: "Skills", to: "/skills" },
  { icon: "monitor" as IconName, label: "Dashboard", to: "/dashboard", active: true },
  { icon: "trophy" as IconName, label: "Rewards", to: "/rewards" },
];

/** Accent-aware card shell with a cursor-tracked spotlight glow + gradient top edge. */
function Card({
  children,
  className,
  delay = 0,
  accent = "#8b5cf6",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  accent?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 0 });
  const [hovering, setHovering] = useState(false);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <Reveal delay={delay} className="h-full">
      <article
        ref={ref as never}
        onMouseMove={onMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={cn(
          "anime-pop group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-[#15151f] to-[#0e0e15] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5",
          className
        )}
        style={{
          boxShadow: hovering
            ? `0 30px 70px -12px rgba(0,0,0,0.55), 0 0 0 1px ${accent}33, 0 22px 60px -20px ${accent}4d`
            : undefined,
        }}
      >
        {/* top accent line */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        {/* cursor spotlight */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{
            background: `radial-gradient(280px circle at ${pos.x}% ${pos.y}%, ${accent}14, transparent 65%)`,
          }}
        />
        <div className="relative flex h-full flex-col">{children}</div>
      </article>
    </Reveal>
  );
}

function CardHeader({
  icon,
  title,
  lines,
  badge,
}: {
  icon: IconName;
  title: string;
  lines: string[];
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <GameIcon
        name={icon}
        className="anime-pop mt-0.5 h-8 w-8 shrink-0 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-3"
      />
      <div>
        <h3 className="flex items-center gap-2 text-[13px] font-extrabold tracking-[0.1em] text-white">
          {title}
          {badge}
        </h3>
        {lines.map((l) => (
          <p key={l} className="text-xs leading-5 text-zinc-500">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<"Global" | "Friends" | "Guilds">("Global");
  const { progress } = useProgress();
  const { user } = useAuth();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [dailyDate, setDailyDate] = useState("");
  const [dailyLoading, setDailyLoading] = useState(true);

  // Realtime daily challenges — the backend picks a deterministic set per date.
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ date: string; challenges: Array<{ id: number; xp: number; difficulty: string; trackSlug: string; solved: boolean }> }>("/api/daily")
      .then((res) => {
        if (cancelled) return;
        setDailyDate(
          new Date(`${res.date}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
        );
        const items: DailyItem[] = res.challenges.flatMap((c) => {
          const found = findChallenge(c.id);
          if (!found) return [];
          return [
            {
              id: c.id,
              title: found.challenge.title,
              icon: found.track.icon,
              xp: c.xp,
              difficulty: c.difficulty,
              solved: c.solved,
            },
          ];
        });
        setDaily(items);
      })
      .catch(() => {
        if (cancelled) return;
        setDailyDate(new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }));
        setDaily(dailyChallenges.map((c) => ({ title: c.title, icon: c.icon, xp: c.xp, solved: false })));
      })
      .finally(() => {
        if (!cancelled) setDailyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useAnimeDetails(pageRef);
  const displayName = user?.name || user?.login || "Debug Recruit";
  const xpForLevel = progress.level * 500;
  const xpInLevel = progress.xp % 500;
  const xpPct = Math.max(2, (xpInLevel / 500) * 100);
  const totalSolved = progress.completed.length;

  // Real badge state from the backend
  const { unlocked } = useBadges();
  const unlockedBadges = allBadges.filter((b) => unlocked.has(b.id));
  const nextBadge = allBadges.find((b) => !unlocked.has(b.id));

  const [leaderboardTop, setLeaderboardTop] = useState<Array<{ name: string; level: number; xp: number; isYou: boolean }>>([]);

  // Real top-4 leaderboard preview from the backend — follows the selected
  // Global / Friends / Guilds tab (no hardcoded bots).
  useEffect(() => {
    let cancelled = false;
    const scope = tab === "Global" ? "global" : tab === "Friends" ? "friends" : "guilds";
    apiFetch<{ players: Array<{ name: string; login: string; xp: number; level: number; isYou: boolean }> }>(`/api/leaderboard?scope=${scope}`)
      .then((res) => {
        if (cancelled) return;
        setLeaderboardTop(
          res.players.slice(0, 4).map((p) => ({
            name: p.name || p.login,
            level: p.level,
            xp: p.xp,
            isYou: p.isYou,
          }))
        );
      })
      .catch(() => { if (!cancelled) setLeaderboardTop([]); });
    return () => { cancelled = true; };
  }, [tab]);

  const leaderboardPreview = useMemo(() => {
    if (leaderboardTop.length > 0) {
      return leaderboardTop.map((p, i) => ({ ...p, rank: i + 1 }));
    }
    // Offline fallback — never shows fake names as "real" users, just you.
    const you = { rank: 0, name: displayName, level: progress.level, xp: progress.xp, isYou: true };
    return [you].map((p, i) => ({ ...p, rank: i + 1 }));
  }, [leaderboardTop, displayName, progress.level, progress.xp]);

  return (
    <div ref={pageRef} className="flex min-h-screen bg-[#08080d]">
      {/* ---------- Sidebar ---------- */}
      <aside className="sticky top-0 hidden h-screen w-[68px] flex-col items-center border-r border-white/5 bg-[#0a0a11] py-4 md:flex">
        <Link to="/" className="mb-6 transition-transform hover:scale-110 hover:drop-shadow-[0_4px_18px_rgba(139,92,246,0.65)]">
          <Logo size="lg" />
        </Link>
        <nav className="flex flex-1 flex-col gap-2.5">
          {sideIcons.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              title={s.label}
              className={cn(
                "anime-pop grid h-11 w-11 place-items-center rounded-xl text-lg transition-all duration-200 hover:bg-white/10",
                s.active
                  ? "border border-violet-500/50 bg-violet-600/25 shadow-[0_0_16px_rgba(124,58,237,0.4)]"
                  : "border border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <GameIcon name={s.icon} className="h-6 w-6" />
            </Link>
          ))}
        </nav>
        <button className="grid h-11 w-11 place-items-center rounded-xl text-lg opacity-60 transition-all hover:rotate-90 hover:opacity-100">
          <GameIcon name="gear" className="h-6 w-6" />
        </button>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="min-w-0 flex-1">
        {/* HUD bar */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0b13]/95 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-7">
            <div className="flex items-center gap-3">
              {user ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="anime-pop h-10 w-10 rounded-full border-2 border-violet-500/60 shadow-[0_0_14px_rgba(139,92,246,0.5)]"
                />
              ) : (
                <span className="anime-pop grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-base font-black text-white shadow-[0_0_14px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/40">
                  {progress.level}
                </span>
              )}
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-violet-400">LEVEL {progress.level}</p>
                <p className="text-sm font-semibold text-zinc-200">{displayName}</p>
              </div>
            </div>

            <div className="flex min-w-[160px] flex-1 items-center gap-3">
              <GameIcon name="crystal" className="h-6 w-6" />
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
                <div
                  className="anime-progress-fill relative h-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  style={{
                    width: `${xpPct}%`,
                    backgroundImage: "linear-gradient(90deg, #8b5cf6, #d946ef)",
                  }}
                >
                  <span className="level-bar-shine" />
                </div>
              </div>
              <span className="whitespace-nowrap text-xs font-semibold text-zinc-400">{progress.xp} / {xpForLevel} XP</span>
            </div>

            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-2">
                <GameIcon name="flame" className="h-7 w-7" />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-white">{progress.streak}</p>
                  <p className="text-[10px] text-zinc-500">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GameIcon name="diamond" className="h-7 w-7" />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-white">{totalSolved}</p>
                  <p className="text-[10px] text-zinc-500">Solved</p>
                </div>
              </div>
              <GameIcon name="crystal" className="h-7 w-7" />
            </div>
          </div>
        </header>

        <main className="px-4 pb-8 sm:px-7">
          {/* Hero banner */}
          <Reveal>
            <section className="relative mt-5 overflow-hidden rounded-2xl border border-violet-500/15 bg-[#0b0716] px-6 py-8 sm:px-9">
              {/* glowing mountain scene */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                {/* night sky */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, #0e0a22 0%, #16093a 45%, #2a0d4e 78%, #3b1160 100%)",
                  }}
                />
                {/* aurora glow bands */}
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background:
                      "radial-gradient(55% 90% at 72% -18%, rgba(217,70,239,0.34), transparent 60%), radial-gradient(45% 80% at 22% -10%, rgba(56,189,248,0.2), transparent 60%), radial-gradient(70% 55% at 50% 108%, rgba(139,92,246,0.5), transparent 65%)",
                  }}
                />
                {/* stars */}
                {[
                  { l: "6%", t: "18%", s: 2 }, { l: "13%", t: "52%", s: 1.5 }, { l: "21%", t: "26%", s: 2 },
                  { l: "30%", t: "14%", s: 1.5 }, { l: "38%", t: "44%", s: 2 }, { l: "47%", t: "20%", s: 1.5 },
                  { l: "55%", t: "38%", s: 2 }, { l: "63%", t: "12%", s: 2 }, { l: "71%", t: "30%", s: 1.5 },
                  { l: "79%", t: "48%", s: 2 }, { l: "87%", t: "16%", s: 1.5 }, { l: "94%", t: "34%", s: 2 },
                ].map((st, i) => (
                  <span
                    key={i}
                    className="anime-dot absolute rounded-full bg-white"
                    style={{
                      left: st.l, top: st.t, width: st.s, height: st.s,
                      boxShadow: "0 0 6px rgba(255,255,255,0.9), 0 0 14px rgba(167,139,250,0.6)",
                    }}
                  />
                ))}
                {/* glowing moon */}
                <span
                  className="anime-pulse absolute right-[12%] top-3 h-9 w-9 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 38% 35%, #fdf4ff, #e9d5ff 55%, #c084fc)",
                    boxShadow: "0 0 24px rgba(233,213,255,0.8), 0 0 70px rgba(192,132,252,0.5)",
                  }}
                />
                {/* mountains svg */}
                <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
                  <defs>
                    <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#1e1145" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="mtn-mid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b1673" />
                      <stop offset="100%" stopColor="#150c30" />
                    </linearGradient>
                    <linearGradient id="mtn-near" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#241048" />
                      <stop offset="100%" stopColor="#0c0618" />
                    </linearGradient>
                    <linearGradient id="ridge-glow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e879f9" stopOpacity="0" />
                      <stop offset="50%" stopColor="#e879f9" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#e879f9" stopOpacity="0" />
                    </linearGradient>
                    <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* far range */}
                  <path d="M0 220 L0 150 L120 92 L235 148 L340 78 L465 152 L560 108 L690 160 L800 96 L930 158 L1040 112 L1200 165 L1200 220 Z" fill="url(#mtn-far)" />
                  {/* mid range + glowing ridgeline */}
                  <path d="M0 220 L0 178 L150 118 L280 172 L420 100 L575 178 L700 132 L850 184 L980 128 L1120 180 L1200 152 L1200 220 Z" fill="url(#mtn-mid)" />
                  <path d="M0 178 L150 118 L280 172 L420 100 L575 178 L700 132 L850 184 L980 128 L1120 180 L1200 152" fill="none" stroke="url(#ridge-glow)" strokeWidth="2" filter="url(#soft-glow)" />
                  {/* snow caps */}
                  <path d="M405 108 L420 100 L436 109 L428 114 L420 108 L412 115 Z" fill="#f5d0fe" opacity="0.9" filter="url(#soft-glow)" />
                  <path d="M966 135 L980 128 L995 136 L987 141 L980 135 L972 141 Z" fill="#f5d0fe" opacity="0.75" filter="url(#soft-glow)" />
                  {/* near range */}
                  <path d="M0 220 L0 200 L180 152 L330 202 L520 140 L710 206 L880 158 L1060 208 L1200 176 L1200 220 Z" fill="url(#mtn-near)" />
                  {/* flag on tallest peak */}
                  <g filter="url(#soft-glow)">
                    <line x1="520" y1="140" x2="520" y2="118" stroke="#f0abfc" strokeWidth="1.6" />
                    <path d="M520 118 L536 123 L520 129 Z" fill="#e879f9" />
                  </g>
                </svg>
                {/* mist at base */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b0716]/90 to-transparent" />
              </div>
              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h1 className="text-2xl font-black tracking-tight drop-shadow-[0_2px_14px_rgba(139,92,246,0.45)] sm:text-[28px]">
                    <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                      Climbug:
                    </span>{" "}
                    <span className="text-white">Gamified Mastery</span>
                  </h1>
                  <p className="mt-2 font-mono text-[13px] text-fuchsia-200/90 drop-shadow-[0_0_10px_rgba(232,121,249,0.35)]">
                    <span className="mr-2 text-violet-400/70">&lt;/&gt;</span>Art of Fixing: Debugging literature
                  </p>
                </div>
                <div className="text-left italic md:text-right">
                  <p className="text-sm text-violet-100/90 drop-shadow-[0_1px_8px_rgba(88,28,135,0.8)]">
                    <span className="mr-1 align-top font-serif text-lg text-fuchsia-400">&quot;</span>
                    Every bug is a lesson.
                  </p>
                  <p className="text-sm text-violet-100/90 drop-shadow-[0_1px_8px_rgba(88,28,135,0.8)]">Every fix is a victory.</p>
                  <p className="mt-1 text-sm font-bold text-fuchsia-300 drop-shadow-[0_0_12px_rgba(232,121,249,0.5)]">- Keep Climbing.</p>
                </div>
              </div>
            </section>
          </Reveal>

          {/* Card grid */}
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Boss Battles */}
            <Card delay={80} accent="#f43f5e" className="from-[#1c0f13] to-[#0f0a0d]">
              <CardHeader
                icon="sword"
                title="BOSS BATTLES"
                lines={["Face epic bugs. Defeat them.", "Earn glory."]}
                badge={
                  <span className="animate-pulse rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white shadow-[0_0_10px_rgba(244,63,94,0.7)]">
                    NEW
                  </span>
                }
              />
              <div className="relative mt-3 grid h-24 overflow-hidden rounded-xl border border-rose-500/20 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.22),rgba(18,6,10,0.35)_45%,rgba(8,8,13,0.95))] place-items-center">
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(244,63,94,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.16) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                <span className="boss-beetle-shine" />
                <div className="anime-pulse relative grid h-14 w-14 place-items-center rounded-full border border-rose-400/30 bg-rose-950/35 shadow-[0_0_32px_rgba(244,63,94,0.35)] transition-transform duration-700 group-hover/card:scale-110">
                  <GameIcon name="bug" className="h-8 w-8 text-rose-300" />
                </div>
                <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-rose-300 backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" />
                  LIVE RAID
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-500">CURRENT BOSS</p>
                  <p className="text-[15px] font-extrabold text-white">NullPointerius Maximus</p>
                </div>
                <span className="rounded-md border border-rose-500/50 bg-rose-950/60 px-2 py-1 text-[11px] font-bold text-rose-300">
                  Level 6
                </span>
              </div>
              <div className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-white/8 ring-1 ring-inset ring-white/5">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400">
                  <span className="boss-hp-shine" />
                </div>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 0 / 125,000 HP
              </p>
              <button className="group/btn relative mt-3 overflow-hidden rounded-lg border-2 border-amber-700/70 bg-gradient-to-b from-[#4a0d0d] to-[#260606] py-2.5 font-serif text-sm font-bold italic text-amber-100 shadow-[inset_0_0_20px_rgba(220,38,38,0.35),0_8px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500 hover:text-white hover:shadow-[inset_0_0_30px_rgba(220,38,38,0.6),0_10px_30px_rgba(153,27,27,0.5)] active:translate-y-0">
                <span
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,60,60,0.35) 0 1px, transparent 1px 4px)",
                  }}
                />
                <span className="relative inline-flex items-center gap-2">
                  Enter Boss Arena
                  <GameIcon name="sword" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </button>
            </Card>

            {/* Leaderboard */}
            <Card delay={160} accent="#fbbf24">
              <CardHeader
                icon="trophy"
                title="LEADERBOARD"
                lines={["Climb the ranks. Earn respect.", "Be the top debugger."]}
              />
              <div className="mt-3 flex gap-5 border-b border-white/8 text-[13px] font-semibold">
                {(["Global", "Friends", "Guilds"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "relative pb-2.5 transition-colors",
                      tab === t ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {t}
                    <span
                      className={cn(
                        "absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 rounded-full bg-violet-500 transition-transform duration-300",
                        tab === t && "scale-x-100"
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-1 divide-y divide-white/[0.06]">
                  {leaderboardPreview.map((p) => (
                    <div
                      key={p.rank}
                      className={cn(
                        "group/lb flex items-center gap-2.5 py-2 transition-colors duration-200",
                        p.isYou && "-mx-1 rounded-lg bg-violet-500/[0.07] px-1 ring-1 ring-inset ring-violet-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 shrink-0 text-center font-mono text-[11px] font-black",
                          p.rank === 1 ? "text-amber-300" : p.rank === 2 ? "text-zinc-300" : p.rank === 3 ? "text-amber-600" : "text-zinc-600"
                        )}
                      >
                        {p.rank}
                      </span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-700 text-[9px] font-black text-white ring-1 ring-white/10">
                        {p.name[0]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-zinc-200">
                        {p.name}
                        {p.isYou && <span className="ml-1 text-[10px] font-bold text-violet-400">(you)</span>}
                      </span>
                      <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                        Lv{p.level}
                      </span>
                      <span className="w-14 shrink-0 text-right font-mono text-[11px] font-extrabold text-amber-300">
                        {p.xp} <span className="text-[9px] font-medium text-zinc-600">xp</span>
                      </span>
                    </div>
                  ))}
              </div>
              <div className="flex-1" />
              <Link
                to="/leaderboard"
                className="group/l mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 py-2.5 text-center text-sm font-bold text-violet-400 transition-all duration-300 hover:bg-violet-600/15 hover:text-violet-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.25)]"
              >
                View Full Leaderboard
                <GameIcon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/l:translate-x-1" />
              </Link>
            </Card>

            {/* Daily Challenges */}
            <Card delay={240} accent="#10b981">
              <CardHeader
                icon="target"
                title="DAILY CHALLENGES"
                lines={["New challenges every day.", "Sharpen your skills."]}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-zinc-500">{dailyDate || "Loading…"}</p>
                <p className="text-[11px] font-semibold text-emerald-400/80">
                  {daily.filter((c) => c.id != null && progress.completed.includes(c.id)).length} / {daily.length} done
                </p>
              </div>
              <div className="mt-1 divide-y divide-white/[0.06]">
                {dailyLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500/60" />
                    <p className="text-xs text-zinc-600">Loading today's challenges…</p>
                  </div>
                ) : daily.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <GameIcon name="target" className="h-8 w-8 opacity-40" />
                    <p className="text-xs text-zinc-600">Daily challenges are resting. Check back soon!</p>
                  </div>
                ) : (
                  daily.map((c, i) => {
                    const solved = c.id != null && progress.completed.includes(c.id);
                    return (
                      <Link
                        key={c.id ?? c.title}
                        to={c.id != null ? `/challenge/${c.id}` : "/tracks"}
                        className="anime-pop group/item flex items-center gap-2.5 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
                      >
                        <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold text-zinc-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors",
                            solved ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
                          )}
                        >
                          <GameIcon
                            name={c.icon}
                            className={cn(
                              "h-4 w-4 transition-transform duration-300 group-hover/item:scale-110",
                              solved ? "text-emerald-400" : "text-zinc-300"
                            )}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-[12.5px] font-bold", solved ? "text-zinc-500 line-through decoration-emerald-500/40" : "text-white")}>
                            {c.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  solved ? "bg-emerald-500" : "w-0"
                                )}
                              />
                            </div>
                            <span className="shrink-0 font-mono text-[9px] text-zinc-500">{c.difficulty ?? ""}</span>
                          </div>
                        </div>
                        {solved ? (
                          <span className="ml-auto shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-extrabold text-emerald-400">Done</span>
                        ) : (
                          <span className="ml-auto shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-extrabold text-emerald-400">
                            +{c.xp}
                          </span>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
              <div className="flex-1" />
              <Link
                to="/tracks"
                className="group/l mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/40 py-2.5 text-center text-sm font-bold text-emerald-400 transition-all duration-300 hover:bg-emerald-900/40 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                View All Challenges
                <GameIcon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/l:translate-x-1" />
              </Link>
            </Card>

            {/* Personal Dashboard */}
            <Card delay={320} accent="#a78bfa">
              <CardHeader
                icon="chart"
                title="PERSONAL DASHBOARD"
                lines={["Track your journey.", "Analyze. Improve. Master."]}
              />
              <div className="mt-3 flex items-center gap-4">
                <div className="relative grid h-20 w-20 shrink-0 place-items-center transition-transform duration-500 group-hover/card:scale-105">
                  <svg viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
                    <defs>
                      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                    <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="url(#ring-grad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (xpPct / 100) * 264}
                      className="drop-shadow-[0_0_6px_rgba(167,139,250,0.6)]"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{progress.level}</p>
                    <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-500">LEVEL</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-500">TOTAL XP</p>
                  <p className="text-xl font-black text-white">{progress.xp}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">To Next Level</p>
                  <p className="text-[13px] font-extrabold text-violet-400">{xpForLevel} XP</p>
                </div>
              </div>
              {/* Scrollable Skill Breakdown */}
              <div className="mt-3 max-h-[130px] overflow-y-auto pr-2 custom-scrollbar">
                <p className="sticky top-0 z-10 mb-2 bg-[#0e0e15] pb-1 text-[10px] font-bold tracking-[0.18em] text-zinc-500 backdrop-blur-sm">SKILL BREAKDOWN</p>
                <ul className="space-y-2">
                  {tracks.map((t) => {
                    const solved = progress.completed.filter((id) => t.challenges.some((c) => c.id === id)).length;
                    const pct = t.total ? Math.round((solved / t.total) * 100) : 0;
                    return (
                      <li key={t.name} className="group/skill flex items-center gap-2.5 text-[13px]">
                        <GameIcon name={t.icon} className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover/skill:scale-125" />
                        <span className="w-20 truncate font-medium text-zinc-300">{t.name}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                            style={{ width: `${Math.max(pct, 1)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] text-zinc-500">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex-1" />
              <Link
                to="/dashboard"
                className="group/l mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-gradient-to-b from-violet-700/60 to-violet-900/60 py-2.5 text-center text-sm font-bold text-violet-200 transition-all duration-300 hover:from-violet-600/70 hover:to-violet-800/70 hover:text-white hover:shadow-[0_0_24px_rgba(124,58,237,0.35)]"
              >
                Go to Full Dashboard
                <GameIcon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/l:translate-x-1" />
              </Link>
            </Card>
          </section>

          {/* Bottom strip */}
          <Reveal delay={120}>
            <section className="mt-6 grid divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/8 bg-[#101017] md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="anime-pop group flex items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-white/[0.03]">
                <span className="text-4xl drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <GameIcon name="trophy" className="h-12 w-12" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-amber-500">ACHIEVEMENT</p>
                  <p className="text-[15px] font-extrabold text-white">{unlockedBadges[0]?.name ?? "No badges yet"}</p>
                  <p className="text-xs text-zinc-500">
                    {unlockedBadges.length > 0 ? "Badges earned — keep climbing!" : "Solve challenges to earn badges!"}
                  </p>
                </div>
              </div>
              <div className="anime-pop group flex items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-white/[0.03]">
                <span className="text-4xl drop-shadow-[0_0_12px_rgba(217,119,6,0.4)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <GameIcon name="chest" className="h-12 w-12" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-amber-500">NEXT REWARD</p>
                  <p className="text-[15px] font-extrabold text-white">{nextBadge?.name ?? "All badges earned"}</p>
                  <p className="text-xs text-zinc-500">{nextBadge?.desc ?? "You've collected every badge!"}</p>
                </div>
                <span className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-black text-white shadow-[0_0_14px_rgba(124,58,237,0.5)] transition-transform duration-300 group-hover:scale-110">
                  {unlockedBadges.length}
                </span>
              </div>
              <div className="anime-pop group flex items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-white/[0.03]">
                <GameIcon
                  name="shield"
                  className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-violet-400">GUILD</p>
                  {progress.guild ? (
                    <>
                      <p className="truncate text-[15px] font-extrabold text-white">{progress.guild.name}</p>
                      <p className="text-xs text-zinc-500">
                        Rank #{progress.guild.rank} of {progress.guild.memberCount} · {progress.guild.xp.toLocaleString()} Guild XP
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-extrabold text-zinc-300">No guild yet</p>
                      <p className="text-xs text-zinc-500">Join a guild to squad up with other debuggers.</p>
                    </>
                  )}
                </div>
              </div>
            </section>
          </Reveal>
        </main>
      </div>
    </div>
  );
}
