import { createClient } from "@supabase/supabase-js";

// Public anon key + project URL are safe to expose in the browser.
// Row Level Security limits what anyone can do with them.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Sports",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Listing = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  price: number;
  email: string;
  category: string;
  image_url: string | null;
  user_id?: string | null;
};

export type Message = {
  id: number;
  created_at: string;
  listing_id: number;
  sender_email: string;
  body: string;
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(price);
}
