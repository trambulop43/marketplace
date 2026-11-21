import type { Metadata } from "next";
import "./globals.css";
import Auth from "../components/Auth";

export const metadata: Metadata = {
  title: "Mini Marketplace",
  description: "A Facebook-style mini marketplace, built with React, Next.js and Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <a className="logo" href="/">
              marketplace
            </a>
            <a className="sell-link" href="/sell">
              + Sell something
            </a>
            <Auth />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
