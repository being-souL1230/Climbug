import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth";
import { apiFetch } from "../api";
import { cn } from "../utils/cn";

interface ProfileData {
  email?: string;
  phone?: string;
  qualification?: string;
  about?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  gitlab_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  stackoverflow_url?: string;
  devto_url?: string;
}

const SOCIAL_FIELDS: { key: keyof ProfileData; label: string; placeholder: string; color: string }[] = [
  { key: "github_url",       label: "GitHub",        placeholder: "https://github.com/username",            color: "#e8e8e8" },
  { key: "linkedin_url",     label: "LinkedIn",      placeholder: "https://linkedin.com/in/username",       color: "#0a66c2" },
  { key: "leetcode_url",     label: "LeetCode",      placeholder: "https://leetcode.com/username",          color: "#ffa116" },
  { key: "gitlab_url",       label: "GitLab",        placeholder: "https://gitlab.com/username",            color: "#fc6d26" },
  { key: "twitter_url",      label: "Twitter / X",   placeholder: "https://x.com/username",                 color: "#1d9bf0" },
  { key: "stackoverflow_url",label: "Stack Overflow",placeholder: "https://stackoverflow.com/users/id",     color: "#f48024" },
  { key: "devto_url",        label: "Dev.to",        placeholder: "https://dev.to/username",                color: "#a855f7" },
  { key: "portfolio_url",    label: "Portfolio",     placeholder: "https://yoursite.dev",                   color: "#22d3ee" },
];

// Inline SVG dots for social icons (simple, recognizable)
const SocialDot = ({ color }: { color: string }) => (
  <span
    className="inline-block h-2 w-2 shrink-0 rounded-full"
    style={{ background: color, boxShadow: `0 0 6px ${color}99` }}
  />
);

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  prefix?: React.ReactNode;
}) {
  const base =
    "w-full rounded-lg border border-white/10 bg-[#0e0e18] px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/60 focus:bg-[#11111e]";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(base, "resize-none leading-relaxed")}
          style={{ userSelect: "text", cursor: "text" }}
        />
      ) : (
        <div className="flex items-center gap-2">
          {prefix}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(base, prefix ? "flex-1" : "")}
            style={{ userSelect: "text", cursor: "text" }}
          />
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiFetch<ProfileData>("/api/profile")
      .then((d) => {
        // Pre-fill GitHub from auth if not set
        if (!d.github_url && user?.html_url) {
          d.github_url = user.html_url;
        }
        setData(d);
      })
      .catch(() => {
        if (user?.html_url) setData({ github_url: user.html_url });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const set = (key: keyof ProfileData) => (val: string) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || user?.login || "";

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100">
      <Navbar variant="app" />

      <main className="mx-auto max-w-[760px] px-4 pb-16 pt-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-11 w-11 rounded-full border-2 border-violet-500/40 shadow-[0_0_14px_rgba(139,92,246,0.35)]"
              />
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">{displayName}</h1>
              <p className="text-[11px] text-zinc-500">
                {user?.login ? `@${user.login}` : ""}
                {user?.public_repos ? ` · ${user.public_repos} repos` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200",
              saved
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "bg-violet-600 text-white shadow-[0_0_16px_rgba(124,58,237,0.4)] hover:bg-violet-500 disabled:opacity-50"
            )}
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : saved ? (
              <>✓ Saved</>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>

        <div className="space-y-3">
          {/* Basic Info card */}
          <section className="rounded-xl border border-white/[0.07] bg-[#0c0b14] p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Basic Info
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Email"
                value={data.email ?? ""}
                onChange={set("email")}
                placeholder="you@example.com"
                type="email"
              />
              <Field
                label="Phone"
                value={data.phone ?? ""}
                onChange={set("phone")}
                placeholder="+91 98765 43210"
                type="tel"
              />
              <div className="sm:col-span-2">
                <Field
                  label="Current Qualification"
                  value={data.qualification ?? ""}
                  onChange={set("qualification")}
                  placeholder="B.Tech CSE, 3rd Year · IIT Delhi"
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="About"
                  value={data.about ?? ""}
                  onChange={set("about")}
                  placeholder="Full-stack developer who loves debugging at 2am…"
                  multiline
                />
              </div>
            </div>
          </section>

          {/* Social links card */}
          <section className="rounded-xl border border-white/[0.07] bg-[#0c0b14] p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Developer Profiles &amp; Links
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map(({ key, label, placeholder, color }) => (
                <Field
                  key={key}
                  label={label}
                  value={data[key] ?? ""}
                  onChange={set(key)}
                  placeholder={placeholder}
                  prefix={<SocialDot color={color} />}
                />
              ))}
            </div>
          </section>
        </div>

        <p className="mt-3 text-center text-[11px] text-zinc-600">
          All fields are optional — fill only what you want to share.
        </p>
      </main>
    </div>
  );
}
