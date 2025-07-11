
-- Allow authenticated users to view all candidates

CREATE POLICY "Authenticated users can view candidates"
  ON public.candidates
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optionally, allow authenticated users to insert, update, and delete candidates (uncomment if needed):
-- CREATE POLICY "Authenticated users can add candidates"
--   ON public.candidates
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can update candidates"
--   ON public.candidates
--   FOR UPDATE
--   USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete candidates"
--   ON public.candidates
--   FOR DELETE
--   USING (auth.role() = 'authenticated');
