CREATE TABLE public.editorial_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL CHECK (char_length(article_slug) BETWEEN 1 AND 160),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 80),
  content text NOT NULL CHECK (char_length(content) BETWEEN 2 AND 1500),
  lang text NOT NULL DEFAULT 'es' CHECK (lang IN ('es', 'en')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  moderation_note text CHECK (moderation_note IS NULL OR char_length(moderation_note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.editorial_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_comments TO authenticated;
GRANT ALL ON public.editorial_comments TO service_role;

ALTER TABLE public.editorial_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved editorial comments"
ON public.editorial_comments FOR SELECT
TO anon, authenticated
USING (status = 'approved');

CREATE POLICY "Members can read their own editorial comments"
ON public.editorial_comments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Members can create pending editorial comments"
ON public.editorial_comments FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY "Members can update their own pending editorial comments"
ON public.editorial_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Members can delete their own editorial comments"
ON public.editorial_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Moderators can read all editorial comments"
ON public.editorial_comments FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('moderator'::public.app_role, 'admin'::public.app_role))
);

CREATE POLICY "Moderators can update editorial comments"
ON public.editorial_comments FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('moderator'::public.app_role, 'admin'::public.app_role))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('moderator'::public.app_role, 'admin'::public.app_role))
);

CREATE INDEX editorial_comments_article_status_created_idx
ON public.editorial_comments (article_slug, status, created_at DESC);
CREATE INDEX editorial_comments_user_created_idx
ON public.editorial_comments (user_id, created_at DESC);

CREATE TRIGGER editorial_comments_updated_at
BEFORE UPDATE ON public.editorial_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.editorial_comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.editorial_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 2 AND 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.editorial_comment_reports TO authenticated;
GRANT ALL ON public.editorial_comment_reports TO service_role;

ALTER TABLE public.editorial_comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can create editorial comment reports"
ON public.editorial_comment_reports FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY "Members can read their own editorial comment reports"
ON public.editorial_comment_reports FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Members can delete their own editorial comment reports"
ON public.editorial_comment_reports FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Moderators can read editorial comment reports"
ON public.editorial_comment_reports FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('moderator'::public.app_role, 'admin'::public.app_role))
);

CREATE INDEX editorial_comment_reports_comment_idx
ON public.editorial_comment_reports (comment_id, created_at DESC);