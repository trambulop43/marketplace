"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, formatPrice, supabase, type Listing } from "../lib/supabase";

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (fetchError) {
        setError(`Could not load listings: ${fetchError.message}`);
      } else {
        setListings((data ?? []) as Listing[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (category !== "All" && l.category !== category) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    });
  }, [listings, category, query]);

  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div className="browse-bar">
        <div className="tabs">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              className={`tab ${category === c ? "tab-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search listings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Loading listings...</p>
      ) : visible.length === 0 ? (
        <p className="muted">
          {listings.length === 0
            ? "No listings yet. Be the first to sell something!"
            : "Nothing matches. Try another category or search."}
        </p>
      ) : (
        <div className="grid">
          {visible.map((l) => (
            <a className="card listing-card" key={l.id} href={`/listing/${l.id}`}>
              {l.image_url ? (
                <img className="listing-thumb" src={l.image_url} alt={l.title} />
              ) : (
                <div className="listing-thumb listing-thumb-empty">No photo</div>
              )}
              <div className="listing-body">
                <div className="listing-price">{formatPrice(l.price)}</div>
                <div className="listing-title">{l.title}</div>
                <div className="listing-cat">{l.category}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
