-- Run this in Supabase SQL Editor
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  customer_name text not null,
  phone text,
  instagram text,
  address text,
  product_name text not null,
  source_url text,
  purchase_price numeric default 0,
  selling_price numeric default 0,
  advance_amount numeric default 0,
  status text check (status in ('pending','ordered','delivered','cancelled')) default 'pending',
  comments text,
  delivery_date date
);

alter table public.orders enable row level security;

-- Allow authenticated users to do everything
create policy if not exists "Orders are visible to authenticated users"
on public.orders for select
to authenticated using (true);

create policy if not exists "Insert orders"
on public.orders for insert
to authenticated with check (true);

create policy if not exists "Update orders"
on public.orders for update
to authenticated using (true);

create policy if not exists "Delete orders"
on public.orders for delete
to authenticated using (true);
