-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF', 'CUSTOMER');

-- Update Profiles Table
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE text, -- Resetting type to simple text first if needed, but PRD asks for strict roles. 
  -- Let's stick to text but add a check constraint or use the enum. 
  -- Existing data might have 'user', so we need to handle that.
  ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- Safely cast existing roles
UPDATE public.profiles SET role = 'CUSTOMER' WHERE role = 'user' OR role IS NULL;
-- Now we can potentially switch to enum, but text with check is often easier for simple apps to evolve
ALTER TABLE public.profiles ADD CONSTRAINT check_role CHECK (role IN ('SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF', 'CUSTOMER'));


-- Products Table Updates
CREATE TYPE product_type AS ENUM ('DIRECT_SALE', 'CONSULTATION_ONLY');

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'DIRECT_SALE' CHECK (type IN ('DIRECT_SALE', 'CONSULTATION_ONLY')),
  ADD COLUMN IF NOT EXISTS hsn_code text,
  ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"length": 0, "breadth": 0, "height": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zakeke_template_id text,
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"title": "", "desc": ""}'::jsonb;

-- Orders Table Updates
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tax_breakdown JSONB DEFAULT '{"cgst": 0, "sgst": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_info JSONB; -- 'shipping' is a reserved word in some contexts, keeping it safe or just "shipping"

-- Tickets Table Updates
CREATE TYPE ticket_type AS ENUM ('MEASUREMENT_REQ', 'RETURN_REQ', 'GENERAL_QUERY');

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'GENERAL_QUERY' CHECK (type IN ('MEASUREMENT_REQ', 'RETURN_REQ', 'GENERAL_QUERY')),
  ADD COLUMN IF NOT EXISTS assigned_staff_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Security / RLS Updates (Preliminary)
-- Ensure RLS is on
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policies can be complex, for now we ensure basic access works.
-- We will refine policies in a separate step or file.
