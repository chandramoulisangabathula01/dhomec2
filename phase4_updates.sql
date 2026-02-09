-- Phase 4 Updates

-- 1. Cart Items
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 2. Reviews
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Product 3D Link
alter table public.products add column if not exists three_d_model_url text;

-- 4. RLS & Policies

-- Cart Items
alter table public.cart_items enable row level security;

create policy "Users can view own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert into own cart" on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete from own cart" on cart_items for delete using (auth.uid() = user_id);
create policy "Admins can view all cart items" on cart_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Reviews
alter table public.reviews enable row level security;

create policy "Public reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can create reviews" on reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);
create policy "Admins can delete any review" on reviews for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
