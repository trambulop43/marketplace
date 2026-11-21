"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 6;

  async function go() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const creds = { email: email.trim(), password };
      const { error: e } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(creds)
          : await supabase.auth.signUp(creds);
      if (e) setError(e.message);
      else router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <main className="page narrow">
      <section className="card form-card">
        <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="muted">
          Sign in to chat with buyers and sellers in real time. You can browse and post without an account.
        </p>
        <label className="field">
          <span>Email *</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>Password *</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="share wide" onClick={go} disabled={!valid || busy}>
          {busy ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button className="link-btn" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
