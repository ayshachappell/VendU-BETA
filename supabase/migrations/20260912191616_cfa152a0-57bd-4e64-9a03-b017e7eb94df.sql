CREATE POLICY "Backend services manage verification attempts"
ON public.verification_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);