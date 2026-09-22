CREATE TABLE public.saved_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  philosopher text,
  source_question text,
  context text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_insights TO authenticated;
GRANT ALL ON public.saved_insights TO service_role;

ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_insights_select_own" ON public.saved_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "saved_insights_insert_own" ON public.saved_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_insights_update_own" ON public.saved_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_insights_delete_own" ON public.saved_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_saved_insights_user_created ON public.saved_insights (user_id, created_at DESC);

CREATE TRIGGER saved_insights_updated_at
  BEFORE UPDATE ON public.saved_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();