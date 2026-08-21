CREATE POLICY newsletter_delete_own ON public.newsletter_subscribers FOR DELETE TO authenticated USING (auth.uid() = user_id);

REVOKE ALL ON public.telegram_updates FROM anon, authenticated;
GRANT ALL ON public.telegram_updates TO service_role;