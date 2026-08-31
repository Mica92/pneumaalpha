ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_paddle_subscription_id_key
  ON public.subscriptions (paddle_subscription_id)
  WHERE paddle_subscription_id IS NOT NULL;