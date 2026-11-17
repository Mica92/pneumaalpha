ALTER TABLE public.teaching_materials DROP CONSTRAINT teaching_materials_kind_check;
ALTER TABLE public.teaching_materials ADD CONSTRAINT teaching_materials_kind_check
  CHECK (kind IN ('guide','exam','map','class','research'));

CREATE TABLE public.academic_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 400),
  authors text NOT NULL DEFAULT '' CHECK (char_length(authors) <= 600),
  year text NOT NULL DEFAULT '' CHECK (char_length(year) <= 20),
  container text NOT NULL DEFAULT '' CHECK (char_length(container) <= 400),
  doi text NOT NULL DEFAULT '' CHECK (char_length(doi) <= 200),
  url text NOT NULL DEFAULT '' CHECK (char_length(url) <= 1000),
  origin text NOT NULL CHECK (origin IN ('pasted','txt','pdf','docx','doi','url')),
  integrity text NOT NULL DEFAULT 'provided' CHECK (integrity IN ('verified','provided','pending')),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 400000),
  page_count integer NOT NULL DEFAULT 0,
  extraction_note text NOT NULL DEFAULT '' CHECK (char_length(extraction_note) <= 1000),
  metadata_source text NOT NULL DEFAULT '' CHECK (metadata_source IN ('','crossref')),
  metadata_checked_at timestamptz,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 8000),
  analyses jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX academic_sources_user_updated_idx ON public.academic_sources (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_sources TO authenticated;
GRANT ALL ON public.academic_sources TO service_role;
ALTER TABLE public.academic_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read own sources" ON public.academic_sources
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers add own sources" ON public.academic_sources
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers update own sources" ON public.academic_sources
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers delete own sources" ON public.academic_sources
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));

CREATE TRIGGER academic_sources_updated_at BEFORE UPDATE ON public.academic_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();