import { useEffect, type RefObject } from "react";
import { animate, createScope, spring, stagger } from "animejs";

export function useAnimeDetails(root: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled || !root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scope = createScope({ root }).add(() => {
      animate(".anime-pop", {
        opacity: [0, 1],
        translateY: [8, 0],
        scale: [0.98, 1],
        duration: 720,
        delay: stagger(42),
        ease: "outExpo",
      });

      // `anime-icon` continuous loop removed to prevent lag from many simultaneous icons
      animate(".anime-dot", {
        scale: [
          { to: 1.75, duration: 650, ease: "inOutSine" },
          { to: 1, duration: 650, ease: "inOutSine" },
        ],
        opacity: [
          { to: 0.25, duration: 650, ease: "inOutSine" },
          { to: 0.9, duration: 650, ease: "inOutSine" },
        ],
        delay: stagger(90),
        loop: true,
      });

      animate(".anime-pulse", {
        scale: [
          { to: 1.045, duration: 1100, ease: "inOutSine" },
          { to: 1, duration: 1100, ease: spring({ bounce: 0.35 }) },
        ],
        delay: stagger(160),
        loop: true,
      });

      animate(".anime-progress-fill", {
        scaleX: [0.02, 1],
        transformOrigin: "0% 50%",
        duration: 1200,
        delay: stagger(140),
        ease: "outExpo",
      });

      // `anime-number` continuous loop removed — streak/solved numbers now static for smoothness
    });

    return () => scope.revert();
  }, [enabled, root]);
}