CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'exploring',
  philosopher text,
  opening_question text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reflections_state_check CHECK (state IN ('exploring','clarifying','examining','deciding','integrating'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflections TO authenticated;
GRANT ALL ON public.reflections TO service_role;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY reflections_select_own ON public.reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY reflections_insert_own ON public.reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY reflections_update_own ON public.reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY reflections_delete_own ON public.reflections FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER reflections_updated_at BEFORE UPDATE ON public.reflections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX reflections_user_updated_idx ON public.reflections (user_id, updated_at DESC);

CREATE TABLE public.thought_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_id uuid REFERENCES public.reflections(id) ON DELETE CASCADE,
  kind text NOT NULL,
  text text NOT NULL,
  context text,
  rationale text,
  philosopher text,
  in_map boolean NOT NULL DEFAULT false,
  muted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thought_objects_kind_check CHECK (kind IN ('question','assumption','value','tension','perspective','insight','pattern','decision'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.thought_objects TO authenticated;
GRANT ALL ON public.thought_objects TO service_role;
ALTER TABLE public.thought_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY thought_objects_select_own ON public.thought_objects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY thought_objects_insert_own ON public.thought_objects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY thought_objects_update_own ON public.thought_objects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY thought_objects_delete_own ON public.thought_objects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER thought_objects_updated_at BEFORE UPDATE ON public.thought_objects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX thought_objects_user_created_idx ON public.thought_objects (user_id, created_at DESC);
CREATE INDEX thought_objects_reflection_idx ON public.thought_objects (reflection_id);

CREATE TABLE public.decision_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_id uuid REFERENCES public.reflections(id) ON DELETE SET NULL,
  situation text NOT NULL,
  decision text NOT NULL,
  reason text,
  risk text,
  learned text,
  watch_for text,
  review_at timestamptz,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_records TO authenticated;
GRANT ALL ON public.decision_records TO service_role;
ALTER TABLE public.decision_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY decision_records_select_own ON public.decision_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY decision_records_insert_own ON public.decision_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY decision_records_update_own ON public.decision_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY decision_records_delete_own ON public.decision_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER decision_records_updated_at BEFORE UPDATE ON public.decision_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.messages ADD COLUMN reflection_id uuid REFERENCES public.reflections(id) ON DELETE SET NULL;