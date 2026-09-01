-- Lock down legacy Telegram tables: server-side (service_role) only.
REVOKE ALL ON public.telegram_link_codes FROM anon, authenticated;
REVOKE ALL ON public.telegram_links FROM anon, authenticated;
GRANT ALL ON public.telegram_link_codes TO service_role;
GRANT ALL ON public.telegram_links TO service_role;

ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all for client roles (no client path to insert links or mark codes used)
DROP POLICY IF EXISTS "No client writes to telegram_link_codes" ON public.telegram_link_codes;
CREATE POLICY "No client writes to telegram_link_codes"
  ON public.telegram_link_codes FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No client writes to telegram_links" ON public.telegram_links;
CREATE POLICY "No client writes to telegram_links"
  ON public.telegram_links FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);