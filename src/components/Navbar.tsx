import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import GameIcon from "./GameIcon";
import Logo from "./Logo";
import { cn } from "../utils/cn";
import { signOut, useAuth } from "../auth";

export default function Navbar({ variant = "app" }: { variant?: "app" | "guest" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut();
    setMenuOpen(false);
    navigate("/login");
  };

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-white",
      isActive ? "text-white" : "text-zinc-400"
    );

  const displayName = user?.name || user?.login || "Guest";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0b12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <Logo size="md" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_4px_16px_rgba(139,92,246,0.6)]" />
          <span className="text-lg font-extrabold tracking-tight text-white">Climbug</span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          {variant === "app" ? (
            <>
              <NavLink to="/tracks" className={link}>
                Tracks
              </NavLink>
              <NavLink to="/leaderboard" className={link}>
                Leaderboard
              </NavLink>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="group flex items-center gap-2.5"
                  >
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="h-8 w-8 rounded-full border-2 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:border-violet-400 group-hover:shadow-[0_0_18px_rgba(139,92,246,0.5)]"
                    />
                    <span className="hidden text-sm font-bold text-white sm:block">{displayName.split(" ")[0]}</span>
                    <svg viewBox="0 0 24 24" fill="none" className={cn(
                      "hidden h-3.5 w-3.5 text-zinc-500 transition-transform sm:block",
                      menuOpen && "rotate-180"
                    )}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full z-[200] mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d16] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                      {/* Header */}
                      <div className="border-b border-white/8 bg-gradient-to-b from-violet-950/40 to-transparent px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar_url}
                            alt={displayName}
                            className="h-10 w-10 rounded-full border border-white/20"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">{displayName}</p>
                            <p className="truncate text-xs text-zinc-500">@{user.login}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 divide-x divide-white/8 border-b border-white/8 bg-white/[0.02]">
                        <div className="px-2 py-2.5 text-center">
                          <div className="font-mono text-sm font-bold text-white">{user.public_repos}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Repos</div>
                        </div>
                        <div className="px-2 py-2.5 text-center">
                          <div className="font-mono text-sm font-bold text-white">{user.followers}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Followers</div>
                        </div>
                        <div className="px-2 py-2.5 text-center">
                          <div className="font-mono text-sm font-bold text-white">{user.following}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Following</div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <GameIcon name="monitor" className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/skills"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <GameIcon name="brain" className="h-4 w-4" />
                          Skills
                        </Link>
                        <Link
                          to="/rewards"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <GameIcon name="trophy" className="h-4 w-4" />
                          Rewards
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <GameIcon name="user" className="h-4 w-4" />
                          Edit Profile
                        </Link>
                        <a
                          href={user.html_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" />
                          </svg>
                          View on GitHub
                        </a>
                      </div>

                      <div className="border-t border-white/8 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-950/30 hover:text-rose-300"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-bold text-white transition-all hover:border-white/30 hover:bg-white/10"
                >
                  Sign in
                </Link>
              )}
            </>
          ) : (
            <>
              <NavLink to="/leaderboard" className={link}>
                Leaderboard
              </NavLink>
              <NavLink to="/login" className={link}>
                Login
              </NavLink>
              <Link
                to="/tracks"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(124,58,237,0.45)] transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_28px_rgba(124,58,237,0.7)]"
              >
                Start Debugging
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0b12] py-10">
      <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
        <Logo size="sm" />
        <span>Climbug - Debug Like a Pro</span>
      </div>
    </footer>
  );
}
