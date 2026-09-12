UPDATE public.students
SET school_domain = 'fvsu.edu'
WHERE lower(email) LIKE '%@integroservicegroup.com'
  AND school_domain IS DISTINCT FROM 'fvsu.edu';

DELETE FROM public.campuses c
WHERE c.domain = 'integroservicegroup.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.school_domain = c.domain
  );