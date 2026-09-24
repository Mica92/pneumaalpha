DROP POLICY IF EXISTS "Members can read their own editorial comment reports" ON public.editorial_comment_reports;
CREATE POLICY "Members can read their own editorial comment reports"
ON public.editorial_comment_reports FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

DROP POLICY IF EXISTS "Members can delete their own editorial comment reports" ON public.editorial_comment_reports;
CREATE POLICY "Members can delete their own editorial comment reports"
ON public.editorial_comment_reports FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

DROP POLICY IF EXISTS "Moderators can read editorial comment reports" ON public.editorial_comment_reports;
CREATE POLICY "Moderators can read editorial comment reports"
ON public.editorial_comment_reports FOR SELECT
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('moderator'::public.app_role, 'admin'::public.app_role)
  )
);