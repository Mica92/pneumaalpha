
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.philosopher_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  philosopher text NOT NULL,
  work text NOT NULL,
  reference text NOT NULL,
  lang text NOT NULL DEFAULT 'es',
  content text NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (philosopher, reference, lang)
);

GRANT SELECT ON public.philosopher_sources TO authenticated;
GRANT ALL ON public.philosopher_sources TO service_role;

ALTER TABLE public.philosopher_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sources_read_authenticated"
  ON public.philosopher_sources FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS philosopher_sources_embedding_idx
  ON public.philosopher_sources USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS philosopher_sources_philosopher_idx
  ON public.philosopher_sources (philosopher);

CREATE OR REPLACE FUNCTION public.match_philosopher_sources (
  query_embedding vector(1536),
  target_philosopher text,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  work text,
  reference text,
  lang text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT s.id, s.work, s.reference, s.lang, s.content,
         1 - (s.embedding <=> query_embedding) AS similarity
  FROM public.philosopher_sources s
  WHERE s.philosopher = target_philosopher
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_philosopher_sources(vector, text, int) TO authenticated, service_role;
