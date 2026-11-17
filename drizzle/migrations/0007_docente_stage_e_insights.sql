ALTER TABLE public.teaching_materials
  ADD COLUMN favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN ready_at timestamptz;

UPDATE public.teaching_materials SET ready_at = updated_at WHERE review_status = 'reviewed' AND ready_at IS NULL;

ALTER TABLE public.teaching_materials ADD CONSTRAINT teaching_materials_tags_limit CHECK (cardinality(tags) <= 20);

-- Organizing a material (favorite, tags, archive) must not count as editing it,
-- otherwise linked derivatives would be flagged as outdated.
CREATE OR REPLACE FUNCTION private.touch_teaching_material()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (to_jsonb(NEW) - ARRAY['favorite','tags','archived_at','updated_at'])
     IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['favorite','tags','archived_at','updated_at']) THEN
    NEW.updated_at := now();
  ELSE
    NEW.updated_at := OLD.updated_at;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS teaching_materials_updated_at ON public.teaching_materials;
CREATE TRIGGER teaching_materials_updated_at BEFORE UPDATE ON public.teaching_materials
  FOR EACH ROW EXECUTE FUNCTION private.touch_teaching_material();

CREATE INDEX teaching_materials_user_tags_idx ON public.teaching_materials USING gin (tags);

-- Teacher preferences and institutional template fields (never invented: typed by the teacher).
CREATE TABLE public.docente_preferences (
  user_id uuid PRIMARY KEY,
  institution text NOT NULL DEFAULT '' CHECK (char_length(institution) <= 200),
  faculty text NOT NULL DEFAULT '' CHECK (char_length(faculty) <= 200),
  course text NOT NULL DEFAULT '' CHECK (char_length(course) <= 200),
  teacher_name text NOT NULL DEFAULT '' CHECK (char_length(teacher_name) <= 200),
  template text NOT NULL DEFAULT 'academic' CHECK (template IN ('academic','editorial','seminar','institutional')),
  show_header boolean NOT NULL DEFAULT true,
  default_discipline text NOT NULL DEFAULT '' CHECK (char_length(default_discipline) <= 120),
  default_level text NOT NULL DEFAULT '' CHECK (char_length(default_level) <= 60),
  default_language text NOT NULL DEFAULT 'es' CHECK (default_language IN ('es','en')),
  hourly_rate numeric(12,2) CHECK (hourly_rate IS NULL OR (hourly_rate >= 0 AND hourly_rate <= 10000000)),
  currency text NOT NULL DEFAULT 'CLP' CHECK (char_length(currency) <= 8),
  track_time boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.docente_preferences TO authenticated;
GRANT ALL ON public.docente_preferences TO service_role;
ALTER TABLE public.docente_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own preferences" ON public.docente_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers create own preferences" ON public.docente_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers update own preferences" ON public.docente_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE TRIGGER docente_preferences_updated_at BEFORE UPDATE ON public.docente_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Active preparation time, per material and day (only the teacher's own work; no student data).
CREATE TABLE public.docente_work_log (
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.teaching_materials(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  seconds integer NOT NULL DEFAULT 0 CHECK (seconds >= 0 AND seconds <= 86400),
  PRIMARY KEY (material_id, day)
);
CREATE INDEX docente_work_log_user_idx ON public.docente_work_log (user_id, day DESC);
GRANT SELECT, INSERT, UPDATE ON public.docente_work_log TO authenticated;
GRANT ALL ON public.docente_work_log TO service_role;
ALTER TABLE public.docente_work_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own work log" ON public.docente_work_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers log own work" ON public.docente_work_log
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND private.is_teacher(auth.uid())
    AND EXISTS (SELECT 1 FROM public.teaching_materials m WHERE m.id = material_id AND m.user_id = auth.uid()));
CREATE POLICY "Teachers update own work log" ON public.docente_work_log
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));

-- Adds seconds to today's row (runs with the caller's rights, so RLS applies).
CREATE OR REPLACE FUNCTION public.log_docente_work(_material_id uuid, _seconds integer)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  INSERT INTO public.docente_work_log (user_id, material_id, day, seconds)
  VALUES (auth.uid(), _material_id, current_date, LEAST(GREATEST(_seconds, 0), 300))
  ON CONFLICT (material_id, day)
  DO UPDATE SET seconds = LEAST(public.docente_work_log.seconds + LEAST(GREATEST(EXCLUDED.seconds, 0), 300), 86400);
$$;
REVOKE ALL ON FUNCTION public.log_docente_work(uuid, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.log_docente_work(uuid, integer) TO authenticated;

-- Academic review history: AI observations and the teacher's decision on each one.
CREATE TABLE public.docente_quality_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.teaching_materials(id) ON DELETE CASCADE,
  report jsonb NOT NULL,
  decisions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX docente_quality_reviews_material_idx ON public.docente_quality_reviews (material_id, created_at DESC);
CREATE INDEX docente_quality_reviews_user_idx ON public.docente_quality_reviews (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.docente_quality_reviews TO authenticated;
GRANT ALL ON public.docente_quality_reviews TO service_role;
ALTER TABLE public.docente_quality_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own reviews" ON public.docente_quality_reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers create own reviews" ON public.docente_quality_reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND private.is_teacher(auth.uid())
    AND EXISTS (SELECT 1 FROM public.teaching_materials m WHERE m.id = material_id AND m.user_id = auth.uid()));
CREATE POLICY "Teachers update own reviews" ON public.docente_quality_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers delete own reviews" ON public.docente_quality_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE TRIGGER docente_quality_reviews_updated_at BEFORE UPDATE ON public.docente_quality_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();