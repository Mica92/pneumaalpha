DROP INDEX IF EXISTS public.subscriptions_ls_order_id_key;
DROP INDEX IF EXISTS public.subscriptions_ls_subscription_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_ls_order_id_key
  ON public.subscriptions (ls_order_id);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_ls_subscription_id_key
  ON public.subscriptions (ls_subscription_id);