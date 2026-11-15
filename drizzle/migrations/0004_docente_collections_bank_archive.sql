ALTER TABLE public.teaching_materials ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE TABLE public.material_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 600),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX material_collections_user_idx ON public.material_collections (user_id, name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_collections TO authenticated;
GRANT ALL ON public.material_collections TO service_role;
ALTER TABLE public.material_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own collections" ON public.material_collections
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers create own collections" ON public.material_collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers update own collections" ON public.material_collections
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers delete own collections" ON public.material_collections
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE TRIGGER material_collections_updated_at BEFORE UPDATE ON public.material_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.material_collection_items (
  collection_id uuid NOT NULL REFERENCES public.material_collections(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.teaching_materials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, material_id)
);
CREATE INDEX material_collection_items_material_idx ON public.material_collection_items (material_id);
CREATE INDEX material_collection_items_user_idx ON public.material_collection_items (user_id);
GRANT SELECT, INSERT, DELETE ON public.material_collection_items TO authenticated;
GRANT ALL ON public.material_collection_items TO service_role;
ALTER TABLE public.material_collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own collection items" ON public.material_collection_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers add own materials to own collections" ON public.material_collection_items
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND private.is_teacher(auth.uid())
    AND EXISTS (SELECT 1 FROM public.material_collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.teaching_materials m WHERE m.id = material_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Teachers remove own collection items" ON public.material_collection_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));

CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question jsonb NOT NULL DEFAULT '{}'::jsonb,
  prompt text NOT NULL DEFAULT '',
  qtype text NOT NULL DEFAULT 'concept',
  concept text NOT NULL DEFAULT '',
  discipline text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  competency text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('basic','intermediate','advanced')),
  points numeric NOT NULL DEFAULT 0,
  sources text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'es' CHECK (language IN ('es','en')),
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','reviewed')),
  source_material_id uuid REFERENCES public.teaching_materials(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX question_bank_user_idx ON public.question_bank (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_bank TO authenticated;
GRANT ALL ON public.question_bank TO service_role;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers read own bank" ON public.question_bank
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers add to own bank" ON public.question_bank
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers update own bank" ON public.question_bank
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers delete own bank" ON public.question_bank
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE TRIGGER question_bank_updated_at BEFORE UPDATE ON public.question_bank
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();