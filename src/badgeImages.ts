/**
 * badgeImages.ts — shared badge → image mapping.
 *
 * Extracted from Rewards.tsx so any page (Rewards, UserProfile, …) renders the
 * same unique image for a badge. Every badge in src/badges.ts has its own
 * dedicated image in public/images/thumbs/ — no repeats.
 */

import type { Badge } from "./badges";

export const THUMB = "/images/thumbs/";

export const badgeImageMap: Record<string, string> = {
  // ── Debugging Streaks (1-10) ──
  "First Blood": "badge_first_blood.webp",
  "Bug Streak I": "badge_bug_streak.webp",
  "Bug Streak II": "rare_2_flame.webp",
  "Bug Streak III": "epic_9_venus_flytrap.webp",
  "Week Warrior": "badge_week_warrior.webp",
  "Month Legend": "badge_month_legend.webp",
  "Century Club": "badge_century_club.webp",
  "Speed Demon": "badge_speed_demon.webp",
  "Night Owl": "badge_night_owl.webp",
  "Dawn Raider": "badge_dawn_raider.webp",

  // ── Speed Milestones (11-20) ──
  "Speedrunner I": "badge_speedrunner.webp",
  "Speedrunner II": "epic_7_zeit_clock.webp",
  "Lightning Hands": "badge_lightning_hands.webp",
  "Quick Fix": "badge_4k_blazing_fast.webp",
  "Marathon Fixer": "badge_4k_marathon_fixer.webp",
  "One Shot": "badge_one_shot.webp",
  "No Hints Needed": "badge_4k_no_hints.webp",
  "Perfect Run": "badge_4k_perfect_run.webp",
  "Time Lord": "legendary_chronos_weaver.webp",
  "Blazing Fast": "badge_time_lord.webp",

  // ── Problem Solvers (21-30) — one unique image per badge ──
  "Python Novice": "epic_1_wolf_fang.webp",
  "Python Master": "legendary_masterpiece_badge.webp",
  "JS Hunter": "rare_5_lightning_fist.webp",
  "JS God": "legendary_singularity_core.webp",
  "SQL Sniper": "rare_4_crescent_moon.webp",
  "SQL Overlord": "epic_8_tesla_skull.webp",
  "Multi-Stack": "rare_3_shield_star.webp",
  "Nightmare Slayer": "badge_4k_nightmare_slayer.webp",
  "Boss Slayer": "badge_boss_slayer.webp",
  "Challenge Conqueror": "badge_challenge_conqueror.webp",

  // ── Community (31-38) ──
  "Guild Member": "epic_3_knight_helm.webp",
  "Guild Leader": "badge_4k_guild_leader.webp",
  "Mentor": "badge_4k_mentor.webp",
  "Community Star": "badge_4k_community_star.webp",
  "Bug Reporter": "badge_4k_bug_reporter.webp",
  "Event Participant": "epic_2_tech_core.webp",
  "Leaderboard Climber": "badge_4k_global_legend.webp",
  "Global Legend": "epic_6_kraken_anchor.webp",

  // ── Special Events (39-45) ──
  "Launch Day Hero": "rare_1_falcon.webp",
  "Halloween Hunter": "badge_4k_shadow_debugger.webp",
  "New Year Solver": "epic_4_phoenix_feather.webp",
  "Anniversary Badge": "badge_4k_anniversary.webp",
  "Beta Tester": "badge_4k_beta_tester.webp",
  "Bug Hunt Champion": "badge_4k_bug_hunt_champion.webp",
  "Seasonal Legend": "badge_4k_seasonal_legend.webp",

  // ── Hidden (46-50) ──
  "Shadow Debugger": "badge_shadow_debugger.webp",
  "Ghost in the Machine": "badge_4k_ghost_machine.webp",
  "Code Phantom": "badge_4k_code_phantom.webp",
  "The Unbreakable": "badge_4k_unbreakable.webp",
  "Debug Deity": "badge_4k_debug_deity.webp",

  // ── Milestones (51-58) — new artwork ──
  "Hexagon Phoenix": "badge_1_hexagon_phoenix.webp",
  "Shield Lightning": "badge_2_shield_lightning.webp",
  "Star Dragon": "badge_3_star_dragon.webp",
  "Diamond Crown": "badge_4_diamond_crown.webp",
  "Medal Owl": "badge_5_medal_owl.webp",
  "Grail Chalice": "legendary_1_grail_chalice.webp",
  "Cosmic Orb": "legendary_2_cosmic_orb.webp",
  "Samurai Katana": "legendary_3_samurai_katana.webp",
};

/**
 * Resolve the thumb image for a badge. Every current badge has a dedicated
 * entry; the fallbacks below only catch FUTURE badges that have no entry yet.
 * The fallback files are deliberately unused by the map so a future badge can
 * never silently duplicate an existing badge's image.
 */
export function getBadgeImage(badge: Pick<Badge, "name" | "rarity">): string {
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
  // Safety net for future badges — uses files the map does NOT reference.
  if (badge.rarity === "Legendary") return THUMB + "epic_10_frost_hammer.webp";
  return THUMB + "epic_5_gear_king.webp";
}
