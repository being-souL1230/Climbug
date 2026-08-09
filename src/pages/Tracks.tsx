import { useRef } from "react";
import { Link } from "react-router-dom";
import GameIcon from "../components/GameIcon";
import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import { tracks } from "../data";
import { useProgress } from "../progress";
import { useAnimeDetails } from "../hooks/useAnimeDetails";

export default function Tracks() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { progress } = useProgress();

  const totalSolved = progress.completed.length;
  const totalChallenges = tracks.reduce((s, t) => s + t.total, 0);
  const totalPct = totalChallenges ? Math.round((totalSolved / totalChallenges) * 100) : 0;
  const totalXP = tracks.reduce((s, t) => s + t.challenges.reduce((a, c) => a + c.xp, 0), 0);

  const trackStats = tracks.map(t => {
    const solved = progress.completed.filter(id => t.challenges.some(c => c.id === id)).length;
    const pct = t.total ? Math.round((solved / t.total) * 100) : 0;
    const xp = t.challenges.reduce((a, c) => a + c.xp, 0);
    const difficulties = {
      Beginner: t.challenges.filter(c => c.difficulty === "Beginner").length,
      Intermediate: t.challenges.filter(c => c.difficulty === "Intermediate").length,
      Advanced: t.challenges.filter(c => c.difficulty === "Advanced").length,
      Nightmare: t.challenges.filter(c => c.difficulty === "Nightmare").length,
    };
    return { ...t, solved, pct, xp, difficulties };
  });

  return (
    <div ref={pageRef} className="min-h-screen bg-[#07070b]">
      <Navbar variant="app" />

      <main className="mx-auto max-w-[1100px] px-5 pb-24 pt-8">

        {/* Single unified container */}
        <Reveal>
          <div className="anime-pop overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0a12] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

            {/* ── Header row ── */}
            <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.7)]" />
                  <h1 className="text-xl font-black tracking-tight text-white">Debugging Tracks</h1>
                </div>
                <p className="mt-1 text-sm text-zinc-400">Choose your battleground. Fix bugs. Earn XP.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick stats chips */}
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                  <GameIcon name="lightning" className="h-3.5 w-3.5 text-amber-300" />
                  <span className="font-mono text-xs font-bold text-white">{totalXP}</span>
                  <span className="text-[10px] text-zinc-500">XP</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                  <GameIcon name="bug" className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-white">{totalSolved}/{totalChallenges}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5">
                  <span className="font-mono text-xs font-bold text-violet-300">{totalPct}%</span>
                </div>
              </div>
            </div>

            {/* ── Overall progress bar ── */}
            <div className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-3">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Overall</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-all duration-700" style={{ width: `${totalPct}%` }} />
              </div>
              <span className="font-mono text-[11px] font-bold text-zinc-400">{totalPct}%</span>
            </div>

            {/* ── Column headers ── */}
            <div className="hidden items-center border-b border-white/[0.06] bg-white/[0.015] px-6 py-2 md:grid md:grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_11rem_5rem]">
              <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-500">TRACK</span>
              <span className="text-right text-[10px] font-bold tracking-[0.15em] text-zinc-500">XP</span>
              <span className="text-right text-[10px] font-bold tracking-[0.15em] text-zinc-500">SOLVED</span>
              <span className="text-right text-[10px] font-bold tracking-[0.15em] text-zinc-500">PROGRESS</span>
              <span className="text-center text-[10px] font-bold tracking-[0.15em] text-zinc-500">DIFFICULTY</span>
              <span className="text-right text-[10px] font-bold tracking-[0.15em] text-zinc-500">ACTION</span>
            </div>

            {/* ── Track rows ── */}
            {trackStats.map((t, idx) => (
              <Link
                key={t.slug}
                to={`/tracks/${t.slug}`}
                className={`anime-pop group flex flex-col gap-3 px-6 py-4 transition-all duration-200 hover:bg-white/[0.03] md:grid md:grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_11rem_5rem] md:items-center md:gap-4 ${
                  idx < trackStats.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                {/* Track logo — plain, no box */}
                <div className="flex items-center gap-3.5">
                  <GameIcon
                    name={t.icon}
                    className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{t.name}</span>
                      <span className="rounded border px-1.5 py-0.5 text-[9px] font-bold" style={{ borderColor: `${t.accent}44`, color: t.accent }}>
                        {t.total} problems
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{t.desc}</p>
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center justify-between md:justify-end">
                  <span className="text-[10px] text-zinc-500 md:hidden">XP</span>
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                    <GameIcon name="lightning" className="h-3 w-3 md:hidden" />
                    {t.xp}
                  </span>
                </div>

                {/* Solved */}
                <div className="flex items-center justify-between md:justify-end">
                  <span className="text-[10px] text-zinc-500 md:hidden">Solved</span>
                  <span className="font-mono text-xs font-bold text-white">
                    {t.solved}<span className="text-zinc-500">/{t.total}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 md:flex-col md:items-end md:gap-1">
                  <span className="text-[10px] text-zinc-500 md:hidden">Progress</span>
                  <div className="hidden h-1 w-full overflow-hidden rounded-full bg-white/[0.06] md:block">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(t.pct, 2)}%`, background: t.accent }} />
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: t.accent }}>{t.pct}%</span>
                </div>

                {/* Difficulty breakdown dots */}
                <div className="flex items-center justify-between md:justify-center">
                  <span className="text-[10px] text-zinc-500 md:hidden">Difficulty</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-zinc-400">{t.difficulties.Beginner}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      <span className="text-zinc-400">{t.difficulties.Intermediate}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-zinc-400">{t.difficulties.Advanced}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="text-zinc-400">{t.difficulties.Nightmare}</span>
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <span
                    className="inline-flex items-center gap-1 rounded-lg border border-lime-400/40 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-300 transition-all duration-200 group-hover:border-lime-400/70 group-hover:bg-lime-400/20 group-hover:shadow-[0_0_18px_rgba(163,230,53,0.25)]"
                  >
                    {t.solved > 0 ? "Continue" : "Start"}
                    <GameIcon name="chevronRight" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}

            {/* ── Footer summary ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.015] px-6 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-zinc-400">Beginner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="text-[10px] font-medium text-zinc-400">Intermediate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-medium text-zinc-400">Advanced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-medium text-zinc-400">Nightmare</span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-500">
                {totalChallenges} total challenges across {tracks.length} tracks
              </span>
            </div>

          </div>
        </Reveal>
      </main>
    </div>
  );
}
