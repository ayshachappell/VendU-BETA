CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  school_domain text NOT NULL,
  grad_year text,
  build text NOT NULL DEFAULT 'main',
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  kind text NOT NULL DEFAULT 'send',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verification_attempts_email_idx ON public.verification_attempts (email, created_at DESC);
GRANT ALL ON public.verification_attempts TO service_role;
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;