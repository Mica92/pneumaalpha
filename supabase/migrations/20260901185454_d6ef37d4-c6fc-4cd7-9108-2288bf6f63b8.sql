CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_paddle_transaction_id_key
  ON public.subscriptions (paddle_transaction_id)
  WHERE paddle_transaction_id IS NOT NULL;