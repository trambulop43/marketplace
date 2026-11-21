"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "trambulop43+admin@gmail.com";

export default function AdminPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email !== ADMIN_EMAIL) {
        setOk(false);
        return;
      }
      setOk(true);
      const { data: convs } = await supabase
        .from("conversations")
        .select("*, listings(title)");
      setRows(convs ?? []);
    });
  }, []);

  if (ok === null) return <main className="page narrow"><p className="muted">Loading...</p></main>;
  if (!ok)
    return (
      <main className="page narrow">
        <section className="card form-card"><h1>Admin</h1><p className="muted">Admins only.</p></section>
      </main>
    );
  return (
    <main className="page narrow">
      <section className="card form-card">
        <h1>Admin: all conversations</h1>
        {rows.length === 0 && <p className="muted">No conversations yet.</p>}
        {rows.map((c) => (
          <p key={c.id} className="muted">
            #{c.id} - {c.listings?.title ?? c.listing_id} - buyer {c.buyer_id.slice(0, 8)}... -{" "}
            {new Date(c.created_at).toLocaleString()}
          </p>
        ))}
      </section>
    </main>
  );
}
