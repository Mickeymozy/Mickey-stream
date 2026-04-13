-- Fix RLS policies for subscriptions table
-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Admins can manage subs" ON public.subscriptions;

-- Create separate, explicit policies for admins with proper WITH CHECK clauses
CREATE POLICY "Admins can select subs" ON public.subscriptions 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subs" ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subs" ON public.subscriptions 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subs" ON public.subscriptions 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));
