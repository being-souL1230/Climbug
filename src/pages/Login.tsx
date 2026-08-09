import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GameIcon, { type IconName } from "../components/GameIcon";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import Reveal from "../components/Reveal";
import { useAnimeDetails } from "../hooks/useAnimeDetails";
import { signInWithGitHub, signInWithGoogle, useAuth } from "../auth";
import { API_BASE } from "../api";

const features = [
  {
    icon: "bug" as IconName,
    iconBg: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40",
    title: "Real Broken Code",
    desc: "Python, Flask, JS, SQL, Node.js - actual bugs to squash",
  },
  {
    icon: "lightning" as IconName,
    iconBg: "from-amber-500/20 to-orange-600/20 border-amber-500/40",
    title: "XP & Leaderboard",
    desc: "Earn points, level up, and dominate the global rankings",
  },
  {
    icon: "target" as IconName,
    iconBg: "from-fuchsia-500/20 to-pink-600/20 border-fuchsia-500/40",
    title: "4 Difficulty Tiers",
    desc: "From Beginner warmups to Nightmare-level challenges",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageRef = useRef<HTMLDivElement | null>(null);
  useAnimeDetails(pageRef);
  const { isSignedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<"google" | "github">("google");
  const [authMode, setAuthMode] = useState<"oauth" | "quick">("oauth");

  // GitHub state
  const [username, setUsername] = useState("");
  
  // Google state
  const [googleEmail, setGoogleEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error in query string
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) {
      setError(errParam);
    }
  }, [searchParams]);

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isSignedIn) navigate("/dashboard", { replace: true });
  }, [isSignedIn, navigate]);

  const triggerGoogleOAuth = () => {
    window.location.href = `${API_BASE}/api/auth/google/login`;
  };

  const triggerGitHubOAuth = () => {
    window.location.href = `${API_BASE}/api/auth/github/login`;
  };

  const onGitHubSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your GitHub username");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithGitHub(username);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes("@")) {
      setError("Please enter a valid Google email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(googleEmail);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#08080d]">
      <Navbar variant="guest" />

      <main className="grid min-h-[calc(100vh-62px)] lg:grid-cols-2">
        {/* Left brand panel */}
        <section className="grid-texture relative hidden border-r border-white/5 bg-gradient-to-br from-[#120d22] via-[#0d0a18] to-[#0a0812] px-14 py-16 lg:block xl:px-20">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{ background: "radial-gradient(600px 400px at 20% 15%, rgba(109,40,217,0.14), transparent 70%)" }}
          />
          <Reveal className="relative">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
              <span className="text-xl font-extrabold text-white">Climbug</span>
            </div>

            <h1 className="mt-14 text-5xl font-black leading-[1.15] tracking-tight xl:text-6xl">
              <span className="text-white">Debug.</span>
              <br />
              <span className="text-indigo-400">Compete.</span>
              <br />
              <span className="text-white">Level Up.</span>
            </h1>

            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-zinc-400">
              Real broken code. Real error logs. Real pressure.
              <br />
              Sharpen your skills one bug at a time.
            </p>
          </Reveal>

          <ul className="relative mt-14 space-y-7">
            {features.map((f, i) => (
              <Reveal key={f.title} as="li" delay={150 + i * 120}>
                <div className="flex items-start gap-4">
                  <GameIcon name={f.icon} className="anime-pop mt-0.5 h-7 w-7 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold text-white">{f.title}</span>
                    <span className="mt-1 block text-sm text-zinc-500">{f.desc}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* Right sign-in panel */}
        <section className="flex items-center justify-center bg-[#0a0a11] px-6 py-16">
          <Reveal delay={150} className="w-full max-w-[420px]">
            <div className="anime-pop relative border border-white/10 bg-[#0d0d16] p-9 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-10">
              {/* corner accents */}
              <span className="absolute -left-px -top-px h-14 w-14 border-l-2 border-t-2 border-violet-500" aria-hidden />
              <span className="absolute -bottom-px -right-px h-14 w-14 border-b-2 border-r-2 border-violet-500/40" aria-hidden />

              <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-violet-400">OAUTH 2.0 AUTHENTICATION</p>
              <h2 className="mt-3 text-[26px] font-extrabold tracking-tight text-white">Sign In to Climbug</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Choose your provider to authenticate via official OAuth 2.0.
              </p>

              {/* Error Alert */}
              {error && (
                <div className="mt-4 rounded border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs font-semibold text-rose-300">
                  ⚠️ {error}
                </div>
              )}

              {/* Provider Selector Tabs */}
              <div className="mt-6 flex rounded-lg border border-white/10 bg-[#0a0a12] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("google");
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold transition-all ${
                    activeTab === "google"
                      ? "bg-white/10 text-white shadow-sm border border-white/15"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("github");
                    setError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold transition-all ${
                    activeTab === "github"
                      ? "bg-white/10 text-white shadow-sm border border-white/15"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" />
                  </svg>
                  GitHub
                </button>
              </div>

              <hr className="my-6 border-white/8" />

              {/* GOOGLE SECTION */}
              {activeTab === "google" && (
                <div className="space-y-4">
                  {authMode === "oauth" ? (
                    <div>
                      <button
                        type="button"
                        onClick={triggerGoogleOAuth}
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded border border-blue-500/40 bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:border-blue-300 hover:from-blue-500 hover:to-indigo-500"
                      >
                        <svg className="h-5 w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        Sign In with Google (OAuth 2.0)
                      </button>

                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMode("quick")}
                          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Or sign in with Google email handle directly
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={onGoogleSignIn} className="space-y-4">
                      <div>
                        <label htmlFor="google-email" className="mb-1.5 block text-[11px] font-bold tracking-[0.2em] text-zinc-400">
                          GOOGLE EMAIL
                        </label>
                        <div className="flex items-center gap-2.5 border border-white/12 bg-[#0a0a12] px-3.5 transition-colors focus-within:border-blue-500">
                          <input
                            id="google-email"
                            type="email"
                            value={googleEmail}
                            onChange={(e) => setGoogleEmail(e.target.value)}
                            placeholder="you@gmail.com"
                            autoComplete="email"
                            disabled={loading}
                            className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-600 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded border border-blue-500/40 bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
                      >
                        {loading ? "Authenticating..." : "Quick Google Login"}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMode("oauth")}
                          className="text-[11px] font-semibold text-zinc-400 hover:text-white"
                        >
                          &larr; Back to Official Google OAuth 2.0
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* GITHUB SECTION */}
              {activeTab === "github" && (
                <div className="space-y-4">
                  {authMode === "oauth" ? (
                    <div>
                      <button
                        type="button"
                        onClick={triggerGitHubOAuth}
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden border border-white/20 bg-gradient-to-b from-[#24292f] to-[#1a1e22] py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/40 hover:from-[#2d333b] hover:to-[#1f2226]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.9 18.6.5 12 .5z" />
                        </svg>
                        Sign In with GitHub (OAuth 2.0)
                      </button>

                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMode("quick")}
                          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Or sign in with @username handle directly
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={onGitHubSignIn} className="space-y-4">
                      <div>
                        <label htmlFor="gh-username" className="mb-1.5 block text-[11px] font-bold tracking-[0.2em] text-zinc-400">
                          GITHUB USERNAME
                        </label>
                        <div className="flex items-center gap-2.5 border border-white/12 bg-[#0a0a12] px-3.5 transition-colors focus-within:border-violet-500">
                          <span className="font-mono text-sm text-zinc-500">@</span>
                          <input
                            id="gh-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="octocat"
                            disabled={loading}
                            className="w-full bg-transparent py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full border border-white/20 bg-zinc-800 py-3 text-sm font-bold text-white hover:bg-zinc-700"
                      >
                        {loading ? "Fetching..." : "Quick Username Login"}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMode("oauth")}
                          className="text-[11px] font-semibold text-zinc-400 hover:text-white"
                        >
                          &larr; Back to Official GitHub OAuth 2.0
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-500">
                Official OAuth 2.0 code grant flow enabled.<br />
                Credentials securely configured in backend `.env`.
              </p>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] font-bold tracking-widest text-zinc-600">OR</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <Link
                to="/"
                className="block w-full border border-violet-400/40 bg-gradient-to-b from-violet-600/40 to-violet-800/40 py-2.5 text-center text-sm font-bold text-violet-100 transition-all hover:border-violet-400 hover:from-violet-500/60 hover:to-violet-700/60"
              >
                Browse as Guest -&gt;
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
