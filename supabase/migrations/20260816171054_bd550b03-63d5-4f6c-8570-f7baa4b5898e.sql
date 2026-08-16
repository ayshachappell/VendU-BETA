REVOKE ALL ON public.bookings FROM anon, authenticated;
REVOKE ALL ON public.reviews FROM anon, authenticated;
REVOKE ALL ON public.referrals FROM anon, authenticated;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.reviews TO service_role;
GRANT ALL ON public.referrals TO service_role;