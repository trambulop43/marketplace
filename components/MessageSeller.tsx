"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function MessageSeller({
  listingId,
  sellerEmail,
}: {
  listingId: number;
  sellerEmail: string;
}) {
  const [senderEmail, setSenderEmail] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^\S+@\S+\.\S+$/.test(senderEmail.trim()) && body.trim().length > 0;

  async function send() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from("messages").insert({
      listing_id: listingId,
      sender_email: senderEmail.trim(),
      body: body.trim(),
    });
    if (insertError) {
      setError(`Could not send: ${insertError.message}`);
    } else {
      setSent(true);
      setBody("");
    }
    setBusy(false);
  }

  return (
    <section className="card form-card">
      <h2>Message Seller</h2>
      <p className="muted">Your message goes straight to the seller&apos;s inbox.</p>
      {sent ? (
        <p className="sent-note">
          Message sent! The seller will get back to you at {senderEmail.trim()}.
        </p>
      ) : (
        <>
          <label className="field">
            <span>Your email *</span>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Message *</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Hi! Is this still available?`}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="share wide" onClick={send} disabled={!valid || busy}>
            {busy ? "Sending..." : "Send message"}
          </button>
        </>
      )}
      <p className="muted small">Seller contact: {sellerEmail}</p>
    </section>
  );
}
