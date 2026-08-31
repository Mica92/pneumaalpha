CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('monthly','semiannual','lifetime')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired','past_due')),
  whop_membership_id text UNIQUE,
  whop_receipt_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_lifetime_idx ON public.subscriptions(plan) WHERE plan = 'lifetime';
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select_own ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.usage_counters (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_messages_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_counters_select_own ON public.usage_counters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY usage_counters_insert_own ON public.usage_counters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY usage_counters_update_own ON public.usage_counters FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER usage_counters_updated_at BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  event text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_event_idx ON public.analytics_events(event, created_at DESC);
CREATE INDEX analytics_events_user_idx ON public.analytics_events(user_id, created_at);
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_insert_own ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY analytics_select_admin ON public.analytics_events FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.lifetime_seats_taken()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.subscriptions
  WHERE plan = 'lifetime' AND status = 'active';
$$;
GRANT EXECUTE ON FUNCTION public.lifetime_seats_taken() TO anon, authenticated, service_role;