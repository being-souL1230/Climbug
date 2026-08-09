import { useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import GameIcon from "../components/GameIcon";
import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import { tracks, difficultyStyles, type Difficulty } from "../data";
import { useProgress } from "../progress";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { cn } from "../utils/cn";

const order: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Nightmare"];

export default function TrackDetail() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { slug } = useParams();
  const track = tracks.find((t) => t.slug === slug);
  const { progress } = useProgress();

  if (!track) return <Navigate to="/tracks" replace />;

  // Single flat list — all difficulties live in one container, tagged per row.
  const items = [...track.challenges].sort(
    (a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty) || a.id - b.id
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-[#07070b]">
      <Navbar variant="app" />

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6">
        <Reveal>
          <div className="anime-pop overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0a12] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            
            {/* ── Header Section ── */}
            <div className="relative border-b border-white/[0.06] px-6 py-7 sm:px-8">
              {/* decorative glows */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />
              </div>

              <div className="relative">
                <Link to="/tracks" className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-violet-400">
                  <span>←</span> <span>Back to Tracks</span>
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div className="flex items-center gap-5">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                      <GameIcon name={track.icon} className="h-10 w-10" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-white">{track.name}</h1>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                          {track.total} UNITS
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{track.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      const solvedCount = progress.completed.filter((id) => track.challenges.some((c) => c.id === id)).length;
                      const pct = track.total ? Math.round((solvedCount / track.total) * 100) : 0;
                      return (
                        <div className="text-right">
                          <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Track Progress</div>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="font-mono text-xl font-bold text-white">
                              {solvedCount}<span className="mx-1 text-sm text-zinc-600">/</span>{track.total}
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Content Section — single container, difficulty tags on every row ── */}
            <div className="divide-y divide-white/[0.06] bg-[#09090e]">
              {items.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <GameIcon name="code" className="mx-auto h-10 w-10 text-zinc-700" />
                  <p className="mt-3 text-sm text-zinc-500 italic">No challenges available for this track yet.</p>
                </div>
              ) : (
                <div>
                  {/* Difficulty legend */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.04] bg-white/[0.015] px-6 py-2.5 sm:px-8">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Difficulty</span>
                    {order.map((d) => {
                      const s = difficultyStyles[d];
                      return (
                        <span key={d} className="inline-flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]", s.text, s.bg.replace("/10", ""))} />
                          <span className="text-[10px] font-medium text-zinc-400">{d}</span>
                        </span>
                      );
                    })}
                    <span className="ml-auto font-mono text-[10px] font-bold text-zinc-600">
                      {items.length} CHALLENGES
                    </span>
                  </div>

                  {/* Table Header (Desktop) */}
                  <div className="hidden grid-cols-[2.5rem_1fr_4.5rem_4.5rem_5.5rem_6rem_6.5rem] items-center gap-4 px-6 py-2 sm:px-8 md:grid bg-white/[0.01]">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">#</span>
                    <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Challenge</span>
                    <span className="text-right text-[10px] font-bold tracking-widest text-zinc-600 uppercase">XP</span>
                    <span className="text-right text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Time</span>
                    <span className="text-right text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Stack</span>
                    <span className="text-right text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Status</span>
                    <span className="text-right text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Action</span>
                  </div>

                  {/* All problems in one list */}
                  <div className="divide-y divide-white/[0.04]">
                    {items.map((c, i) => {
                      const solved = progress.completed.includes(c.id);
                      const style = difficultyStyles[c.difficulty];
                      return (
                        <Link
                          key={c.id}
                          to={`/challenge/${c.id}`}
                          className="group grid grid-cols-1 gap-3 px-6 py-3.5 transition-all duration-200 hover:bg-white/[0.03] sm:px-8 md:grid-cols-[2.5rem_1fr_4.5rem_4.5rem_5.5rem_6rem_6.5rem] md:items-center md:gap-4"
                        >
                          <span className="hidden font-mono text-xs text-zinc-600 md:block">{String(i + 1).padStart(2, '0')}</span>

                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-bold text-white transition-colors group-hover:text-violet-300">{c.title}</span>
                              <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide", style.bg, style.text, style.border)}>
                                {c.difficulty}
                              </span>
                              {!solved && <span className="h-1 w-1 shrink-0 rounded-full bg-violet-500/50" />}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-zinc-500">{c.desc}</p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase md:hidden">XP</span>
                            <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                              <GameIcon name="lightning" className="h-3 w-3" />
                              {c.xp}
                            </span>
                          </div>

                          <div className="flex items-center justify-between md:justify-end">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase md:hidden">Time</span>
                            <span className="font-mono text-xs font-medium text-zinc-400">{c.timeMin}m</span>
                          </div>

                          <div className="flex items-center justify-between md:justify-end">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase md:hidden">Stack</span>
                            <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/5">{c.lang}</span>
                          </div>

                          <div className="flex items-center justify-between md:justify-end">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase md:hidden">Status</span>
                            {solved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                DONE
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-zinc-600">—</span>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-black transition-all",
                              solved
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                                : "border-white/10 bg-white/5 text-zinc-400 group-hover:border-violet-500/50 group-hover:text-white group-hover:bg-violet-600/10"
                            )}>
                              {solved ? "REPLAY" : "SOLVE"}
                              <GameIcon name="chevronRight" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
