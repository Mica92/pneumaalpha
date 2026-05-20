ALTER TABLE public.messages ADD COLUMN philosopher text NOT NULL DEFAULT 'heidegger';
CREATE INDEX idx_messages_user_philosopher ON public.messages(user_id, philosopher, created_at);
ALTER TABLE public.user_memory ADD COLUMN philosopher text NOT NULL DEFAULT 'heidegger';