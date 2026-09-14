-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  campus_domain text,
  campus_name text,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  payments jsonb NOT NULL DEFAULT '{}'::jsonb,
  phone text,
  vendor_mode boolean NOT NULL DEFAULT false,
  notify jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- vendors (storefronts)
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email text NOT NULL,
  build text NOT NULL DEFAULT 'main',
  campus_domain text NOT NULL,
  shop_name text NOT NULL,
  tagline text,
  category text,
  accent_color text,
  layout text NOT NULL DEFAULT 'window',
  avatar_url text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  availability text,
  payments jsonb NOT NULL DEFAULT '{}'::jsonb,
  boosted boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_email, build)
);
CREATE INDEX vendors_campus_idx ON public.vendors (campus_domain, build, published);
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published storefronts are readable" ON public.vendors FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Backend manages storefronts" ON public.vendors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- vendor services
CREATE TABLE public.vendor_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  price_cents integer,
  price_label text,
  description text,
  promo text,
  promo_ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vendor_services_vendor_idx ON public.vendor_services (vendor_id);
GRANT SELECT ON public.vendor_services TO anon, authenticated;
GRANT ALL ON public.vendor_services TO service_role;
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are readable" ON public.vendor_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages services" ON public.vendor_services FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_vendor_services_updated_at BEFORE UPDATE ON public.vendor_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- vendor photos
CREATE TABLE public.vendor_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  service_id uuid REFERENCES public.vendor_services(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vendor_photos_vendor_idx ON public.vendor_photos (vendor_id);
GRANT SELECT ON public.vendor_photos TO anon, authenticated;
GRANT ALL ON public.vendor_photos TO service_role;
ALTER TABLE public.vendor_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendor photos are readable" ON public.vendor_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages vendor photos" ON public.vendor_photos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- feed posts
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_email text NOT NULL,
  author_name text,
  build text NOT NULL DEFAULT 'main',
  campus_domain text NOT NULL,
  kind text NOT NULL DEFAULT 'item',
  title text NOT NULL,
  body text,
  price_label text,
  image_url text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.campus_events(id) ON DELETE CASCADE,
  sold boolean NOT NULL DEFAULT false,
  auto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_campus_idx ON public.posts (campus_domain, build, created_at DESC);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are readable" ON public.posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages posts" ON public.posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- likes
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, student_email)
);
GRANT SELECT ON public.post_likes TO anon, authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are readable" ON public.post_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages likes" ON public.post_likes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- comments
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  author_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX post_comments_post_idx ON public.post_comments (post_id, created_at);
GRANT SELECT ON public.post_comments TO anon, authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are readable" ON public.post_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages comments" ON public.post_comments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- permanent referral codes
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO anon, authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referral codes are readable" ON public.referral_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Backend manages referral codes" ON public.referral_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- referrals gain a qualification flag
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS qualified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS qualified_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS referrals_unique_referred ON public.referrals (referred_email, build);