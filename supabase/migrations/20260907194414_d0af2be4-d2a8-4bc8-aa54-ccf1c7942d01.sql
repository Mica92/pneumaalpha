ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS ls_customer_id text,
  ADD COLUMN IF NOT EXISTS ls_subscription_id text,
  ADD COLUMN IF NOT EXISTS ls_order_id text,
  ADD COLUMN IF NOT EXISTS ls_variant_id text,
  ADD COLUMN IF NOT EXISTS ls_status text;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_ls_subscription_id_key
  ON public.subscriptions (ls_subscription_id) WHERE ls_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_ls_order_id_key
  ON public.subscriptions (ls_order_id) WHERE ls_order_id IS NOT NULL;