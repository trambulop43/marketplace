"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (email) {
    return (
      <span className="auth">
        <a className="auth-link" href="/messages">Messages</a>
        <span className="muted small">{email}</span>
        <button className="auth-btn" onClick={signOut}>Sign out</button>
      </span>
    );
  }
  return (
    <a className="auth-link" href="/login">Sign in</a>
  );
}
