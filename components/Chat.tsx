"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ChatMessage = {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function Chat({ listingId, ownerId }: { listingId: number; ownerId: string | null }) {
  const [me, setMe] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setMe(data.session?.user?.id ?? null);
      setChecked(true);
    });
  }, []);

  async function loadMessages(cId: number) {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", cId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  }

  useEffect(() => {
    if (!me || !ownerId || me === ownerId) return;
    (async () => {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("buyer_id", me)
        .maybeSingle();
      let cId = existing?.id as number | undefined;
      if (!cId) {
        const { data: created } = await supabase
          .from("conversations")
          .insert({ listing_id: listingId, buyer_id: me })
          .select("id")
          .single();
        cId = created?.id as number | undefined;
      }
      if (cId) {
        setConvId(cId);
        loadMessages(cId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, ownerId, listingId]);

  if (!checked || !me || !ownerId || me === ownerId) return null;

  async function send() {
    if (!draft.trim() || !convId || !me || busy) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: convId, sender_id: me, body: draft.trim() });
    if (e) setError(e.message);
    else {
      setDraft("");
      loadMessages(convId);
    }
    setBusy(false);
  }

  return (
    <section className="card form-card">
      <h2>Chat with the seller</h2>
      <div className="chat-log">
        {messages.length === 0 && <p className="muted">No messages yet. Say hello!</p>}
        {messages.map((m) => (
          <div key={m.id} className={"chat-msg " + (m.sender_id === me ? "mine" : "theirs")}>
            {m.body}
          </div>
        ))}
      </div>
      <div className="chat-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message..."
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="share" onClick={send} disabled={!draft.trim() || busy}>
          Send
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
