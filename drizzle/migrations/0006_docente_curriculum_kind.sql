ALTER TABLE public.teaching_materials DROP CONSTRAINT teaching_materials_kind_check;
ALTER TABLE public.teaching_materials ADD CONSTRAINT teaching_materials_kind_check
  CHECK (kind IN ('guide','exam','map','class','research','curriculum'));