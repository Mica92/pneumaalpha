-- Kionas Docente: teacher access, teaching materials, versions and AI usage log.

CREATE TABLE public.teacher_access (
  user_id uuid PRIMARY KEY,
  email text,
  full_name text NOT NULL,
  institution text NOT NULL,
  discipline text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','revoked')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.teacher_access TO authenticated;
GRANT ALL ON public.teacher_access TO service_role;
ALTER TABLE public.teacher_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requester or admin reads access" ON public.teacher_access
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Signed-in users request access" ON public.teacher_access
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

CREATE POLICY "Requester edits own open request" ON public.teacher_access
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending','rejected'))
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);

CREATE POLICY "Admins review access requests" ON public.teacher_access
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER teacher_access_updated_at BEFORE UPDATE ON public.teacher_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION private.is_teacher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_access WHERE user_id = _user_id AND status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;
REVOKE ALL ON FUNCTION private.is_teacher(uuid) FROM public;
GRANT EXECUTE ON FUNCTION private.is_teacher(uuid) TO authenticated, service_role;

CREATE TABLE public.teaching_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('guide','exam','map','class')),
  title text NOT NULL DEFAULT '',
  concept text NOT NULL DEFAULT '',
  discipline text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'es' CHECK (language IN ('es','en')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','reviewed')),
  source_material_id uuid REFERENCES public.teaching_materials(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX teaching_materials_user_updated_idx ON public.teaching_materials (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teaching_materials TO authenticated;
GRANT ALL ON public.teaching_materials TO service_role;
ALTER TABLE public.teaching_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read own materials" ON public.teaching_materials
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers create own materials" ON public.teaching_materials
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers update own materials" ON public.teaching_materials
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers delete own materials" ON public.teaching_materials
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));

CREATE TRIGGER teaching_materials_updated_at BEFORE UPDATE ON public.teaching_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.material_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.teaching_materials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX material_versions_material_idx ON public.material_versions (material_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.material_versions TO authenticated;
GRANT ALL ON public.material_versions TO service_role;
ALTER TABLE public.material_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read own versions" ON public.material_versions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers create own versions" ON public.material_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND private.is_teacher(auth.uid())
    AND EXISTS (SELECT 1 FROM public.teaching_materials m WHERE m.id = material_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Teachers delete own versions" ON public.material_versions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));

CREATE TABLE public.docente_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX docente_ai_usage_user_idx ON public.docente_ai_usage (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.docente_ai_usage TO authenticated;
GRANT ALL ON public.docente_ai_usage TO service_role;
ALTER TABLE public.docente_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read own AI usage" ON public.docente_ai_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND private.is_teacher(auth.uid()));
CREATE POLICY "Teachers log own AI usage" ON public.docente_ai_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND private.is_teacher(auth.uid()));
