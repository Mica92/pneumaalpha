ALTER TABLE public.teaching_materials
  ADD COLUMN IF NOT EXISTS conversion text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_synced_at timestamptz;
CREATE INDEX IF NOT EXISTS teaching_materials_source_idx ON public.teaching_materials (source_material_id);