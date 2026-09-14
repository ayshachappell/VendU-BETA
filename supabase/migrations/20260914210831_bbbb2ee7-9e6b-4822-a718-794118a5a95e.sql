REVOKE INSERT, UPDATE, DELETE ON public.content_reports FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.content_reports FROM anon;
REVOKE ALL ON public.content_reports FROM anon;
GRANT SELECT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;