const CACHE_NAME = "climbug-v2";
const IMAGE_CACHE = "climbug-badge-thumbs-v1";

// Thumbnails — 37 files, ~1.2 MB total (down from 44 MB)
const BADGE_IMAGES = [
  "/images/thumbs/badge_4k_anniversary.webp",
  "/images/thumbs/badge_4k_beta_tester.webp",
  "/images/thumbs/badge_4k_blazing_fast.webp",
  "/images/thumbs/badge_4k_bug_hunt_champion.webp",
  "/images/thumbs/badge_4k_bug_reporter.webp",
  "/images/thumbs/badge_4k_code_phantom.webp",
  "/images/thumbs/badge_4k_community_star.webp",
  "/images/thumbs/badge_4k_debug_deity.webp",
  "/images/thumbs/badge_4k_ghost_machine.webp",
  "/images/thumbs/badge_4k_global_legend.webp",
  "/images/thumbs/badge_4k_guild_leader.webp",
  "/images/thumbs/badge_4k_marathon_fixer.webp",
  "/images/thumbs/badge_4k_mentor.webp",
  "/images/thumbs/badge_4k_nightmare_slayer.webp",
  "/images/thumbs/badge_4k_no_hints.webp",
  "/images/thumbs/badge_4k_perfect_run.webp",
  "/images/thumbs/badge_4k_seasonal_legend.webp",
  "/images/thumbs/badge_4k_shadow_debugger.webp",
  "/images/thumbs/badge_4k_unbreakable.webp",
  "/images/thumbs/badge_boss_slayer.webp",
  "/images/thumbs/badge_bug_streak.webp",
  "/images/thumbs/badge_century_club.webp",
  "/images/thumbs/badge_challenge_conqueror.webp",
  "/images/thumbs/badge_dawn_raider.webp",
  "/images/thumbs/badge_first_blood.webp",
  "/images/thumbs/badge_lightning_hands.webp",
  "/images/thumbs/badge_month_legend.webp",
  "/images/thumbs/badge_night_owl.webp",
  "/images/thumbs/badge_one_shot.webp",
  "/images/thumbs/badge_shadow_debugger.webp",
  "/images/thumbs/badge_speed_demon.webp",
  "/images/thumbs/badge_speedrunner.webp",
  "/images/thumbs/badge_time_lord.webp",
  "/images/thumbs/badge_week_warrior.webp",
  "/images/thumbs/legendary_chronos_weaver.webp",
  "/images/thumbs/legendary_masterpiece_badge.webp",
  "/images/thumbs/legendary_singularity_core.webp",
];

// Install — cache all thumbnails immediately (~1.2 MB, fast)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(IMAGE_CACHE).then((cache) =>
      cache.addAll(BADGE_IMAGES).catch((err) =>
        console.warn("[SW] Some badge thumbs failed to pre-cache:", err)
      )
    )
  );
  self.skipWaiting();
});

// Activate — delete every old climbug cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith("climbug-") && n !== IMAGE_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for /images/
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!url.pathname.startsWith("/images/")) return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then((cache) =>
      cache.match(request).then((hit) => {
        if (hit) return hit;

        return fetch(request).then((res) => {
          if (res && res.status === 200 && res.type !== "error") {
            cache.put(request, res.clone());
          }
          return res;
        });
      })
    )
  );
});
