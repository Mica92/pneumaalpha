ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS whatsapp_optin boolean NOT NULL DEFAULT false;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_phone_e164 CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{6,14}$');

GRANT UPDATE ON public.newsletter_subscribers TO authenticated;

CREATE POLICY "newsletter_update_own" ON public.newsletter_subscribers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);