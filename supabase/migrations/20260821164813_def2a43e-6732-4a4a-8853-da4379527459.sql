CREATE TABLE public.journey_nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id text NOT NULL,
  entity_kind text NOT NULL,
  reason text,
  count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_nodes TO authenticated;
GRANT ALL ON public.journey_nodes TO service_role;

ALTER TABLE public.journey_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_nodes_select_own" ON public.journey_nodes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "journey_nodes_insert_own" ON public.journey_nodes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journey_nodes_update_own" ON public.journey_nodes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journey_nodes_delete_own" ON public.journey_nodes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX journey_nodes_user_idx ON public.journey_nodes (user_id, updated_at DESC);

CREATE TRIGGER update_journey_nodes_updated_at
BEFORE UPDATE ON public.journey_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();