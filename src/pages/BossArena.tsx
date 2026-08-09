import { useCallback, useEffect, useMemo, useState } from "react";
import { useBlocker, useNavigate, type Location } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameIcon from "../components/GameIcon";
import Editor from "@monaco-editor/react";
import { apiFetch } from "../api";
import { setProgress } from "../progress";
import { refreshBadges } from "../badges";
import { cn } from "../utils/cn";

interface Boss {
  id: number;
  week: string;
  weekNumber: number;
  name: string;
  title: string;
  lang: string;
  monaco: string;
  desc: string;
  bug: string;
  expectedError: string;
  starterCode: string;
  xpReward: number;
  timeLimitSec: number;
  maxLives: number;
}

type BossStatus = "none" | "active" | "defeated" | "forfeited" | "failed";

interface BossState {
  status: BossStatus;
  lives: number;
  attempts: number;
  startedAt?: string | null;
  endedAt?: string | null;
  xpAwarded?: number;
}

interface BossApi {
  boss: Boss;
  state: BossState;
  stats: { defeatedCount: number; raiderCount: number; totalUsers: number };
}

/* ── Hearts row ── */
function Hearts({ lives, max }: { lives: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={cn(
            "h-5 w-5 transition-all duration-300",
            i < lives
              ? "scale-100 fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
              : "scale-90 fill-none text-zinc-700"
          )}
        >
          <path
            d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.4 4.9 6 4.3c2.1-.4 4.1.5 6 2.6 1.9-2.1 3.9-3 6-2.6 3.6.6 5.6 4.3 4 7.4C19.5 16.3 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ── Premium warning / result dialog ── */
function BossDialog({
  kind,
  title,
  message,
  xp,
  onClose,
}: {
  kind: "warning" | "victory";
  title: string;
  message: string;
  xp?: number;
  onClose: () => void;
}) {
  const isWarning = kind === "warning";
  const isVictory = kind === "victory";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050309]/75 p-4 backdrop-blur-md">
      <div
        className={cn(
          "anime-pop relative w-full max-w-md overflow-hidden rounded-3xl border p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.8)]",
          isWarning
            ? "border-rose-500/40 bg-gradient-to-b from-[#1d0a10] via-[#140709] to-[#0b0508]"
            : "border-amber-400/50 bg-gradient-to-b from-[#1c1405] via-[#150f04] to-[#0c0903]"
        )}
      >
        {/* ambient glows */}
        <div
          className={cn(
            "pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full blur-3xl",
            isWarning ? "bg-rose-600/25" : "bg-amber-500/25"
          )}
        />
        {!isVictory && (
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        )}

        <div className="relative">
          <div
            className={cn(
              "mx-auto grid h-16 w-16 place-items-center rounded-2xl border",
              isWarning
                ? "border-rose-500/40 bg-rose-950/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                : "border-amber-400/40 bg-amber-950/40 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
            )}
          >
            {isVictory ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-amber-300">
                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v1.5M12 12.5V14m0 0 2.5 2.5M12 14l-2.5 2.5M12 14v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 20c1.5-2 4-3 7-3s5.5 1 7 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-rose-400">
                <circle cx="9" cy="13" r="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M4 21c1.2-2.5 2.8-3.8 5-3.8s3.8 1.3 5 3.8M16 21c.8-1.7 1.9-2.5 3.2-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <h2
            className={cn(
              "mt-5 font-serif text-2xl font-black italic tracking-tight",
              isWarning ? "text-rose-300" : "text-amber-200"
            )}
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-300">{message}</p>

          {xp !== undefined && (
            <div className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2 font-mono text-lg font-black text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.25)]">
              <GameIcon name="lightning" className="h-4 w-4" /> +{xp} XP
            </div>
          )}

          <button
            onClick={onClose}
            className={cn(
              "mt-7 w-full rounded-xl py-3 text-sm font-bold text-white transition-all duration-200",
              isVictory
                ? "bg-gradient-to-r from-amber-600 to-orange-600 shadow-[0_8px_24px_rgba(251,191,36,0.35)] hover:brightness-110"
                : "bg-gradient-to-r from-rose-700 to-red-800 shadow-[0_8px_24px_rgba(244,63,94,0.35)] hover:brightness-110"
            )}
          >
            {isVictory ? "Claim Your Glory" : "Return to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0e0e15] font-mono text-xs text-zinc-500">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141420] px-5 py-3">
        <svg className="h-5 w-5 animate-spin text-rose-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-zinc-300">Summoning the Boss…</span>
      </div>
    </div>
  );
}

export default function BossArena() {
  const navigate = useNavigate();

  const [boss, setBoss] = useState<Boss | null>(null);
  const [state, setState] = useState<BossState | null>(null);
  const [stats, setStats] = useState<{ defeatedCount: number; raiderCount: number; totalUsers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fight screen
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);

  const fighting = state?.status === "active";
  const [now, setNow] = useState(Date.now());

  // Load current boss + state
  useEffect(() => {
    let cancelled = false;
    apiFetch<BossApi>("/api/boss")
      .then((d) => {
        if (cancelled) return;
        setBoss(d.boss);
        setState(d.state);
        setStats(d.stats);
        if (d.state.status === "active") setCode(d.boss.starterCode);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load the arena");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: keep the community defeat counter fresh while on the entry screen
  useEffect(() => {
    if (loading || !boss || fighting || state?.status !== "none") return;
    const t = setInterval(() => {
      apiFetch<BossApi>("/api/boss")
        .then((d) => setStats(d.stats))
        .catch(() => undefined);
    }, 30000);
    return () => clearInterval(t);
  }, [loading, boss, fighting, state?.status]);

  // Realtime fight timer (server-authoritative remaining time)
  useEffect(() => {
    if (!fighting || !state?.startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [fighting, state?.startedAt]);

  const remainingMs = useMemo(() => {
    if (!boss || !fighting || !state?.startedAt) return boss?.timeLimitSec ?? 0;
    const elapsed = Math.max(0, Date.now() - new Date(state.startedAt).getTime());
    return Math.max(0, boss.timeLimitSec * 1000 - elapsed);
  }, [boss, fighting, state?.startedAt, now]);

  // ── Exit trap: block in-app navigation + warn on tab close ──
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: Location; nextLocation: Location }) =>
        fighting && currentLocation.pathname !== nextLocation.pathname,
      [fighting]
    )
  );

  useEffect(() => {
    if (blocker.state === "blocked") setLeaveDialog(true);
  }, [blocker.state]);

  useEffect(() => {
    if (!fighting) return;
    const handler = (e: BeforeUnloadEvent) => {
      // Best-effort forfeit — deserters can't rejoin this week's raid.
      try {
        navigator.sendBeacon("/api/boss/forfeit", new Blob([JSON.stringify({ reason: "leave" })], { type: "application/json" }));
      } catch {
        /* ignore */
      }
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [fighting]);

  // Timer hit zero → the boss overwhelms the player
  useEffect(() => {
    if (fighting && remainingMs <= 0) {
      apiFetch<{ ok: boolean }>("/api/boss/forfeit", { method: "POST", body: JSON.stringify({ reason: "time" }) })
        .then(() => setState((s) => (s ? { ...s, status: "failed", lives: 0 } : s)))
        .catch(() => undefined);
    }
  }, [fighting, remainingMs]);

  const startFight = async () => {
    try {
      const d = await apiFetch<BossApi>("/api/boss/start", { method: "POST" });
      setBoss(d.boss);
      setState(d.state);
      setStats(d.stats);
      setCode(d.boss.starterCode);
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "The arena rejects you.");
    }
  };

  const handleSubmit = async () => {
    if (!boss || submitting) return;
    setSubmitting(true);
    try {
      const d = await apiFetch<{ solved: boolean; xpAwarded?: number; livesLeft?: number; status?: string; progress?: import("../data").PlayerProgress }>(
        "/api/boss/submit",
        { method: "POST", body: JSON.stringify({ code }) }
      );
      if (d.solved && d.xpAwarded !== undefined) {
        if (d.progress) setProgress(d.progress);
        refreshBadges().catch(() => undefined);
        setState((s) => (s ? { ...s, status: "defeated", xpAwarded: d.xpAwarded ?? 0 } : s));
      } else {
        const livesLeft = d.livesLeft ?? 0;
        setShake(true);
        window.setTimeout(() => setShake(false), 500);
        setState((s) => {
          const status = d.status === "failed" ? "failed" : s?.status ?? "active";
          return s ? { ...s, lives: livesLeft, attempts: s.attempts + 1, status } : s;
        });
      }
    } catch {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const forfeitAndLeave = async () => {
    try {
      await apiFetch<{ ok: boolean }>("/api/boss/forfeit", { method: "POST", body: JSON.stringify({ reason: "leave" }) });
    } catch {
      /* ignore */
    }
    setState((s) => (s ? { ...s, status: "forfeited" } : s));
    if (blocker.state === "blocked") blocker.proceed();
  };

  // Warning / result dialog routing
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100">
        <Navbar variant="app" />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-400" />
            <p className="text-sm text-zinc-500">The arena is opening…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !boss) {
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100">
        <Navbar variant="app" />
        <div className="flex h-[60vh] items-center justify-center px-4">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-8 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!boss || !state) {
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100">
        <Navbar variant="app" />
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-500">No boss this week.</p>
        </div>
      </div>
    );
  }

  // ── Post-fight screens ──
  if (state.status === "defeated") {
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100">
        <Navbar variant="app" />
        <BossDialog
          kind="victory"
          title={`${boss.name} Has Fallen`}
          message={`You defeated ${boss.title} in the Week ${boss.weekNumber} raid. The arena remembers your name. A new, deadlier boss arrives next week.`}
          xp={state.xpAwarded || boss.xpReward}
          onClose={() => navigate("/dashboard")}
        />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <GameIcon name="sword" className="mx-auto h-14 w-14 text-amber-300" />
            <h1 className="mt-4 font-serif text-3xl font-black italic text-amber-200">The Arena Is Yours</h1>
            <p className="mt-2 text-sm text-zinc-400">You may return next week for the next raid.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "forfeited" || state.status === "failed") {
    const wasTimeOut = state.status === "failed";
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100">
        <Navbar variant="app" />
        <BossDialog
          kind="warning"
          title={wasTimeOut ? "The Boss Consumed You" : "Raid Abandoned"}
          message={
            wasTimeOut
              ? `${boss.name} overwhelmed you before your fix landed. The arena does not grant rematches — you cannot rejoin this week's raid. Return next week, stronger.`
              : `Deserting a raid is unforgivable. ${boss.name} will not accept a deserter — you cannot rejoin this week's raid. The arena will judge you again next week.`
          }
          onClose={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  // ── Entry screen (no fight yet) ──
  if (!fighting) {
    return (
      <div className="min-h-screen bg-[#07070b] text-zinc-100 selection:bg-rose-500/30">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-[15%] left-[20%] h-[420px] w-[560px] rounded-full bg-rose-600/10 blur-[140px]" />
          <div className="absolute bottom-[-15%] right-[10%] h-[420px] w-[520px] rounded-full bg-orange-600/8 blur-[140px]" />
        </div>
        <Navbar variant="app" />

        <main className="relative mx-auto max-w-[820px] px-4 pb-24 pt-8 sm:px-6">
          {/* Boss header */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-b from-[#1a0b10] via-[#120609] to-[#0a0507] p-7 shadow-2xl sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-600/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="grid h-24 w-24 place-items-center rounded-2xl border border-rose-500/40 bg-rose-950/40 shadow-[0_0_40px_rgba(244,63,94,0.35)]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-rose-400">
                    <circle cx="9" cy="13" r="5" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="17" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 21c1.2-2.5 2.8-3.8 5-3.8s3.8 1.3 5 3.8M16 21c.8-1.7 1.9-2.5 3.2-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black tracking-wider text-white shadow-lg">
                  WEEK {boss.weekNumber}
                </span>
              </div>

              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-rose-400 uppercase">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" /> Current Raid Boss
                </p>
                <h1 className="mt-1 font-serif text-3xl font-black italic tracking-tight text-white sm:text-4xl">{boss.name}</h1>
                <p className="mt-0.5 text-sm text-rose-300/90 italic">“{boss.title}”</p>
              </div>
            </div>

            <p className="relative mt-6 text-sm leading-relaxed text-zinc-300">{boss.desc}</p>

            {/* Stats strip */}
            <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "XP Reward", value: `${boss.xpReward.toLocaleString()} XP`, color: "text-amber-300" },
                { label: "Time Limit", value: `${Math.floor(boss.timeLimitSec / 60)} min`, color: "text-rose-300" },
                { label: "Lives", value: `${boss.maxLives} hearts`, color: "text-rose-300" },
                { label: "Raiders", value: `${stats?.raiderCount ?? 0} of ${stats?.totalUsers ?? "—"}`, color: "text-zinc-300" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-center">
                  <div className={cn("font-mono text-base font-black", s.color)}>{s.value}</div>
                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Community progress */}
            <div className="relative mt-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span>Community Defeats</span>
                <span className="font-mono text-zinc-300">
                  {stats?.defeatedCount ?? 0} / {(stats?.raiderCount ?? 0) || 1} slain
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, ((stats?.defeatedCount ?? 0) / Math.max(1, stats?.raiderCount ?? 0)) * 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={startFight}
              className="group/btn relative mt-7 w-full overflow-hidden rounded-xl border-2 border-amber-700/70 bg-gradient-to-b from-[#4a0d0d] to-[#260606] py-4 font-serif text-lg font-bold italic text-amber-100 shadow-[inset_0_0_24px_rgba(220,38,38,0.35),0_10px_28px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500 hover:text-white hover:shadow-[inset_0_0_34px_rgba(220,38,38,0.6),0_14px_36px_rgba(153,27,27,0.5)] active:translate-y-0"
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,60,60,0.35) 0 1px, transparent 1px 4px)" }}
              />
              <span className="relative inline-flex items-center gap-3">
                Enter the Arena
                <GameIcon name="sword" className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
              </span>
            </button>
            <p className="relative mt-3 text-center text-[11px] text-zinc-500">
              One life per week. Abandon the fight and the arena will never let you back in.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── ACTIVE FIGHT ──
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const timerText = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  const timeLow = remainingMs <= 60_000;

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100 selection:bg-rose-500/30">
      {/* leave-confirm dialog (blocker) */}
      {leaveDialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#050309]/80 p-4 backdrop-blur-md">
          <div className="anime-pop w-full max-w-sm rounded-2xl border border-rose-500/40 bg-gradient-to-b from-[#1d0a10] to-[#0b0508] p-7 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-rose-500/40 bg-rose-950/40">
              <GameIcon name="sword" className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-black italic text-rose-300">Abandon the Raid?</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Leaving now forfeits this week's fight. <span className="font-bold text-rose-300">You will NOT be able to rejoin</span> until next week's boss arrives.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setLeaveDialog(false);
                  if (blocker.state === "blocked") blocker.reset();
                }}
                className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-zinc-200 transition-all hover:bg-white/10"
              >
                Stay & Fight
              </button>
              <button
                onClick={forfeitAndLeave}
                className="rounded-xl bg-gradient-to-r from-rose-700 to-red-800 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar variant="app" />

      {/* Sticky fight header */}
      <div className="sticky top-[62px] z-40 border-b border-white/6 bg-[#0d0a10]/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-rose-500/40 bg-rose-950/40">
              <GameIcon name="sword" className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-400">Boss Raid · Week {boss.weekNumber}</p>
              <p className="text-sm font-extrabold text-white">{boss.name}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Hearts lives={state.lives} max={boss.maxLives} />
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-base font-bold tracking-[0.1em]",
                timeLow ? "animate-pulse border-rose-500/50 bg-rose-950/40 text-rose-400" : "border-white/10 bg-[#14141e] text-white"
              )}
            >
              <GameIcon name="timer" className="h-4 w-4" /> {timerText}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-amber-400">
              <GameIcon name="lightning" className="h-4 w-4" /> {boss.xpReward.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      <main className={cn("grid flex-1 lg:grid-cols-[360px_1fr]", shake && "boss-shake")}>
        {/* Left: boss intel */}
        <aside className="border-b border-white/6 bg-[#0c0a11] px-6 py-6 lg:border-b-0 lg:border-r">
          <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-rose-400">
            <GameIcon name="bug" className="h-5 w-5" /> THE BUG
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">{boss.desc}</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-[#14141d]">
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-rose-500/10 text-[11px] font-black leading-none text-rose-400">!</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black tracking-[0.16em] text-zinc-500 uppercase">Expected Error</p>
                <p className="mt-1 whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-zinc-300">{boss.expectedError}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/[0.06] px-4 py-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-amber-500/10">
                <GameIcon name="bug" className="h-3 w-3 text-amber-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black tracking-[0.16em] text-zinc-500 uppercase">The Bug Is</p>
                <p className="mt-1 font-mono text-[11.5px] leading-relaxed text-zinc-300">{boss.bug}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-950/15 px-4 py-3">
            <p className="text-[9px] font-black tracking-[0.16em] text-rose-400 uppercase">Arena Rules</p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-zinc-400">
              <li className="flex gap-2"><span className="text-rose-400">•</span> Every wrong fix costs one heart. Zero hearts = the fight is over.</li>
              <li className="flex gap-2"><span className="text-rose-400">•</span> Leave the arena mid-fight and you are banned until next week.</li>
              <li className="flex gap-2"><span className="text-rose-400">•</span> There is no hint. The bug must be understood, not guessed.</li>
            </ul>
          </div>
        </aside>

        {/* Editor */}
        <section className="flex min-w-0 flex-col bg-[#0e0e15]">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/6 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-300">BOSS</span>
              <span className="text-zinc-600 text-xs">/</span>
              <span className="rounded bg-indigo-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-indigo-300">{boss.lang}</span>
            </div>
            <span className="text-sm text-zinc-500">Wrong submissions: {state.attempts}</span>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setLeaveDialog(true)}
                className="rounded-lg border border-white/12 px-4 py-2 text-sm font-bold text-zinc-400 transition-all hover:border-rose-500/50 hover:text-rose-300"
              >
                Leave Arena
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-rose-600 to-red-700 px-5 py-2 text-sm font-bold text-white shadow-[0_6px_18px_rgba(244,63,94,0.4)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? "Fighting…" : "Submit Fix"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={boss.monaco}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              loading={<EditorLoading />}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                renderLineHighlight: "line",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "off",
                padding: { top: 16 },
              }}
            />
          </div>
        </section>
      </main>

      <style>{`
        @keyframes bossShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(9px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(4px); }
        }
        .boss-shake { animation: bossShake 0.5s ease; }
      `}</style>
    </div>
  );
}
