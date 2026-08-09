import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Box,
  BrainCircuit,
  Bug,
  ChevronRight,
  CirclePlay,
  CircleUserRound,
  Cloud,
  Crosshair,
  Diamond,
  Flame,
  Gem,
  Gift,
  Home,
  Lightbulb,
  LockKeyhole,
  Monitor,
  NotebookText,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";

export type IconName =
  | "python"
  | "flask"
  | "javascript"
  | "sql"
  | "node"
  | "target"
  | "trophy"
  | "bug"
  | "crystal"
  | "home"
  | "sword"
  | "brain"
  | "diamond"
  | "monitor"
  | "star"
  | "gear"
  | "flame"
  | "chart"
  | "shield"
  | "chest"
  | "lightning"
  | "timer"
  | "log"
  | "hint"
  | "people"
  | "code"
  | "user"
  | "lock"
  | "play"
  | "reset"
  | "arrowRight"
  | "arrowLeft"
  | "chevronRight"
  | "c"
  | "cpp"
  | "java"
  | "django"
  | "git"
  | "aspnet"
  | "rust"
  | "go"
  | "docker"
  | "kubernetes"
  | "linux"
  | "aws"
  | "reactnative"
  | "flutter"
  | "angular"
  | "vue"
  | "react"
  | "html"
  | "css"
  | "springboot";

const logoMap: Record<string, string> = {
  python: "https://cdn.simpleicons.org/python/3776ab",
  flask: "https://cdn.simpleicons.org/flask/e8e8e8",
  javascript: "https://cdn.simpleicons.org/javascript/f7df1e",
  sql: "https://cdn.simpleicons.org/postgresql/336791",
  node: "https://cdn.simpleicons.org/nodedotjs/339933",
  c: "https://cdn.simpleicons.org/c/a8b9cc",
  cpp: "https://cdn.simpleicons.org/cplusplus/00599c",
  java: "https://cdn.simpleicons.org/openjdk/ed8b00",
  django: "https://cdn.simpleicons.org/django/44b78b",
  git: "https://cdn.simpleicons.org/git/f05032",
  aspnet: "https://cdn.simpleicons.org/dotnet/512bd4",
  rust: "https://cdn.simpleicons.org/rust/ce422b",
  go: "https://cdn.simpleicons.org/go/00add8",
  docker: "https://cdn.simpleicons.org/docker/2496ed",
  kubernetes: "https://cdn.simpleicons.org/kubernetes/326ce5",
  linux: "https://cdn.simpleicons.org/linux/fcc624",
  reactnative: "https://cdn.simpleicons.org/react/61dafb",
  flutter: "https://cdn.simpleicons.org/flutter/02569b",
  angular: "https://cdn.simpleicons.org/angular/dd0031",
  vue: "https://cdn.simpleicons.org/vuedotjs/4fc08d",
  react: "https://cdn.simpleicons.org/react/61dafb",
  html: "https://cdn.simpleicons.org/html5/e34f26",
  css: "https://cdn.simpleicons.org/css/1572b6",
  springboot: "https://cdn.simpleicons.org/springboot/6db33f",
};

const icons: Record<string, LucideIcon> = {
  aws: Cloud,
  target: Crosshair,
  trophy: Trophy,
  bug: Bug,
  crystal: Gem,
  home: Home,
  sword: Swords,
  brain: BrainCircuit,
  diamond: Diamond,
  monitor: Monitor,
  star: Sparkles,
  gear: Settings,
  flame: Flame,
  chart: BarChart3,
  shield: ShieldCheck,
  chest: Gift,
  lightning: Zap,
  timer: Timer,
  log: NotebookText,
  hint: Lightbulb,
  people: UsersRound,
  code: BookOpenCheck,
  user: CircleUserRound,
  lock: LockKeyhole,
  play: CirclePlay,
  reset: RefreshCw,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
};

const accentClasses: Partial<Record<IconName, string>> = {
  python: "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  flask: "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.45)]",
  javascript: "text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.45)]",
  sql: "text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.45)]",
  node: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]",
  target: "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.45)]",
  trophy: "text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]",
  bug: "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.45)]",
  crystal: "text-violet-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]",
  flame: "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]",
  lightning: "text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.45)]",
  c: "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.45)]",
  cpp: "text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]",
  java: "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.45)]",
  django: "text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.45)]",
  git: "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]",
  aspnet: "text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]",
  rust: "text-orange-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.45)]",
  go: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]",
  docker: "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  kubernetes: "text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]",
  linux: "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.45)]",
  aws: "text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.45)]",
  reactnative: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]",
  flutter: "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  angular: "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.45)]",
  vue: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]",
  react: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]",
  html: "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.45)]",
  css: "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.45)]",
  springboot: "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.45)]",
};

interface GameIconProps {
  name: IconName;
  className?: string;
  alt?: string;
}

export default function GameIcon({ name, className }: GameIconProps) {
  if (name in logoMap) {
    return (
      <img
        src={logoMap[name]}
        alt={name}
        className={cn("h-5 w-5 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]", className)}
        onError={(e) => {
          // Hide the broken img and let the parent show nothing rather than a broken icon.
          // A full component swap would require state; this keeps the component pure.
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  const Icon = icons[name] ?? Box;

  return (
    <Icon
      aria-hidden
      strokeWidth={2.25}
      className={cn(
        "h-5 w-5 shrink-0 text-violet-300 drop-shadow-[0_0_9px_rgba(139,92,246,0.35)]",
        accentClasses[name],
        className
      )}
    />
  );
}
