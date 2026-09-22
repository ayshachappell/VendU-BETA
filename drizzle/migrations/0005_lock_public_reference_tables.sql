-- These tables are only ever read by the server (service_role); clients
-- never query them directly, so remove the read-everything policies.
DROP POLICY IF EXISTS "Campuses are public" ON public.campuses;
DROP POLICY IF EXISTS "Campus feeds are public" ON public.campus_event_feeds;
DROP POLICY IF EXISTS "Cached campus events are public" ON public.events_cache;
DROP POLICY IF EXISTS "Services are readable" ON public.vendor_services;
DROP POLICY IF EXISTS "Vendor photos are readable" ON public.vendor_photos;

REVOKE SELECT ON public.campuses FROM anon, authenticated;
REVOKE SELECT ON public.campus_event_feeds FROM anon, authenticated;
REVOKE SELECT ON public.events_cache FROM anon, authenticated;
REVOKE SELECT ON public.vendor_services FROM anon, authenticated;
REVOKE SELECT ON public.vendor_photos FROM anon, authenticated;

GRANT ALL ON public.campuses TO service_role;
GRANT ALL ON public.campus_event_feeds TO service_role;
GRANT ALL ON public.events_cache TO service_role;
GRANT ALL ON public.vendor_services TO service_role;
GRANT ALL ON public.vendor_photos TO service_role;

-- Direct client writes to message attachments are already impossible
-- (no INSERT/UPDATE/DELETE grant path); these deny-all policies add nothing.
DROP POLICY IF EXISTS "Message attachments reject direct client uploads" ON storage.objects;
DROP POLICY IF EXISTS "Message attachments reject direct client changes" ON storage.objects;
DROP POLICY IF EXISTS "Message attachments reject direct client deletion" ON storage.objects;