CREATE TABLE public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  display_name text NOT NULL,
  accent_color text NOT NULL DEFAULT '#5A2BE0',
  mascot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campuses TO anon, authenticated;
GRANT ALL ON public.campuses TO service_role;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campuses are public" ON public.campuses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.campus_event_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL REFERENCES public.campuses(domain) ON DELETE CASCADE,
  feed_url text NOT NULL,
  feed_type text NOT NULL DEFAULT 'ics' CHECK (feed_type IN ('ics','localist')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (domain, feed_url)
);
GRANT SELECT ON public.campus_event_feeds TO anon, authenticated;
GRANT ALL ON public.campus_event_feeds TO service_role;
ALTER TABLE public.campus_event_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campus feeds are public" ON public.campus_event_feeds FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.events_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  description text,
  link text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (domain, external_id)
);
CREATE INDEX events_cache_domain_start_idx ON public.events_cache (domain, starts_at);
GRANT SELECT ON public.events_cache TO anon, authenticated;
GRANT ALL ON public.events_cache TO service_role;
ALTER TABLE public.events_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cached campus events are public" ON public.events_cache FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_campuses_updated_at BEFORE UPDATE ON public.campuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campus_event_feeds_updated_at BEFORE UPDATE ON public.campus_event_feeds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_cache_updated_at BEFORE UPDATE ON public.events_cache FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();