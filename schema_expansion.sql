-- 1. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer', -- 'customer', 'admin', 'staff'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  total_amount numeric,
  currency text default 'INR',
  shipping_address jsonb,
  payment_id text -- Razorpay payment ID
);

-- 3. Create Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1,
  price_at_purchase numeric,
  customization_details jsonb -- For product customization
);

-- 4. Create Tickets Table
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subject text not null,
  status text default 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  priority text default 'medium', -- 'low', 'medium', 'high'
  assigned_to uuid references public.profiles(id)
);

-- 5. Create Ticket Messages Table
create table public.ticket_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message text not null,
  is_internal boolean default false
);

-- 6. Enable RLS
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

-- 7. Policies

-- Profiles: 
-- Users can view/edit their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
-- Admins can view all profiles
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Orders: 
-- Users can view their own orders
create policy "Users can view own orders" on orders for select using (user_id = auth.uid());
-- Admins can view all orders
create policy "Admins can view all orders" on orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Users can create orders
create policy "Users can create orders" on orders for insert with check (auth.uid() = user_id);

-- Order Items:
-- Users can view items of their own orders
create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
);
-- Admins can view all order items
create policy "Admins can view all order items" on order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Tickets:
-- Users can view their own tickets
create policy "Users can view own tickets" on tickets for select using (user_id = auth.uid());
-- Admins can view all tickets
create policy "Admins can view all tickets" on tickets for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Users can create tickets
create policy "Users can create tickets" on tickets for insert with check (auth.uid() = user_id);

-- Ticket Messages:
-- Users can view messages of their tickets
create policy "Users can view own ticket messages" on ticket_messages for select using (
  exists (select 1 from public.tickets where id = ticket_messages.ticket_id and user_id = auth.uid())
);
-- Admins can view all ticket messages
create policy "Admins can view all ticket messages" on ticket_messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Users/Admins can insert messages
create policy "Users/Admins can insert messages" on ticket_messages for insert with check (
   exists (select 1 from public.tickets where id = ticket_messages.ticket_id and user_id = auth.uid())
   or
   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
