CREATE TABLE public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  creator_email text NOT NULL,
  creator_name text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  description text,
  image_url text,
  build text NOT NULL DEFAULT 'main' CHECK (build IN ('main', 'beta')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.campus_events TO service_role;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX campus_events_domain_start_idx ON public.campus_events (domain, starts_at) WHERE active = true;
CREATE INDEX campus_events_creator_idx ON public.campus_events (creator_email, created_at DESC);
CREATE TRIGGER update_campus_events_updated_at BEFORE UPDATE ON public.campus_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_email)
);
GRANT ALL ON public.event_interests TO service_role;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
CREATE INDEX event_interests_event_idx ON public.event_interests (event_id);

CREATE TABLE public.event_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  event_id uuid REFERENCES public.campus_events(id) ON DELETE CASCADE,
  actor_email text,
  kind text NOT NULL DEFAULT 'event_interest' CHECK (kind IN ('event_interest')),
  message text NOT NULL,
  build text NOT NULL DEFAULT 'main' CHECK (build IN ('main', 'beta')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.event_notifications TO service_role;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX event_notifications_recipient_idx ON public.event_notifications (recipient_email, read_at, created_at DESC);
CREATE UNIQUE INDEX event_interest_notification_once_idx ON public.event_notifications (recipient_email, event_id, actor_email, kind);