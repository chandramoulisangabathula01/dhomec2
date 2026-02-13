-- 1. Update Existing Data (Standardizing Roles)
UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE role = 'admin';
UPDATE public.profiles SET role = 'CUSTOMER' WHERE role = 'user' OR role IS NULL;

-- 2. Add Check Constraint for strict Role Enforcement
ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF', 'CUSTOMER'));

-- 3. Drop Old Policies (Cleaning up 'admin' references)
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can reply to any ticket" ON public.ticket_messages;

-- 4. Create New Policies for Tickets

-- SUPER_ADMIN can view all tickets
CREATE POLICY "Super Admins view all tickets" ON public.tickets
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- SUPPORT_STAFF can view assigned tickets
CREATE POLICY "Support Staff view assigned tickets" ON public.tickets
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPPORT_STAFF' 
  AND assigned_staff_id = auth.uid()
);

-- SUPER_ADMIN can update all tickets
CREATE POLICY "Super Admins update all tickets" ON public.tickets
FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- SUPPORT_STAFF can update assigned tickets
CREATE POLICY "Support Staff update assigned tickets" ON public.tickets
FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPPORT_STAFF'
  AND assigned_staff_id = auth.uid()
);

-- 5. Create New Policies for Ticket Messages

-- SUPER_ADMIN can view all *messages* (Wait, if they can see ticket, they can see messages?)
-- Usually if you have access to the ticket, you should see messages.
-- Let's define: Messages are viewable if user is owner of ticket OR staff assigned OR Super Admin.
-- Since RLS on messages often checks ticket ownership, we can rely on table joins or just check role.

CREATE POLICY "Super Admins view all messages" ON public.ticket_messages
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

CREATE POLICY "Support Staff view assigned ticket messages" ON public.ticket_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND tickets.assigned_staff_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPPORT_STAFF'
  )
);

-- Same for inserting messages (replying)
CREATE POLICY "Super Admins reply to all tickets" ON public.ticket_messages
FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

CREATE POLICY "Support Staff reply to assigned tickets" ON public.ticket_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND tickets.assigned_staff_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPPORT_STAFF'
  )
);
