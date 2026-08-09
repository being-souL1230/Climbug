import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import GameIcon, { type IconName } from "../components/GameIcon";
import { animate, createScope, stagger } from "animejs";
import { badges, useBadges, type Badge } from "../badges";
import { useProgress } from "../progress";

const THUMB = "/images/thumbs/";

interface LevelReward {
  level: number;
  title: string;
  reward: string;
  icon: IconName;
}

const levelRewards: LevelReward[] = [
  { level: 1, title: "Debug Recruit", reward: "Starter Badge", icon: "bug" },
  { level: 3, title: "Bug Hunter", reward: "Flame Badge", icon: "flame" },
  { level: 5, title: "Code Sentinel", reward: "Speed Badge", icon: "lightning" },
  { level: 7, title: "Error Slayer", reward: "Streak Badge", icon: "star" },
  { level: 10, title: "Debug Master", reward: "Multi-Stack Badge", icon: "code" },
  { level: 12, title: "Bug Whisperer", reward: "Epic Badge Slot", icon: "target" },
  { level: 15, title: "Stack Overlord", reward: "Community Star", icon: "people" },
  { level: 18, title: "Nightmare Walker", reward: "Legendary Badge", icon: "sword" },
  { level: 20, title: "Code Phantom", reward: "Hidden Badge Access", icon: "crystal" },
  { level: 25, title: "Debug Deity", reward: "Ultimate Title + Theme", icon: "trophy" },
  { level: 30, title: "Immortal Debugger", reward: "All Badges + Prestige", icon: "shield" },
];

const rarityStyles: Record<Badge["rarity"], { ring: string; pill: string; glow: string; text: string; bg: string }> = {
  Common: {
    ring: "from-zinc-500 via-zinc-400 to-zinc-700 border-zinc-500/40",
    pill: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
    glow: "shadow-[0_0_15px_rgba(161,161,170,0.12)] group-hover:shadow-[0_0_20px_rgba(161,161,170,0.25)]",
    text: "text-zinc-300",
    bg: "from-zinc-900/10 to-transparent",
  },
  Rare: {
    ring: "from-sky-400 via-cyan-400 to-blue-600 border-sky-400/50",
    pill: "bg-sky-500/10 border-sky-400/30 text-sky-300",
    glow: "shadow-[0_0_18px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]",
    text: "text-sky-300",
    bg: "from-sky-900/10 to-transparent",
  },
  Epic: {
    ring: "from-violet-400 via-fuchsia-500 to-purple-700 border-violet-400/50",
    pill: "bg-violet-500/10 border-violet-400/30 text-violet-300",
    glow: "shadow-[0_0_20px_rgba(167,139,250,0.25)] group-hover:shadow-[0_0_28px_rgba(167,139,250,0.45)]",
    text: "text-violet-300",
    bg: "from-violet-900/10 to-transparent",
  },
  Legendary: {
    ring: "from-amber-300 via-yellow-400 to-orange-600 border-amber-400/60",
    pill: "bg-amber-500/10 border-amber-400/40 text-amber-300",
    glow: "shadow-[0_0_22px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_32px_rgba(251,191,36,0.55)]",
    text: "text-amber-300",
    bg: "from-amber-900/10 to-transparent",
  },
};

const categoryIcons: Record<string, IconName> = {
  "Debugging Streaks": "flame",
  "Speed Milestones": "lightning",
  "Problem Solvers": "code",
  "Community": "people",
  "Special Events": "crystal",
  "Hidden": "shield",
  "Milestones": "star",
};

const badgeImageMap: Record<string, string> = {
  "First Blood": "badge_first_blood.webp",
  "Bug Streak I": "badge_bug_streak.webp",
  "Bug Streak II": "badge_bug_streak.webp",
  "Bug Streak III": "badge_bug_streak.webp",
  "Week Warrior": "badge_week_warrior.webp",
  "Month Legend": "badge_month_legend.webp",
  "Century Club": "badge_century_club.webp",
  "Speed Demon": "badge_speed_demon.webp",
  "Night Owl": "badge_night_owl.webp",
  "Dawn Raider": "badge_dawn_raider.webp",
  "Speedrunner I": "badge_speedrunner.webp",
  "Speedrunner II": "badge_speedrunner.webp",
  /* ── Legendary: dedicated 4k images used where available; only the rest
     share the 3 themed legendary images ── */
  "Lightning Hands": "badge_lightning_hands.webp",
  "Quick Fix": "badge_4k_blazing_fast.webp",
  "Marathon Fixer": "badge_4k_marathon_fixer.webp",
  "One Shot": "badge_one_shot.webp",
  "No Hints Needed": "badge_4k_no_hints.webp",
  "Perfect Run": "badge_4k_perfect_run.webp",
  "Time Lord": "legendary_chronos_weaver.webp",
  "Blazing Fast": "badge_time_lord.webp",
  "Python Novice": "badge_4k_bug_reporter.webp",
  "Python Master": "legendary_masterpiece_badge.webp",
  "JS Hunter": "badge_4k_bug_reporter.webp",
  "JS God": "legendary_singularity_core.webp",
  "SQL Sniper": "badge_4k_bug_reporter.webp",
  "SQL Overlord": "legendary_singularity_core.webp",
  "Multi-Stack": "badge_4k_bug_reporter.webp",
  "Nightmare Slayer": "badge_4k_nightmare_slayer.webp",
  "Boss Slayer": "legendary_masterpiece_badge.webp",
  "Challenge Conqueror": "badge_challenge_conqueror.webp",
  "Guild Member": "badge_4k_guild_leader.webp",
  "Guild Leader": "badge_4k_guild_leader.webp",
  "Mentor": "badge_4k_mentor.webp",
  "Community Star": "badge_4k_community_star.webp",
  "Bug Reporter": "badge_4k_bug_reporter.webp",
  "Event Participant": "badge_4k_bug_reporter.webp",
  "Leaderboard Climber": "badge_4k_global_legend.webp",
  "Global Legend": "legendary_masterpiece_badge.webp",
  "Launch Day Hero": "badge_4k_bug_reporter.webp",
  "Halloween Hunter": "badge_4k_shadow_debugger.webp",
  "New Year Solver": "badge_4k_bug_reporter.webp",
  "Anniversary Badge": "legendary_masterpiece_badge.webp",
  "Beta Tester": "badge_4k_beta_tester.webp",
  "Bug Hunt Champion": "badge_4k_bug_hunt_champion.webp",
  "Seasonal Legend": "badge_4k_seasonal_legend.webp",
  "Shadow Debugger": "badge_shadow_debugger.webp",
  "Ghost in the Machine": "badge_4k_ghost_machine.webp",
  "Code Phantom": "badge_4k_code_phantom.webp",
  "The Unbreakable": "badge_4k_unbreakable.webp",
  "Debug Deity": "badge_4k_debug_deity.webp",
  /* ── New artwork (51-58) ── */
  "Hexagon Phoenix": "badge_1_hexagon_phoenix.webp",
  "Shield Lightning": "badge_2_shield_lightning.webp",
  "Star Dragon": "badge_3_star_dragon.webp",
  "Diamond Crown": "badge_4_diamond_crown.webp",
  "Medal Owl": "badge_5_medal_owl.webp",
  "Grail Chalice": "legendary_1_grail_chalice.webp",
  "Cosmic Orb": "legendary_2_cosmic_orb.webp",
  "Samurai Katana": "legendary_3_samurai_katana.webp",
};

/* ================= LEVEL ROADMAP — arrow-navigated, no horizontal scroll ================= */
function LevelRoadmap({ levelRewards, currentLevel }: { levelRewards: LevelReward[]; currentLevel: number }) {
  const [perPage, setPerPage] = useState(4);
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 560) setPerPage(1);
      else if (w < 820) setPerPage(2);
      else if (w < 1100) setPerPage(3);
      else setPerPage(4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const totalPages = Math.max(1, Math.ceil(levelRewards.length / perPage));

  // Keep page in range whenever perPage changes
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  // Jump to the page containing the current level on first mount
  useEffect(() => {
    const idx = levelRewards.findIndex((l) => l.level === currentLevel);
    const activeIdx = idx === -1 ? 0 : idx;
    setPage(Math.floor(activeIdx / perPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, next));
    if (clamped === page) return;
    setPage(clamped);
    if (trackRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animate(trackRef.current, {
        opacity: [0.35, 1],
        translateY: [6, 0],
        duration: 380,
        ease: "outQuad",
      });
    }
  };

  const start = page * perPage;
  const visible = levelRewards.slice(start, start + perPage);
  const placeholders = Math.max(0, perPage - visible.length);

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0a14]/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? "w-5 bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]" : "w-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold tracking-wider text-zinc-500">
            {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>
          <div className="ml-1 flex items-center gap-1.5">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Previous levels"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03] disabled:hover:text-zinc-300"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages - 1}
              aria-label="Next levels"
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03] disabled:hover:text-zinc-300"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Connecting line behind nodes */}
      <div className="relative">
        <div className="absolute top-[26px] left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-500/40 via-violet-500/30 to-white/10 hidden md:block" />

        <div
          ref={trackRef}
          className="relative grid gap-3"
          style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
        >
          {visible.map((lr) => {
            const isUnlocked = currentLevel >= lr.level;
            const isCurrent =
              currentLevel === lr.level ||
              (currentLevel > lr.level && !levelRewards.some((x) => x.level > lr.level && x.level <= currentLevel));

            return (
              <div
                key={lr.level}
                className={`level-node group relative flex min-w-0 flex-col justify-between rounded-xl border p-3.5 transition-all duration-300 ${
                  isCurrent
                    ? "border-amber-400/60 bg-gradient-to-b from-amber-500/15 via-[#161224] to-[#0e0b18] shadow-[0_0_25px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/50"
                    : isUnlocked
                    ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-[#11101d] to-[#0d0c15] hover:border-emerald-500/50"
                    : "border-white/[0.05] bg-white/[0.02] opacity-70 hover:opacity-100 hover:border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[11px] font-black tracking-widest ${isUnlocked ? "text-emerald-400" : "text-zinc-500"}`}>
                      LVL {lr.level}
                    </span>
                    {isCurrent && (
                      <span className="animate-pulse rounded bg-gradient-to-r from-amber-500 to-yellow-400 px-1.5 py-0.5 text-[9px] font-black text-black shadow-sm">
                        CURRENT
                      </span>
                    )}
                    {isUnlocked && !isCurrent && <span className="text-[10px] text-emerald-400">✓</span>}
                  </div>

                  <div className={`mt-1.5 truncate text-sm font-black tracking-tight ${isUnlocked ? "text-white" : "text-zinc-400"}`}>
                    {lr.title}
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-white/[0.04] bg-black/40 px-2.5 py-1.5 text-xs">
                  <GameIcon name={lr.icon} className={`h-3.5 w-3.5 shrink-0 ${isUnlocked ? "text-amber-300" : "text-zinc-500"}`} />
                  <span className={`truncate text-[11px] font-medium ${isUnlocked ? "text-zinc-200" : "text-zinc-500"}`}>{lr.reward}</span>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[#08070e]/85 transition-opacity group-hover:bg-[#08070e]/75">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <GameIcon name="lock" className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <span className="mt-1 font-mono text-[10px] font-bold text-zinc-400">Lvl {lr.level} Req</span>
                  </div>
                )}
              </div>
            );
          })}

          {Array.from({ length: placeholders }).map((_, i) => (
            <div key={`ph-${i}`} className="hidden rounded-xl border border-dashed border-white/[0.04] sm:block" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Rewards() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { progress } = useProgress();
  const { unlocked, loaded } = useBadges();
  const solvedCount = progress.completed?.length ?? 0;
  const currentLevel = progress.level ?? 1;
  const currentTitle = [...levelRewards].reverse().find(l => l.level <= currentLevel)?.title || "Debug Recruit";

  // Filter States
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "LOCKED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Real unlock state comes from the backend (/api/badges)
  const isBadgeUnlocked = (badge: Badge) => unlocked.has(badge.id);

  // Badge Image Helper
  const getBadgeImage = (badge: Badge) => {
    const directMatch = badgeImageMap[badge.name];
    if (directMatch) return THUMB + directMatch;

    const normalized = badge.name.toLowerCase();
    if (normalized.includes("shadow") || normalized.includes("debugger")) return THUMB + "badge_4k_shadow_debugger.webp";
    if (normalized.includes("ghost") || normalized.includes("machine")) return THUMB + "badge_4k_ghost_machine.webp";
    if (normalized.includes("legend") || normalized.includes("global")) return THUMB + "badge_4k_global_legend.webp";
    if (normalized.includes("boss") || normalized.includes("slayer")) return THUMB + "badge_boss_slayer.webp";
    if (normalized.includes("speed")) return THUMB + "badge_speed_demon.webp";
    if (normalized.includes("night") || normalized.includes("owl")) return THUMB + "badge_night_owl.webp";
    if (normalized.includes("month")) return THUMB + "badge_month_legend.webp";
    if (normalized.includes("week")) return THUMB + "badge_week_warrior.webp";
    if (normalized.includes("century")) return THUMB + "badge_century_club.webp";
    if (normalized.includes("perfect")) return THUMB + "badge_4k_perfect_run.webp";
    if (normalized.includes("hints")) return THUMB + "badge_4k_no_hints.webp";
    if (normalized.includes("marathon")) return THUMB + "badge_4k_marathon_fixer.webp";
    if (normalized.includes("mentor")) return THUMB + "badge_4k_mentor.webp";
    if (normalized.includes("guild")) return THUMB + "badge_4k_guild_leader.webp";
    if (normalized.includes("community")) return THUMB + "badge_4k_community_star.webp";
    if (normalized.includes("anniversary")) return THUMB + "badge_4k_anniversary.webp";
    if (normalized.includes("beta")) return THUMB + "badge_4k_beta_tester.webp";
    // Safety net — every current legendary badge is mapped above, so this
    // only catches any future legendary badge that has no dedicated entry.
    if (badge.rarity === "Legendary") return THUMB + "legendary_masterpiece_badge.webp";
    return THUMB + "badge_4k_bug_reporter.webp";
  };

  // Grouped & Filtered Badges
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      const matchCat = activeCategory === "ALL" || badge.category === activeCategory;
      const matchRarity = selectedRarity === "ALL" || badge.rarity === selectedRarity;
      const unlocked = isBadgeUnlocked(badge);
      const matchStatus =
        statusFilter === "ALL" ? true :
        statusFilter === "UNLOCKED" ? unlocked : !unlocked;
      const matchSearch =
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchRarity && matchStatus && matchSearch;
    });
  }, [activeCategory, selectedRarity, statusFilter, searchQuery, unlocked]);

  const groupedBadges = useMemo(() => {
    const groups: Record<string, Badge[]> = {};
    filteredBadges.forEach(badge => {
      if (!groups[badge.category]) groups[badge.category] = [];
      groups[badge.category].push(badge);
    });
    return groups;
  }, [filteredBadges]);

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(badges.map(b => b.category)))], []);

  // Anime.js animations
  useEffect(() => {
    if (!pageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scope = createScope({ root: pageRef.current }).add(() => {
      animate(".reward-card", {
        opacity: [0, 1],
        translateY: [15, 0],
        scale: [0.97, 1],
        duration: 500,
        delay: stagger(20),
        ease: "outExpo",
      });

      animate(".level-node", {
        scale: [0.85, 1],
        opacity: [0, 1],
        duration: 450,
        delay: stagger(60, { start: 200 }),
        ease: "outBack",
      });

      // Removed JS loop for locked badges, using pure CSS animate-pulse instead
    });

    return () => scope.revert();
  }, [activeCategory, selectedRarity, statusFilter]);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#07070b] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      <style>{`
        /* ── Badge circle base ── */
        .reward-badge-shell {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transform: translateZ(0);
        }

        /* ── Hover sweep (all rarities) ── */
        .reward-badge-shell::before {
          content: "";
          position: absolute;
          inset: -30%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 70%);
          transform: translateX(-120%) rotate(12deg);
          transition: transform 700ms ease;
          z-index: 4;
        }
        .reward-badge-shell:hover::before {
          transform: translateX(120%) rotate(12deg);
        }

        /* ── Auto gloss sweep (all badges, loops every 5 s) ── */
        @keyframes glossLoop {
          0%, 100% { transform: translateX(-170%) skewX(-12deg); opacity: 0; }
          8%        { opacity: 1; }
          42%       { opacity: 0; }
          43%, 99%  { transform: translateX(170%) skewX(-12deg); opacity: 0; }
        }
        .reward-badge-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(
            105deg,
            transparent 25%,
            rgba(255,255,255,0.30) 48%,
            rgba(255,255,255,0.12) 52%,
            transparent 75%
          );
          animation: glossLoop 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 3;
        }

        /* ── Rarity base glows ── */
        .reward-badge-shell.epic   { box-shadow: 0 0 0 1px rgba(168,85,247,0.20), 0 0 16px rgba(168,85,247,0.16); }
        .reward-badge-shell.rare   { box-shadow: 0 0 0 1px rgba(56,189,248,0.16), 0 0 12px rgba(56,189,248,0.12); }
        .reward-badge-shell.common { box-shadow: 0 0 0 1px rgba(161,161,170,0.14); }

        /* ── Legendary: floating + pulsing amber glow ── */
        @keyframes rewardBadgeFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-4px) scale(1.025); }
        }
        @keyframes legendaryGlow {
          0%, 100% {
            box-shadow: 0 0 0 1.5px rgba(251,191,36,0.50),
                        0 0 22px  rgba(251,191,36,0.32),
                        0 0 50px  rgba(251,191,36,0.12);
          }
          50% {
            box-shadow: 0 0 0 2px   rgba(251,191,36,0.80),
                        0 0 38px  rgba(251,191,36,0.55),
                        0 0 75px  rgba(251,191,36,0.22);
          }
        }
        .reward-badge-shell.legendary {
          animation: rewardBadgeFloat 3.2s ease-in-out infinite,
                     legendaryGlow    2.6s ease-in-out infinite;
        }

        /* ── Legendary rotating conic-gradient halo ── */
        @keyframes ringRotate { to { transform: rotate(360deg); } }
        .legendary-ring {
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          background: conic-gradient(
            from 0deg,
            transparent      0deg,
            rgba(251,191,36,0.90) 50deg,
            rgba(255,130,40,0.70) 80deg,
            rgba(251,191,36,0.40) 115deg,
            transparent     155deg,
            transparent     200deg,
            rgba(251,191,36,0.45) 240deg,
            rgba(255,200,60,0.75) 268deg,
            transparent     310deg
          );
          animation: ringRotate 4.5s linear infinite;
          z-index: 0;
          pointer-events: none;
        }

        /* ── Legendary card: iridescent animated border + bg ── */
        @keyframes legendaryBorder {
          0%, 100% { border-color: rgba(251,191,36,0.38); }
          33%      { border-color: rgba(245,108,30,0.32); }
          66%      { border-color: rgba(190,110,255,0.32); }
        }
        @keyframes legendaryBg {
          0%, 100% { background-position: 0% 50%;   }
          50%      { background-position: 100% 50%; }
        }
        .legendary-card {
          background: linear-gradient(
            135deg,
            rgba(251,191,36,0.07) 0%,
            rgba(130,60,200,0.07) 30%,
            rgba(245,108,30,0.06) 60%,
            rgba(251,191,36,0.07) 100%
          ) !important;
          background-size: 300% 300% !important;
          animation: legendaryBorder 4s ease-in-out infinite,
                     legendaryBg     7s ease-in-out infinite;
        }

        /* ── Legendary card sparkle particles ── */
        @keyframes sparklePop {
          0%   { transform: translateY(0)   scale(0); opacity: 0; }
          20%  { transform: translateY(-5px) scale(1.1); opacity: 1; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-20px) scale(0); opacity: 0; }
        }
        .legendary-card::before,
        .legendary-card::after {
          content: "✦";
          position: absolute;
          pointer-events: none;
          color: rgba(251,191,36,0.85);
          animation: sparklePop 3s ease-in-out infinite;
          z-index: 5;
        }
        .legendary-card::before {
          top: 10%;
          right: 10%;
          font-size: 9px;
          animation-delay: 0s;
        }
        .legendary-card::after {
          bottom: 18%;
          right: 6%;
          font-size: 7px;
          animation-delay: 1.6s;
        }

        /* ── Badge image ── */
        .reward-badge-image {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 9999px;
          transition: transform 260ms ease, filter 260ms ease;
          transform: scale(1.02);
        }
        .reward-badge-shell:hover .reward-badge-image {
          transform: scale(1.08);
          filter: saturate(1.08) brightness(1.05);
        }
        .reward-badge-shell.legendary .reward-badge-image {
          filter: saturate(1.15) brightness(1.10);
        }
      `}</style>
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[15%] h-[500px] w-[600px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] h-[400px] w-[500px] rounded-full bg-amber-500/8 blur-[130px]" />
        <div className="absolute -bottom-[20%] left-[30%] h-[500px] w-[600px] rounded-full bg-cyan-600/10 blur-[150px]" />
      </div>

      <Navbar variant="app" />

      <main className="relative mx-auto max-w-[1360px] px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        
        {/* ================= HERO COMPACT PRESTIGE BANNER ================= */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#100c1e] via-[#0d0b17] to-[#120d1c] p-6 shadow-2xl sm:p-7">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-2xl" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Player Info Left */}
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-amber-950/40 to-black p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#09070f]">
                  <GameIcon name="trophy" className="h-8 w-8 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <div className="absolute -bottom-2 rounded-full border border-amber-400/60 bg-amber-500 px-2 py-0.5 text-[10px] font-black tracking-wider text-black shadow-md">
                  RANK #{currentLevel * 3 + 12}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">Prestige Trophy Room</span>
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Active Season
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {currentTitle}
                </h1>
                <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
                  Complete challenges to unlock prestige badges, titles, and legendary developer perks.
                </p>
              </div>
            </div>

            {/* Stats Compact Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:gap-3">
              <div className="flex flex-col justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 transition-all hover:border-white/[0.12]">
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Current Level</span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-violet-300 sm:text-3xl">{currentLevel}</span>
                  <span className="text-[11px] text-zinc-500">/ 30 MAX</span>
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 transition-all hover:border-white/[0.12]">
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Badges Unlocked</span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-amber-300 sm:text-3xl">{loaded ? unlocked.size : "…"}</span>
                  <span className="text-[11px] text-zinc-500">/ {badges.length}</span>
                </div>
              </div>

              <div className="col-span-2 flex flex-col justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 sm:col-span-1 transition-all hover:border-white/[0.12]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Prestige Score</span>
                  <span className="text-[10px] font-semibold text-emerald-400">+{solvedCount * 150} XP</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/50 p-0.5 border border-white/5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-amber-400 shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (unlocked.size / badges.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= LEVEL & TITLE ROADMAP ================= */}
        <section className="mb-10">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Level & Title Progression</h2>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Climb the ranks to unlock exclusive badges, avatar frames, and theme customization.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 sm:self-auto">
              <span>Next Reward:</span>
              <span className="text-white underline decoration-violet-400/50 underline-offset-2">
                {levelRewards.find(r => r.level > currentLevel)?.title || "Max Prestige Achieved"}
              </span>
            </div>
          </div>

          <LevelRoadmap levelRewards={levelRewards} currentLevel={currentLevel} />
        </section>

        {/* ================= BADGE COLLECTION BAR & FILTERS ================= */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Badge Collection</h2>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Displaying <span className="font-semibold text-white">{filteredBadges.length}</span> of {badges.length} total badges across all tiers
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 transition-colors focus:border-violet-500/50 focus:bg-white/[0.05] focus:outline-none"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Rarity Filter */}
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-0.5">
                {["ALL", "Common", "Rare", "Epic", "Legendary"].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      selectedRarity === rarity
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {rarity === "ALL" ? "All Rarity" : rarity}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-0.5">
                {(["ALL", "UNLOCKED", "LOCKED"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      statusFilter === status
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {status === "ALL" ? "All" : status === "UNLOCKED" ? "Unlocked" : "Locked"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs - Compacted to one line */}
          <div className="mb-8 flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const catCount = cat === "ALL" ? badges.length : badges.filter(b => b.category === cat).length;
              const unlockedInCat = cat === "ALL" 
                ? badges.filter(b => isBadgeUnlocked(b)).length 
                : badges.filter(b => b.category === cat && isBadgeUnlocked(b)).length;
              const isSelected = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200 ${
                    isSelected
                      ? "border-violet-500/50 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent text-white shadow-[0_0_10px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/40"
                      : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-zinc-200"
                  }`}
                >
                  {cat !== "ALL" && (
                    <GameIcon name={categoryIcons[cat] || "trophy"} className={`h-3 w-3 ${isSelected ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                  )}
                  <span>{cat === "ALL" ? "All" : cat}</span>
                  <span className={`ml-0.5 rounded px-1 py-0 font-mono text-[9px] ${
                    isSelected ? "bg-violet-500/30 text-violet-200" : "bg-white/5 text-zinc-500"
                  }`}>
                    {unlockedInCat}/{catCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Empty state when no badges match filters */}
          {Object.keys(groupedBadges).length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl"></div>
              <h3 className="mt-3 text-sm font-bold text-white">No badges found</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                Try adjusting your filters or search terms to find what you are looking for.
              </p>
              <button
                onClick={() => { setActiveCategory("ALL"); setSelectedRarity("ALL"); setStatusFilter("ALL"); setSearchQuery(""); }}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* ================= BADGES GRID BY CATEGORY ================= */}
          {Object.entries(groupedBadges).map(([category, categoryBadges]) => {
            const totalInCat = badges.filter(b => b.category === category).length;
            const unlockedInCat = badges.filter(b => b.category === category && isBadgeUnlocked(b)).length;
            const progressPct = Math.round((unlockedInCat / totalInCat) * 100);

            return (
              <div key={category} className="mb-10">
                {/* Premium Category Partition Header */}
                <div className="mb-4 flex flex-col justify-between gap-2 border-b border-white/[0.06] pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-sm">
                      <GameIcon name={categoryIcons[category] || "trophy"} className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-wider text-white uppercase">{category}</h3>
                      <span className="text-[11px] text-zinc-500">
                        {unlockedInCat} of {totalInCat} unlocked • {progressPct}% completion
                      </span>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/5 border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-300">{progressPct}%</span>
                  </div>
                </div>

                {/* Compact Highly-Detailed Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryBadges.map((badge) => {
                    const isUnlocked = isBadgeUnlocked(badge);
                    const isSecret = badge.unlock === "Secret";
                    const style = rarityStyles[badge.rarity];

                    return (
                      <div
                        key={badge.id}
                        className={`reward-card transform-gpu group relative flex items-center gap-3.5 overflow-hidden rounded-xl border p-3.5 transition-all duration-300 ${
                          isUnlocked
                            ? `border-white/[0.08] bg-gradient-to-r ${style.bg} hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg`
                            : "border-white/[0.04] bg-white/[0.015] opacity-80 hover:opacity-100 hover:border-white/[0.08]"
                        } ${isUnlocked && badge.rarity === "Legendary" ? "legendary-card" : ""}`}
                      >
                        {/* Subtle background glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                        {/* CIRCULAR BOX BADGE / MEDALLION EMBLEM */}
                        <div className="relative shrink-0">
                          {isUnlocked && badge.rarity === "Legendary" && (
                            <div className="legendary-ring" />
                          )}
                          <div
                            className={`reward-badge-shell flex h-14 w-14 items-center justify-center rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 ${
                              isUnlocked
                                ? `bg-gradient-to-br ${style.ring} ${style.glow}`
                                : "bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border border-white/5 opacity-50 grayscale"
                            } ${badge.rarity === "Legendary" ? "legendary" : badge.rarity === "Epic" ? "epic" : badge.rarity === "Rare" ? "rare" : "common"}`}
                          >
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#08070e] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                              <img
                                src={getBadgeImage(badge)}
                                alt={badge.name}
                                className="reward-badge-image"
                                loading="eager"
                                decoding="async"
                              />
                              {!isUnlocked && (
                                <div className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-[1px]" />
                              )}
                            </div>
                          </div>

                          {/* Medallion Corner Badges */}
                          {!isUnlocked && (
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 shadow-md opacity-80">
                              <GameIcon name="lock" className="h-2.5 w-2.5" />
                            </div>
                          )}
                          {isUnlocked && (
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-950 text-emerald-400 shadow-sm">
                              <span className="text-[10px] font-black">✓</span>
                            </div>
                          )}
                        </div>

                        {/* Badge Info (Compact & Clean Partitioning) */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className={`truncate text-sm font-bold tracking-tight transition-colors ${
                              isUnlocked ? "text-white group-hover:text-amber-200" : "text-zinc-300"
                            }`}>
                              {badge.name}
                            </h4>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase border ${style.pill}`}>
                              {badge.rarity}
                            </span>
                          </div>

                          <p className={`mt-1 text-xs leading-snug line-clamp-1 group-hover:line-clamp-none transition-all ${
                            isUnlocked ? "text-zinc-300" : "text-zinc-500"
                          }`}>
                            {isSecret && !isUnlocked ? "??? — Hidden achievement criteria" : badge.desc}
                          </p>

                          <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-1.5 text-[10px]">
                            {isUnlocked ? (
                              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Unlocked
                              </span>
                            ) : isSecret ? (
                              <span className="font-semibold text-amber-400/80">Secret Badge</span>
                            ) : (
                              <span className="font-mono text-zinc-500">Requires: <span className="text-zinc-300 font-semibold">{badge.unlock}</span></span>
                            )}

                            <span className="text-zinc-600 font-mono text-[9px]">#{badge.id}</span>
                          </div>
                        </div>

                        {/* Tooltip hint on hover for locked non-secret badges */}
                        {!isUnlocked && !isSecret && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090812]/95 p-4 text-center opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">How to Unlock</span>
                            <span className="mt-1 text-xs font-semibold text-white">{badge.desc}</span>
                            <span className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono text-zinc-300">
                              Condition: {badge.unlock}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </section>
      </main>
    </div>
  );
}
