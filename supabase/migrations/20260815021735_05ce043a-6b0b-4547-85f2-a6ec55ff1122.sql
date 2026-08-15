ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_founder boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS students_last_active_idx ON public.students (last_active_at);

CREATE OR REPLACE FUNCTION public.purge_stale_students()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  WITH gone AS (
    DELETE FROM public.students s
    WHERE s.is_founder = false
      AND (
        s.last_active_at < now() - interval '1 year'
        OR (
          s.grad_year ~ '^\d{4}$'
          AND s.grad_year::int < extract(year from now())::int
          AND s.last_active_at < now() - interval '90 days'
        )
      )
    RETURNING 1
  )
  SELECT count(*)::int INTO removed FROM gone;

  DELETE FROM public.verification_attempts
  WHERE created_at < now() - interval '30 days';

  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_stale_students() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_stale_students() TO service_role;