# Mini Marketplace

A Facebook-style mini marketplace built with **React 18 + Next.js 14 (App Router) + TypeScript + Supabase**.

Visitors can post a listing with a photo, title, description, price, email and
category; browse every listing on the home page with category tabs and keyword
search; open a listing's own page; and message the seller - the message is
saved in Supabase. No login needed.

Live: https://marketplace-weld-nine.vercel.app

## Features

- **Create listing** - photo upload (Supabase Storage), title, description, price (PHP), contact email, category
- **Browse** - responsive grid of all listings, newest first, with category tabs
- **Keyword search** (bonus) - filters titles and descriptions as you type
- **Listing detail page** - photo, full details, listed time, seller contact
- **Message Seller** - buyer email + message saved to a private Supabase table
- Sleek modern UI, responsive down to mobile widths

## Stack

- Next.js 14 + React 18 + TypeScript
- Supabase (Postgres + Storage) via `@supabase/supabase-js`
- Deployed on Vercel

## Database setup

```sql
create table listings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  title text not null,
  description text not null,
  price numeric not null,
  email text not null,
  category text not null,
  image_url text
);

alter table listings enable row level security;

create policy "anyone can read listings"
  on listings for select using (true);

create policy "anyone can create listings"
  on listings for insert with check (true);

grant select, insert on table listings to anon, authenticated;

create table messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  listing_id bigint not null references listings(id),
  sender_email text not null,
  body text not null
);

alter table messages enable row level security;

-- Insert-only for visitors: buyer messages stay private to the seller.
create policy "anyone can send messages"
  on messages for insert with check (true);

grant insert on table messages to anon, authenticated;
```

Photos go to a public Storage bucket, `photos` (shared with the wall project),
under the `listings/` prefix:

```sql
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

create policy "public read photos"
  on storage.objects for select using (bucket_id = 'photos');

create policy "anon upload photos"
  on storage.objects for insert with check (bucket_id = 'photos');
```

## Run it locally

```bash
npm install
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev
```

Then open http://localhost:3000.

## Project layout

```
app/page.tsx              home (browse) page
app/sell/page.tsx         create-listing form
app/listing/[id]/page.tsx listing detail + Message Seller
components/Browse.tsx     category tabs, keyword search, grid
components/MessageSeller.tsx
lib/supabase.ts           Supabase client + types
app/globals.css           sleek modern styling
```

Deployed on Vercel: https://marketplace-weld-nine.vercel.app
