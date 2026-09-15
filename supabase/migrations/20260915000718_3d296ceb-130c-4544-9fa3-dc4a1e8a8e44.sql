DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon, authenticated;
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Referral codes are readable" ON public.referral_codes;
REVOKE SELECT ON public.referral_codes FROM anon, authenticated;
CREATE POLICY "Users can read their own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));
GRANT SELECT ON public.referral_codes TO authenticated;