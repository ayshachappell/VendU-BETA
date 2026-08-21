-- 1. Admin roles ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Trust & safety ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  target_id text NOT NULL,
  target_name text,
  build text NOT NULL DEFAULT 'main',
  campus text,
  reporter_email text,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reporters can read their own reports" ON public.content_reports;
CREATE POLICY "Reporters can read their own reports" ON public.content_reports
  FOR SELECT TO authenticated USING (reporter_email = (auth.jwt() ->> 'email'));

CREATE TABLE IF NOT EXISTS public.moderation_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  target_id text NOT NULL,
  build text NOT NULL DEFAULT 'main',
  action text NOT NULL DEFAULT 'hidden',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, target_id, build)
);
GRANT SELECT ON public.moderation_blocks TO anon, authenticated;
GRANT ALL ON public.moderation_blocks TO service_role;
ALTER TABLE public.moderation_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Moderation blocks are public" ON public.moderation_blocks;
CREATE POLICY "Moderation blocks are public" ON public.moderation_blocks
  FOR SELECT TO anon, authenticated USING (true);

-- 3. Own-records-only access for existing student data -----------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_event_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.students TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.reviews TO service_role;
GRANT ALL ON public.referrals TO service_role;
GRANT ALL ON public.verification_attempts TO service_role;

DROP POLICY IF EXISTS "Students manage their own record" ON public.students;
CREATE POLICY "Students manage their own record" ON public.students
  FOR ALL TO authenticated
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Students manage their own bookings" ON public.bookings;
CREATE POLICY "Students manage their own bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (student_email = (auth.jwt() ->> 'email'))
  WITH CHECK (student_email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Students manage their own reviews" ON public.reviews;
CREATE POLICY "Students manage their own reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (student_email = (auth.jwt() ->> 'email'))
  WITH CHECK (student_email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Students manage their own referrals" ON public.referrals;
CREATE POLICY "Students manage their own referrals" ON public.referrals
  FOR ALL TO authenticated
  USING (referred_email = (auth.jwt() ->> 'email'))
  WITH CHECK (referred_email = (auth.jwt() ->> 'email'));

CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports (status, created_at DESC);