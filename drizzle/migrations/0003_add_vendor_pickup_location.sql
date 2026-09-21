ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS pickup_label text,
  ADD COLUMN IF NOT EXISTS pickup_lat double precision,
  ADD COLUMN IF NOT EXISTS pickup_lng double precision;