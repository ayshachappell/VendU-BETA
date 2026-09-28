ALTER TABLE public.students ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'starter';
UPDATE public.students SET tier = 'founder' WHERE lower(email) = 'ayshac@venduapp.com';
UPDATE public.students SET tier = 'charter', is_founder = false WHERE is_founder = true AND lower(email) <> 'ayshac@venduapp.com';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS audience_all boolean NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS audience_domains text[];
ALTER TABLE public.campus_events ADD COLUMN IF NOT EXISTS audience_all boolean NOT NULL DEFAULT false;
ALTER TABLE public.campus_events ADD COLUMN IF NOT EXISTS audience_domains text[];
ALTER TABLE public.vendor_photos ADD COLUMN IF NOT EXISTS link_url text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS founder_page boolean NOT NULL DEFAULT false;