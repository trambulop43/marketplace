"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Thread = {
  id: number;
  listing_id: number;
  buyer_id: string;
  created_at: string;
  listings: { title: string; user_id: string | null } | null;
};
type ChatMessage = { id: number; sender_id: string; body: string; created_at: string };

export default function MessagesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setMe(uid);
      setChecked(true);
      if (!uid) return;
      const { data: convs } = await supabase
        .from("conversations")
        .select("*, listings(title, user_id)")
        .order("created_at", { ascending: false });
      const mine = (convs ?? []).filter(
        (c: any) => c.buyer_id === uid || c.listings?.user_id === uid
      );
      setThreads(mine as Thread[]);
    });
  }, []);

  async function openThread(id: number) {
    setOpen(id);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (data) setMsgs(data as ChatMessage[]);
  }

  async function send() {
    if (!draft.trim() || !open || !me) return;
    await supabase.from("chat_messages").insert({ conversation_id: open, sender_id: me, body: draft.trim() });
    setDraft("");
    openThread(open);
  }

  if (!checked) return <main className="page narrow"><p className="muted">Loading...</p></main>;
  if (!me)
    return (
      <main className="page narrow">
        <section className="card form-card">
          <h1>Messages</h1>
          <p className="muted">Sign in to see your buyer-seller chats.</p>
          <a className="share wide" href="/login">Sign in</a>
        </section>
      </main>
    );

  return (
    <main className="page narrow">
      <section className="card form-card">
        <h1>Messages</h1>
        {threads.length === 0 && <p className="muted">No conversations yet. Open a listing and start a chat.</p>}
        {threads.map((t) => (
          <div key={t.id} className="thread">
            <button className="link-btn" onClick={() => openThread(t.id)}>
              {t.listings?.title ?? `Listing #${t.listing_id}`}{" "}
              <span className="muted small">
                {t.buyer_id === me ? "(you are the buyer)" : "(you are the seller)"}
              </span>
            </button>
            {open === t.id && (
              <>
                <div className="chat-log">
                  {msgs.map((m) => (
                    <div key={m.id} className={"chat-msg " + (m.sender_id === me ? "mine" : "theirs")}>
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="chat-row">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a reply..."
                    onKeyDown={(e) => e.key === "Enter" && send()} />
                  <button className="share" onClick={send} disabled={!draft.trim()}>Send</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
