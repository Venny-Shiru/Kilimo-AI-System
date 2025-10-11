-- Add RLS policy to allow users to insert their own profile
-- This fixes the "new row violates row-level security policy" error

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
