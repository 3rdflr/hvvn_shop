"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const sb = createSupabaseBrowserClient();
    // Trim email to drop trailing spaces some mobile keyboards (Samsung) append.
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    // Hard navigation so the server re-renders with the fresh session cookie
    // (avoids the login form lingering / redirect race).
    window.location.replace(next || "/admin");
  }

  return (
    <div className="container-page py-24 max-w-md">
      <div className="eyebrow mb-3">— Admin</div>
      <h1 className="chrome-text text-4xl mb-8">로그인</h1>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="label">이메일</span>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <label className="block">
          <span className="label">비밀번호</span>
          <div className="relative">
            <input
              className="input pr-12"
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-0 bottom-2 text-[11px] tracking-widest2 uppercase text-muted hover:text-chrome transition"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {err && <div className="text-sm text-accent">{err}</div>}
        <button className="btn w-full" disabled={loading}>
          {loading ? "..." : "Sign in"}
        </button>
      </form>
      <p className="mt-8 text-xs text-muted">
        Supabase 대시보드 → Authentication → Users 에서 관리자 계정을 추가하세요.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
