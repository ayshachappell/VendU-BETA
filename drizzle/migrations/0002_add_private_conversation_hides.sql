CREATE TABLE public.conversation_hides (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  build text NOT NULL DEFAULT 'main',
  hidden_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_email)
);

GRANT ALL ON public.conversation_hides TO service_role;

ALTER TABLE public.conversation_hides ENABLE ROW LEVEL SECURITY;

CREATE INDEX conversation_hides_user_build_idx
  ON public.conversation_hides(user_email, build, hidden_at);