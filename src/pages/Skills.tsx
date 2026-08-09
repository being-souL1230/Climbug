import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GameIcon from "../components/GameIcon";
import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import { tracks } from "../data";
import { useProgress } from "../progress";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { cn } from "../utils/cn";

const domains = [
  { name: "Languages", match: ["python", "javascript", "c", "cpp", "java", "rust", "go"], color: "#60a5fa" },
  { name: "Backend", match: ["flask", "django", "node", "aspnet", "springboot"], color: "#a78bfa" },
  { name: "Frontend", match: ["react", "angular", "vue", "html", "css"], color: "#22d3ee" },
  { name: "Mobile", match: ["reactnative", "flutter"], color: "#34d399" },
  { name: "DevOps", match: ["git", "docker", "kubernetes", "linux", "aws"], color: "#f59e0b" },
  { name: "Database", match: ["sql"], color: "#818cf8" },
];

const masteryLabels = [
  { max: 0, label: "Unstarted", tone: "text-zinc-500" },
  { max: 20, label: "Scout", tone: "text-sky-400" },
  { max: 45, label: "Practitioner", tone: "text-violet-400" },
  { max: 75, label: "Specialist", tone: "text-amber-400" },
  { max: 100, label: "Master", tone: "text-emerald-400" },
];

function masteryFor(pct: number) {
  if (pct === 0) return masteryLabels[0];
  return masteryLabels.find((m) => pct <= m.max) ?? masteryLabels[masteryLabels.length - 1];
}

export default function Skills() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { progress } = useProgress();
  const [activeDomain, setActiveDomain] = useState("All");

  const trackStats = useMemo(() => {
    return tracks.map((t) => {
      const solved = progress.completed.filter((id) => t.challenges.some((c) => c.id === id)).length;
      const pct = t.total ? Math.round((solved / t.total) * 100) : 0;
      const xp = t.challenges.reduce((sum, c) => sum + c.xp, 0);
      const earned = t.challenges.filter((c) => progress.completed.includes(c.id)).reduce((sum, c) => sum + c.xp, 0);
      return { ...t, solved, pct, xp, earned, mastery: masteryFor(pct) };
    });
  }, [progress.completed]);

  const filtered = activeDomain === "All"
    ? trackStats
    : trackStats.filter((t) => domains.find((d) => d.name === activeDomain)?.match.includes(t.slug));

  const totalSolved = trackStats.reduce((sum, t) => sum + t.solved, 0);
  const totalChallenges = trackStats.reduce((sum, t) => sum + t.total, 0);
  const avgMastery = totalChallenges ? Math.round((totalSolved / totalChallenges) * 100) : 0;
  const strongest = [...trackStats].sort((a, b) => b.pct - a.pct)[0];
  const nextFocus = [...trackStats].filter((t) => t.pct < 100).sort((a, b) => b.solved - a.solved)[0] ?? trackStats[0];

  return (
    <div ref={pageRef} className="min-h-screen bg-[#07070b] text-zinc-100">
      <Navbar variant="app" />

      <main className="mx-auto max-w-[1220px] px-4 pb-24 pt-6 sm:px-6">
        <Reveal>
          <section className="anime-pop overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0a12] shadow-[0_20px_60px_rgba(0,0,0,0.42)]">
            {/* Header */}
            <div className="relative border-b border-white/[0.06] px-6 py-6 sm:px-8">
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/12 blur-[90px]" />
                <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[90px]" />
              </div>

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/20 bg-violet-500/10 shadow-[0_0_26px_rgba(139,92,246,0.18)]">
                    <GameIcon name="brain" className="h-8 w-8 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">Mastery Matrix</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Skills</h1>
                    <p className="mt-1 text-sm text-zinc-400">Track your debugging coverage across every tech stack.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:min-w-[430px]">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Avg Mastery</p>
                    <p className="mt-1 font-mono text-xl font-black text-white">{avgMastery}%</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Solved</p>
                    <p className="mt-1 font-mono text-xl font-black text-emerald-400">{totalSolved}<span className="text-xs text-zinc-600">/{totalChallenges}</span></p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Level</p>
                    <p className="mt-1 font-mono text-xl font-black text-violet-300">{progress.level}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain filter */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-6 py-3 sm:px-8">
              {[{ name: "All", color: "#8b5cf6" }, ...domains].map((d) => {
                const selected = activeDomain === d.name;
                return (
                  <button
                    key={d.name}
                    onClick={() => setActiveDomain(d.name)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
                      selected
                        ? "border-violet-500/50 bg-violet-500/15 text-white shadow-[0_0_14px_rgba(139,92,246,0.16)]"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/14 hover:text-white"
                    )}
                    style={selected ? { borderColor: `${d.color}70`, backgroundColor: `${d.color}1c` } : undefined}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>

            {/* Highlights */}
            <div className="grid gap-0 border-b border-white/[0.06] md:grid-cols-3 md:divide-x md:divide-white/[0.06]">
              <div className="px-6 py-4 sm:px-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Strongest Stack</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <GameIcon name={strongest.icon} className="h-6 w-6" />
                  <span className="font-bold text-white">{strongest.name}</span>
                  <span className="ml-auto font-mono text-sm text-emerald-400">{strongest.pct}%</span>
                </div>
              </div>
              <div className="px-6 py-4 sm:px-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Next Focus</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <GameIcon name={nextFocus.icon} className="h-6 w-6" />
                  <span className="font-bold text-white">{nextFocus.name}</span>
                  <span className="ml-auto font-mono text-sm text-amber-400">{nextFocus.total - nextFocus.solved} left</span>
                </div>
              </div>
              <div className="px-6 py-4 sm:px-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">XP Banked</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <GameIcon name="lightning" className="h-6 w-6 text-amber-300" />
                  <span className="font-mono text-lg font-black text-white">{progress.xp}</span>
                  <span className="text-xs text-zinc-500">earned from solves</span>
                </div>
              </div>
            </div>

            {/* Skills table */}
            <div>
              <div className="hidden grid-cols-[minmax(0,1fr)_6rem_6rem_7rem_7rem] items-center border-b border-white/[0.06] bg-white/[0.015] px-6 py-2 sm:px-8 md:grid">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Stack</span>
                <span className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Solved</span>
                <span className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">XP</span>
                <span className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Mastery</span>
                <span className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Action</span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {filtered.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/tracks/${t.slug}`}
                    className="anime-pop group grid grid-cols-1 gap-3 px-6 py-3.5 transition-all hover:bg-white/[0.03] sm:px-8 md:grid-cols-[minmax(0,1fr)_6rem_6rem_7rem_7rem] md:items-center md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.04]">
                        <GameIcon name={t.icon} className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-violet-300">{t.name}</span>
                          <span className={cn("text-[10px] font-bold", t.mastery.tone)}>{t.mastery.label}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.max(t.pct, 1)}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">{t.pct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[10px] font-bold uppercase text-zinc-600 md:hidden">Solved</span>
                      <span className="font-mono text-xs font-bold text-white">{t.solved}<span className="text-zinc-600">/{t.total}</span></span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[10px] font-bold uppercase text-zinc-600 md:hidden">XP</span>
                      <span className="font-mono text-xs font-bold text-amber-400">{t.earned}<span className="text-zinc-600">/{t.xp}</span></span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[10px] font-bold uppercase text-zinc-600 md:hidden">Mastery</span>
                      <span className={cn("font-mono text-xs font-bold", t.mastery.tone)}>{t.mastery.label}</span>
                    </div>

                    <div className="flex justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-black text-zinc-300 transition-all group-hover:border-violet-500/40 group-hover:bg-violet-500/10 group-hover:text-white">
                        Open
                        <GameIcon name="chevronRight" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  );
}