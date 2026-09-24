CREATE OR REPLACE FUNCTION public.protect_editorial_comment_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() = OLD.user_id
     AND NOT EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE user_id = auth.uid()
         AND role IN ('moderator'::public.app_role, 'admin'::public.app_role)
     ) THEN
    NEW.user_id := OLD.user_id;
    NEW.article_slug := OLD.article_slug;
    NEW.author_name := OLD.author_name;
    NEW.lang := OLD.lang;
    NEW.status := 'pending';
    NEW.moderation_note := NULL;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_editorial_comment_fields
BEFORE UPDATE ON public.editorial_comments
FOR EACH ROW EXECUTE FUNCTION public.protect_editorial_comment_fields();