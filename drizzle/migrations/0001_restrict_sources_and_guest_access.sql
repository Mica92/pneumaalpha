-- Philosopher source corpus: only readable from trusted server code
DROP POLICY IF EXISTS "sources_read_authenticated" ON public.philosopher_sources;
REVOKE SELECT ON public.philosopher_sources FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.match_philosopher_sources(vector, text, int) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.match_philosopher_sources(vector, text, int) TO service_role;

-- Guest (anonymous) sessions never get staff/admin-only data
CREATE POLICY "No guest access to institutional leads" ON public.institutional_leads
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY "No guest access to user roles" ON public.user_roles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY "No guest reads of analytics" ON public.analytics_events
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);