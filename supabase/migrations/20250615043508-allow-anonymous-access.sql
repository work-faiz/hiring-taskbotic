-- Allow anonymous users to read candidates and interviews for candidate login
-- This is needed because candidates don't need to be authenticated to view their own data

-- Allow anonymous users to read candidates
CREATE POLICY "Anonymous users can read candidates"
  ON public.candidates
  FOR SELECT
  USING (true);

-- Allow anonymous users to read interviews  
CREATE POLICY "Anonymous users can read interviews"
  ON public.interviews
  FOR SELECT
  USING (true);

-- Allow anonymous users to insert candidates (for testing/development)
CREATE POLICY "Anonymous users can insert candidates"
  ON public.candidates
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous users to insert interviews (for testing/development)
CREATE POLICY "Anonymous users can insert interviews"
  ON public.interviews
  FOR INSERT
  WITH CHECK (true); 