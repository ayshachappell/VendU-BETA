DROP POLICY IF EXISTS "Moderation blocks are public" ON public.moderation_blocks;
REVOKE SELECT ON public.moderation_blocks FROM anon, authenticated;
GRANT ALL ON public.moderation_blocks TO service_role;