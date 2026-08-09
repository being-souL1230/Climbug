import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GameIcon, { type IconName } from "../components/GameIcon";
import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import { GridScan } from "../components/GridScan";
import { useAnimeDetails } from "../hooks/useAnimeDetails";

function useCountdown(start: number) {
  const [secs, setSecs] = useState(start);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s <= 0 ? start : s - 1)), 1000);
    return () => clearInterval(t);
  }, [start]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TerminalCard() {
  const time = useCountdown(24 * 60 + 37);
  return (
    <div className="float-slow relative w-[330px] lg:w-[350px]" style={{ ["--tilt" as never]: "rotate(-4deg)", perspective: "1200px" }}>
      {/* slab depth layers behind the card for a heavy, extruded look */}
      <div
        className="absolute inset-0 rounded-2xl bg-[#050409]"
        style={{ transform: "rotate(-4deg) translate(10px, 12px)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1424] to-[#0b0810]"
        style={{ transform: "rotate(-4deg) translate(5px, 6px)" }}
        aria-hidden
      />
      <div
        className="relative rounded-2xl border border-white/10 bg-[#111018] shadow-[0_35px_90px_rgba(0,0,0,0.7),0_2px_0_rgba(255,255,255,0.06)_inset,0_-2px_10px_rgba(0,0,0,0.5)_inset] transition-transform duration-500 hover:scale-[1.03]"
        style={{ transform: "rotate(-4deg)" }}
      >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="anime-dot h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="anime-dot h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="anime-dot h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-zinc-400">bug_challenge.py</span>
        <span className="ml-auto text-xs text-zinc-500">x</span>
      </div>
      <div className="px-4 py-4 font-mono text-[11.5px] leading-[1.7]">
        <p className="anime-pop text-zinc-300">
          <span className="text-zinc-500">$ </span>python <span className="font-bold">bug_challenge.py</span>
        </p>
        <p className="anime-pop text-rose-400">Traceback (most recent call last):</p>
        <p className="anime-pop text-zinc-300">
          {"  "}File <span className="text-sky-400">"bug_challenge.py"</span>, line <span className="text-amber-300">42</span>
        </p>
        <p className="anime-pop text-zinc-400">{"    "}result = calculate(data)</p>
        <p className="anime-pop text-zinc-300">
          {"  "}File <span className="text-sky-400">"bug_challenge.py"</span>, line <span className="text-amber-300">17</span>
        </p>
        <p className="anime-pop text-zinc-400">{"    "}total += values[i]</p>
        <p className="anime-pop">
          <span className="text-rose-400">IndexError:</span>
          <span className="text-zinc-200"> list index out of range</span>
        </p>
        <p className="mt-4 text-[10px] tracking-[0.2em] text-zinc-500">TIME REMAINING</p>
        <p className="mt-1 text-xl font-bold tracking-[0.15em] text-rose-500">{time}</p>
        <span className="blink mt-3 inline-block h-4 w-2 bg-emerald-400" />
      </div>
      </div>
    </div>
  );
}

const stats = [
  { icon: "trophy" as IconName, value: "15+", label: "CHALLENGES" },
  { icon: "bug" as IconName, value: "1+", label: "DEBUGGERS" },
  { icon: "target" as IconName, value: "6", label: "TRACKS" },
];

function GlassCube({ icon, value, label, delay }: { icon: IconName; value: string; label: string; delay: number }) {
  return (
    <div className="anime-pop flex flex-col items-center gap-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative h-24 w-24" style={{ perspective: "800px" }}>
        <div
          className="cube h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            animation: `spinCube 14s infinite linear`,
            animationDelay: `${delay * 2}ms`,
            willChange: "transform",
          }}
        >
          {[
            { transform: "translateZ(48px)", shade: "from-violet-500/20 via-white/8 to-transparent" },
            { transform: "rotateY(180deg) translateZ(48px)", shade: "from-fuchsia-600/15 via-black/10 to-transparent" },
            { transform: "rotateY(90deg) translateZ(48px)", shade: "from-violet-600/15 via-black/15 to-transparent" },
            { transform: "rotateY(-90deg) translateZ(48px)", shade: "from-violet-600/15 via-black/15 to-transparent" },
            { transform: "rotateX(90deg) translateZ(48px)", shade: "from-white/15 via-violet-500/10 to-transparent" },
            { transform: "rotateX(-90deg) translateZ(48px)", shade: "from-black/30 via-black/10 to-transparent" },
          ].map((face, i) => (
            <div
              key={i}
              className={`absolute h-full w-full border border-white/20 bg-gradient-to-br ${face.shade} shadow-[inset_0_0_18px_rgba(255,255,255,0.08),0_0_25px_rgba(139,92,246,0.12)]`}
              style={{ transform: face.transform, backfaceVisibility: "hidden" }}
            >
              {i === 0 && (
                <div className="flex h-full w-full items-center justify-center text-violet-300/70">
                  <GameIcon name={icon} className="h-10 w-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{value}</div>
        <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-400">{label}</div>
      </div>
      <style>{`
        @keyframes spinCube {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
        .cube:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#08060f]">
      <Navbar variant="app" />

      <main className="relative flex min-h-[calc(100vh-62px)] items-center justify-center overflow-hidden py-16">
        {/* GridScan background */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#2F293A"
            gridScale={0.1}
            scanColor="#FF9FFC"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
            lineJitter={0.1}
            scanSoftness={2}
            scanGlow={0.5}
            scanPhaseTaper={0.9}
            scanDuration={2.0}
            scanDelay={2.0}
            scanDirection="pingpong"
            enableWebcam={false}
            enableGyro={false}
            scanOnClick={false}
          />
        </div>

        <div className="relative z-10 flex w-full max-w-[1300px] flex-col items-center gap-10 px-5 lg:flex-row lg:justify-between lg:gap-6 lg:px-10">
          {/* Terminal - left */}
          <Reveal delay={200} className="order-2 hidden md:block lg:order-1">
            <TerminalCard />
          </Reveal>

          {/* Center glass card - with layered 3D slab depth */}
          <Reveal className="order-1 w-full max-w-[500px] lg:order-2">
            <div className="relative" style={{ perspective: "1600px" }}>
              {/* slab depth layers behind for a heavy, extruded 3D look */}
              <div
                className="absolute inset-0 rounded-[28px] bg-[#0a0712]"
                style={{ transform: "translate(14px, 16px)" }}
                aria-hidden
              />
              <div
                className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#1e1530] to-[#0d0a16]"
                style={{ transform: "translate(7px, 8px)" }}
                aria-hidden
              />
              <div
                className="anime-pop relative rounded-[28px] border border-white/10 bg-gradient-to-b from-[#241832]/95 to-[#151020]/95 px-7 py-12 text-center shadow-[0_45px_100px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_12px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:px-12"
                style={{ transform: "rotateX(3deg) rotateY(-2deg)" }}
              >
                <span className="anime-pulse pulse-glow inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-600/80 px-4 py-1.5 text-xs font-bold text-white">
                  <GameIcon name="lightning" className="h-4 w-4" /> The Debugging Platform
                </span>
                <h1 className="mt-7 text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-[44px]">
                  Can you fix the bug before time runs out?
                </h1>
                <p className="mx-auto mt-6 max-w-sm text-[15px] leading-relaxed text-zinc-300">
                  Test your skills. Solve real bugs. Compete with others. Level up your debugging superpowers.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/tracks"
                    className="rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(124,58,237,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-[0_16px_40px_rgba(124,58,237,0.7)]"
                  >
                    Choose a Track -&gt;
                  </Link>
                  <Link
                    to="/dashboard"
                    className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
                  >
                    My Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 3D Glass Cubes - right */}
          <div className="order-3 flex flex-row gap-8 lg:flex-col lg:gap-12">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={300 + i * 130}>
                <GlassCube icon={s.icon} value={s.value} label={s.label} delay={i * 200} />
              </Reveal>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
