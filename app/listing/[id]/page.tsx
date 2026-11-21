import { notFound } from "next/navigation";
import { supabase, formatPrice, type Listing } from "../../../lib/supabase";
import MessageSeller from "../../../components/MessageSeller";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const listing = data as Listing;

  return (
    <main className="page">
      <a className="back" href="/">
        ← Back to listings
      </a>
      <article className="card detail">
        {listing.image_url && (
          <img className="detail-image" src={listing.image_url} alt={listing.title} />
        )}
        <div className="detail-body">
          <div className="listing-price big">{formatPrice(listing.price)}</div>
          <h1 className="detail-title">{listing.title}</h1>
          <div className="listing-cat">
            {listing.category} · Listed{" "}
            {new Date(listing.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <p className="detail-desc">{listing.description}</p>
        </div>
      </article>
      <MessageSeller listingId={listing.id} sellerEmail={listing.email} />
    </main>
  );
}
