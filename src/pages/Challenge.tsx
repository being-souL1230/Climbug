import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import GameIcon from "../components/GameIcon";
import Navbar from "../components/Navbar";
import { findChallenge, difficultyStyles, type Challenge } from "../data";
import { useProgress, setProgress } from "../progress";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { cn } from "../utils/cn";
import { apiFetch } from "../api";
import Editor from "@monaco-editor/react";

// No need for LANG_MAP if we use monacoLang directly from the challenge object

function useTimer(startSeconds: number) {
  const [secs, setSecs] = useState(startSeconds);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);
  return { time: `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`, done };
}

/* ---------- Success Overlay ---------- */
function SuccessOverlay({ xp, onClose }: { xp: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06060b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Challenge solved"
    >
      <div
        className="anime-pop w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f18] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">Bug Squashed!</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">Your fix is correct. Keep climbing!</p>
        <div className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-2 font-mono text-sm font-bold text-amber-300">
          +{xp} XP
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Fail Overlay ---------- */
function FailOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06060b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Incorrect solution"
    >
      <div
        className="anime-pop w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f18] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-rose-500/25 bg-rose-500/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">Not Quite Right</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          Your fix doesn't match the expected solution.
          <br />
          Check the hints and try again.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-zinc-200 transition-colors hover:bg-white/10"
        >
          Keep Trying
        </button>
      </div>
    </div>
  );
}

/* ---------- Editor Loading Placeholder ---------- */
function EditorLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0e0e15] font-mono text-xs text-zinc-500">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141420] px-5 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <svg className="h-5 w-5 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-zinc-300">Loading IDE Workspace...</span>
      </div>
    </div>
  );
}

/* ---------- Challenge Page ---------- */
export default function Challenge() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { id } = useParams();
  const found = useMemo(() => findChallenge(Number(id)), [id]);
  const [code, setCode] = useState("");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpPenalty, setXpPenalty] = useState(0);

  const { progress } = useProgress();
  const alreadyDone = found ? progress.completed.includes(found.challenge.id) : false;
  const timeMin = found ? found.challenge.timeMin : 3;
  const { time, done: timeDone } = useTimer(timeMin * 60);

  if (!found) return <Navigate to="/tracks" replace />;
  const { challenge, track } = found;
  const style = difficultyStyles[challenge.difficulty];

  const handleSubmit = async () => {
    if (submitted || alreadyDone) return;
    try {
      const result = await apiFetch<{ solved: boolean; xpAwarded?: number; progress?: import("../data").PlayerProgress }>(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ code, xpPenalty }),
      });
      if (result.solved) {
        if (result.progress) setProgress(result.progress);
        setSubmitted(true);
        setShowSuccess(true);
      } else {
        setShowFail(true);
      }
    } catch {
      setShowFail(true);
    }
  };

  const handleReset = () => {
    setCode(challenge.code);
    setSubmitted(false);
    setRevealed([]);
    setXpPenalty(0);
  };

  useEffect(() => {
    if (found) setCode(found.challenge.code);
  }, [found]);

  if (timeDone && !submitted && !alreadyDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a10]">
        <Navbar variant="app" />
        <div className="text-center">
          <GameIcon name="timer" className="mx-auto mb-4 h-16 w-16 text-rose-400" />
          <h1 className="text-3xl font-black text-white">Time's Up!</h1>
          <p className="mt-2 text-zinc-400">You ran out of time. Better luck next time!</p>
          <Link to={`/tracks/${track.slug}`} className="mt-6 inline-block rounded-xl border border-violet-500/50 px-6 py-3 text-sm font-bold text-violet-400 transition-all hover:bg-violet-900/30">
            Back to {track.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="flex min-h-screen flex-col bg-[#0a0a10]">
      {showSuccess && <SuccessOverlay xp={Math.max(0, challenge.xp - xpPenalty)} onClose={() => setShowSuccess(false)} />}
      {showFail && <FailOverlay onClose={() => setShowFail(false)} />}

      <Navbar variant="app" />

      {/* Challenge header bar */}
      <div className="sticky top-[62px] z-40 border-b border-white/6 bg-[#0d0d15]/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to={`/tracks/${track.slug}`} className="text-sm text-zinc-400 transition-colors hover:text-white">
            &lt;- {track.name}
          </Link>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${style.text} ${style.border} ${style.bg}`}>
            {challenge.difficulty}
          </span>
          <h1 className="text-[15px] font-extrabold text-white">{challenge.title}</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className={cn(
              "flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-base font-bold tracking-[0.1em]",
              timeDone ? "border-rose-500/30 bg-rose-950/30 text-rose-400" : "border-white/10 bg-[#14141e] text-white"
            )}>
              <GameIcon name="timer" className="h-4 w-4" /> {time}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-amber-400">
              <GameIcon name="lightning" className="h-4 w-4" /> {Math.max(0, challenge.xp - xpPenalty)} XP
            </span>
            {alreadyDone && (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">✓ Solved</span>
            )}
          </div>
        </div>
      </div>

      <main className="grid flex-1 lg:grid-cols-[340px_1fr]">
        {/* Left sidebar */}
        <aside className="anime-pop border-b border-white/6 bg-[#0c0c13] px-6 py-7 lg:border-b-0 lg:border-r">
          <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-zinc-400">
            <GameIcon name="bug" className="h-5 w-5" /> THE BUG
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">{challenge.desc}</p>

          <div className="mt-5 rounded-lg border border-rose-900/50 bg-[#1a0d10] p-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-rose-400/80">EXPECTED ERROR</p>
            <p className="mt-1.5 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-rose-300">{challenge.expectedError}</p>
          </div>

          <div className="mt-3 rounded-lg border border-amber-900/50 bg-[#1a1408] p-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-amber-400/80">THE BUG IS</p>
            <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-amber-200">{challenge.bug}</p>
          </div>

          <h2 className="mt-6 flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-zinc-400">
            <GameIcon name="target" className="h-5 w-5" /> HINTS <span className="font-normal normal-case tracking-normal text-rose-400/80">(-10 XP EACH)</span>
          </h2>
          <div className="mt-3 space-y-2.5">
            {challenge.hints.map((h, i) => {
              const open = revealed.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!open) {
                      setRevealed((r) => [...r, i]);
                      setXpPenalty((p) => p + 10);
                    }
                  }}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left text-[13px] transition-all duration-200",
                    open
                      ? "border-violet-500/40 bg-violet-950/30 text-zinc-200"
                      : "border-white/8 bg-[#14141d] text-zinc-400 hover:border-violet-500/40 hover:text-zinc-200"
                  )}
                >
                  {open ? (
                    <span className="flex items-start gap-2">
                      <GameIcon name="hint" className="mt-0.5 h-4 w-4 shrink-0" /> {h}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <GameIcon name="target" className="h-4 w-4 shrink-0" /> Hint {i + 1} — Click to reveal (-10 XP)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Code editor panel */}
        <section className="anime-pop flex min-w-0 flex-col bg-[#0e0e15]">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/6 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-violet-300">
                {track.name}
              </span>
              <span className="text-zinc-600 text-xs">/</span>
              <span className="rounded bg-indigo-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-indigo-300">
                {challenge.lang}
              </span>
            </div>
            <span className="text-sm text-zinc-500">Fix the code in the editor</span>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-lg border border-white/12 px-4 py-2 text-sm font-bold text-zinc-300 transition-all hover:border-white/30 hover:text-white"
              >
                <GameIcon name="reset" className="mr-1 inline-block h-4 w-4 align-middle" /> Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitted || alreadyDone}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-bold shadow-[0_6px_18px_rgba(124,58,237,0.4)] transition-all",
                  alreadyDone
                    ? "cursor-default bg-emerald-600 text-white"
                    : submitted
                    ? "cursor-default bg-zinc-700 text-zinc-400"
                    : "bg-violet-600 text-white hover:bg-violet-500 hover:shadow-[0_8px_24px_rgba(124,58,237,0.6)]"
                )}
              >
                <GameIcon name="play" className="mr-1 inline-block h-4 w-4 align-middle" /> {alreadyDone ? "Solved" : "Submit Fix"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={challenge.monacoLang}
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
    </div>
  );
}
