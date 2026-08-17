CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- shared_fragments policies
DROP POLICY IF EXISTS "fragments_select_moderator" ON public.shared_fragments;
DROP POLICY IF EXISTS "fragments_update_moderator" ON public.shared_fragments;
DROP POLICY IF EXISTS "fragments_delete_own_or_moderator" ON public.shared_fragments;

CREATE POLICY "fragments_select_moderator" ON public.shared_fragments
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "fragments_update_moderator" ON public.shared_fragments
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "fragments_delete_own_or_moderator" ON public.shared_fragments
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));

-- newsletter policies: moderator read + owner-scoped insert
DROP POLICY IF EXISTS "newsletter_select_moderator" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_insert_any_authenticated" ON public.newsletter_subscribers;

CREATE POLICY "newsletter_select_moderator" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'moderator') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "newsletter_insert_own" ON public.newsletter_subscribers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);