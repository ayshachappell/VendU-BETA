DROP POLICY IF EXISTS "Posts are readable" ON public.posts;
REVOKE SELECT ON public.posts FROM anon, authenticated;

DROP POLICY IF EXISTS "Likes are readable" ON public.post_likes;
REVOKE SELECT ON public.post_likes FROM anon, authenticated;

DROP POLICY IF EXISTS "Comments are readable" ON public.post_comments;
REVOKE SELECT ON public.post_comments FROM anon, authenticated;

DROP POLICY IF EXISTS "Published storefronts are readable" ON public.vendors;
REVOKE SELECT ON public.vendors FROM anon, authenticated;