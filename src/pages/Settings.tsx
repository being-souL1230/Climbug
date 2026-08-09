import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameIcon, { type IconName } from "../components/GameIcon";
import { deleteAccount, signOut, useAuth } from "../auth";
import { cn } from "../utils/cn";

function Section({
  icon,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="anime-pop relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-[#14141f] to-[#0e0e15] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent opacity-60" />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-500/30 bg-violet-950/40 shadow-[0_0_18px_rgba(124,58,237,0.25)]">
          <GameIcon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-extrabold tracking-[0.08em] text-white">{title}</h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const typedMatches = typed.trim().replace(/^@/, "") === (user?.login ?? "");

  const displayName = user?.name || user?.login || "Debug Recruit";

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/login");
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Could not delete your account. Try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-zinc-100 selection:bg-violet-500/30">
      <Navbar variant="app" />
      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-violet-400 uppercase">Settings</p>
            <h1 className="mt-1 font-serif text-3xl font-black italic tracking-tight text-white">
              Your Climb, Your Rules
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <GameIcon name="arrowLeft" className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-5">
          {/* ── Account ── */}
          <Section icon="user" title="ACCOUNT" subtitle="Your sign-in identity and profile">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <img
                src={user?.avatar_url}
                alt={displayName}
                className="h-14 w-14 rounded-2xl border-2 border-violet-500/50 shadow-[0_0_18px_rgba(139,92,246,0.4)]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-white">{displayName}</p>
                <p className="truncate text-sm text-zinc-500">
                  @{user?.login}
                  {user?.provider === "google" && (
                    <span className="ml-2 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
                      Google
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <Link
                to="/profile"
                className="group flex items-center justify-center gap-2 rounded-xl border border-violet-500/50 bg-violet-950/40 py-3 text-sm font-bold text-violet-300 transition-all duration-200 hover:bg-violet-900/50 hover:text-white hover:shadow-[0_0_22px_rgba(124,58,237,0.3)]"
              >
                <GameIcon name="user" className="h-4 w-4 transition-transform group-hover:scale-110" />
                Edit Profile
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 py-3 text-sm font-bold text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </Section>

          {/* ── Privacy Policy ── */}
          <Section icon="shield" title="PRIVACY POLICY" subtitle="What we collect, why, and your rights" delay={80}>
            <div className="space-y-4 text-[13px] leading-relaxed text-zinc-400">
              <p>
                <span className="font-bold text-zinc-200">Climbug</span> is a gamified debugging platform. This policy
                explains what happens with your data — in plain language.
              </p>
              <div className="space-y-3">
                {[
                  {
                    h: "What we collect",
                    b: "Only the public profile data you sign in with (GitHub or Google): username, display name, avatar and email. We never see your GitHub/Google password.",
                  },
                  {
                    h: "How it's used",
                    b: "To identify your account, show your progress (XP, level, streak, badges, solves) on leaderboards and public profiles, and power features like Boss Raids. Your email is private and never shown to other users.",
                  },
                  {
                    h: "Storage",
                    b: "Your data lives in the app's own database (SQLite). No third parties, no advertising trackers, no data brokers.",
                  },
                  {
                    h: "Your rights",
                    b: "You can edit your public profile any time from the Edit Profile page, sign out, or permanently delete your account below — deleting wipes every trace of your account and progress from our database.",
                  },
                  {
                    h: "Session",
                    b: "A small session cookie keeps you signed in. It is removed when you sign out.",
                  },
                ].map((s) => (
                  <div key={s.h}>
                    <p className="text-xs font-bold tracking-wider text-violet-300 uppercase">{s.h}</p>
                    <p className="mt-1 text-zinc-400">{s.b}</p>
                  </div>
                ))}
              </div>
              <p className="border-t border-white/6 pt-3 text-[11px] text-zinc-600">
                Last updated August 2026. Questions? Reach out through your profile's social links.
              </p>
            </div>
          </Section>

          {/* ── Danger Zone ── */}
          <Section icon="lock" title="DANGER ZONE" subtitle="Irreversible actions" delay={160}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-950/15 p-4">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-rose-300">Delete Account</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Permanently removes your account, progress, badges, raids and leaderboard rank. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteError(null);
                  setTyped("");
                  (document.getElementById("delete-dialog") as HTMLDialogElement | null)?.showModal();
                }}
                className="shrink-0 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(244,63,94,0.35)] transition-all hover:brightness-110"
              >
                Delete Account
              </button>
            </div>
          </Section>
        </div>
      </main>

      {/* ── Delete confirmation dialog (2 steps) ── */}
      <dialog
        id="delete-dialog"
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-rose-500/40 bg-[#120a0f] p-0 text-zinc-100 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop:bg-[#050309]/80 backdrop:backdrop-blur-md"
      >
        <div className="anime-pop p-7">
          {deleteStep === 0 ? (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/40 bg-rose-950/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-rose-400">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-4 text-center font-serif text-xl font-black italic text-rose-300">
                Delete your account?
              </h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
                This permanently deletes your account and <span className="font-bold text-rose-300">all progress, XP, badges and raid history</span> from our database. There is no recovery.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => (document.getElementById("delete-dialog") as HTMLDialogElement | null)?.close()}
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10"
                >
                  Keep My Account
                </button>
                <button
                  onClick={() => setDeleteStep(1)}
                  className="rounded-xl bg-gradient-to-r from-rose-700 to-red-800 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  Yes, Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-rose-500/50 bg-rose-950/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-rose-400">
                  <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-4 text-center font-serif text-xl font-black italic text-rose-300">Are you absolutely sure?</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
                Type <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-rose-300">@{user?.login}</span> to confirm permanent deletion.
              </p>
              <input
                autoFocus
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={`@${user?.login ?? "username"}`}
                className="mt-4 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && typedMatches) handleDelete();
                }}
              />
              {deleteError && <p className="mt-3 text-center text-xs font-bold text-rose-400">{deleteError}</p>}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setDeleteStep(0);
                    setTyped("");
                  }}
                  disabled={deleting}
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!typedMatches || deleting}
                  className={cn(
                    "rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                    typedMatches && !deleting
                      ? "bg-gradient-to-r from-rose-700 to-red-800 shadow-[0_8px_24px_rgba(244,63,94,0.4)] hover:brightness-110"
                      : "cursor-not-allowed bg-rose-900/30 text-rose-200/40"
                  )}
                >
                  {deleting ? "Deleting…" : typedMatches ? "Delete Forever" : "Type to confirm"}
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
