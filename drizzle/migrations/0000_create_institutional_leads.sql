CREATE TABLE public.institutional_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 200),
  institution text NOT NULL CHECK (char_length(institution) BETWEEN 2 AND 200),
  job_title text NOT NULL CHECK (char_length(job_title) BETWEEN 2 AND 120),
  country text NOT NULL CHECK (char_length(country) BETWEEN 2 AND 80),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 2000),
  interest text NOT NULL DEFAULT 'demo' CHECK (interest IN ('demo', 'pilot')),
  language text NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
  source_path text NOT NULL DEFAULT '/contacto' CHECK (char_length(source_path) <= 120),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX institutional_leads_created_at_idx ON public.institutional_leads (created_at DESC);
CREATE INDEX institutional_leads_ip_hash_idx ON public.institutional_leads (ip_hash, created_at DESC);

GRANT SELECT ON public.institutional_leads TO authenticated;
GRANT ALL ON public.institutional_leads TO service_role;

ALTER TABLE public.institutional_leads ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden leer. Las inserciones se hacen desde el servidor tras validar y filtrar spam.
CREATE POLICY "Admins can read institutional leads"
ON public.institutional_leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
);