import { cn } from "../utils/cn";

export default function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const id = size; // unique ids per instance to avoid SVG gradient conflicts
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn(
        size === "sm" ? "h-5 w-5" : size === "lg" ? "h-10 w-10" : "h-7 w-7",
        className
      )}
      aria-hidden
    >
      <defs>
        {/* shield body gradient */}
        <linearGradient id={`cb-shield-${id}`} x1="24" y1="4" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="45%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        {/* shield inner highlight */}
        <linearGradient id={`cb-inner-${id}`} x1="24" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.9" />
        </linearGradient>
        {/* peak gradient */}
        <linearGradient id={`cb-peak-${id}`} x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="40%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        {/* glow filter */}
        <filter id={`cb-glow-${id}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.58 0 0 0 0 0.33 0 0 0 0 0.95 0 0 0 0.75 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* shield body */}
      <path
        d="M24 3 L43 11 L43 24 C43 35 35 42 24 46 C13 42 5 35 5 24 L5 11 Z"
        fill={`url(#cb-shield-${id})`}
      />
      {/* shield inner bevel */}
      <path
        d="M24 6 L40 13 L40 24 C40 33.5 33 39.5 24 43 C15 39.5 8 33.5 8 24 L8 13 Z"
        fill={`url(#cb-inner-${id})`}
      />
      {/* shield rim shine */}
      <path
        d="M24 3 L43 11 L43 24 C43 35 35 42 24 46 C13 42 5 35 5 24 L5 11 Z"
        fill="none"
        stroke="url(#cb-shield-${id})"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* mountain peak group */}
      <g filter={`url(#cb-glow-${id})`}>
        {/* back peak */}
        <path
          d="M14 36 L22 17 L30 36 Z"
          fill={`url(#cb-peak-${id})`}
          opacity="0.55"
        />
        {/* front peak — main */}
        <path
          d="M18 36 L26 14 L34 36 Z"
          fill={`url(#cb-peak-${id})`}
        />
        {/* snow cap */}
        <path
          d="M26 14 L28.8 20.5 L26 19 L23.2 20.5 Z"
          fill="#f5f3ff"
          opacity="0.95"
        />
      </g>

      {/* bug antenna / flag on top */}
      <g filter={`url(#cb-glow-${id})`}>
        <line x1="26" y1="14" x2="26" y2="8.5" stroke="#f0abfc" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="26" cy="7.5" r="1.8" fill="#e879f9" />
        <circle cx="26" cy="7.5" r="1" fill="#fae8ff" opacity="0.85" />
      </g>

      {/* small code brackets inside shield — gamified touch */}
      <g opacity="0.7">
        <path
          d="M13 28 L10.5 30.5 L13 33"
          fill="none" stroke="#d8b4fe" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M37 28 L39.5 30.5 L37 33"
          fill="none" stroke="#d8b4fe" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
