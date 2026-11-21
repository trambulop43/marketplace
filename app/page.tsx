import Browse from "../components/Browse";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="page-wide">
      <div className="hero">
        <h1>Buy and sell, simply.</h1>
        <p className="muted">
          A mini marketplace - browse listings, filter by category, or post your own.
        </p>
      </div>
      <Browse />
    </main>
  );
}
