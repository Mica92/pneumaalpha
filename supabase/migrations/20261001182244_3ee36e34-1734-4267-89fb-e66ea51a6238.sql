DROP POLICY IF EXISTS "Members can update their own pending editorial comments" ON public.editorial_comments;
CREATE POLICY "Members can update their own editorial comments"
ON public.editorial_comments FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());