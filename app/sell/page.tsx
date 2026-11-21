"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, supabase } from "../../lib/supabase";

const BUCKET = "photos";

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const priceNum = Number(price);
  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    price.trim().length > 0 &&
    Number.isFinite(priceNum) &&
    priceNum >= 0 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    photo !== null;

  function pickPhoto(file: File | null) {
    if (file && !file.type.startsWith("image/")) {
      setError("Photos only, please.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError("That photo is over 5 MB. Pick a smaller one.");
      return;
    }
    setError(null);
    setPhoto(file);
  }

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `listings/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, photo, { contentType: photo.type });
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
        const { data: publicData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);
        imageUrl = publicData.publicUrl;
      }
      const { data: authData } = await supabase.auth.getUser();
      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          user_id: authData.user?.id ?? null,
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          email: email.trim(),
          category,
          image_url: imageUrl,
        })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      router.push(`/listing/${data.id}`);
    } catch (e) {
      setError(`Could not create the listing: ${e instanceof Error ? e.message : String(e)}`);
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="card form-card">
        <h1>Sell something</h1>
        <p className="muted">Post a listing with a photo and your contact email.</p>

        <label className="field">
          <span>Photo *</span>
          <label className="photo-drop">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <img className="photo-preview" src={preview} alt="Listing photo preview" />
            ) : (
              <span className="photo-hint">Click to add a photo</span>
            )}
          </label>
        </label>

        <label className="field">
          <span>Title *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 12, barely used"
          />
        </label>

        <label className="field">
          <span>Description *</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition, meetup details, anything a buyer should know."
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Price (PHP) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500"
            />
          </label>

          <label className="field">
            <span>Category *</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Your email *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="share wide" onClick={submit} disabled={!valid || busy}>
          {busy ? "Posting..." : "Post listing"}
        </button>
      </section>
    </main>
  );
}
