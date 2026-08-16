CREATE TABLE public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  vendor_id text not null,
  build text not null default 'main',
  service text,
  created_at timestamptz not null default now()
);
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  vendor_id text not null,
  build text not null default 'main',
  stars int not null check (stars between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (student_email, vendor_id, build)
);
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.referrals (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null,
  referred_email text not null,
  campus text,
  build text not null default 'main',
  created_at timestamptz not null default now(),
  unique (referred_email)
);
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE INDEX bookings_vendor_idx ON public.bookings (vendor_id, build);
CREATE INDEX reviews_vendor_idx ON public.reviews (vendor_id, build);
CREATE INDEX referrals_code_idx ON public.referrals (ref_code);