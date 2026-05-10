CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE public.chat_bot_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  min_interval_minutes integer NOT NULL DEFAULT 20,
  max_interval_minutes integer NOT NULL DEFAULT 40,
  last_bot_post_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.chat_bot_config (id) VALUES (1);

ALTER TABLE public.chat_bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read bot config" ON public.chat_bot_config FOR SELECT USING (true);
CREATE POLICY "anyone update bot config" ON public.chat_bot_config FOR UPDATE USING (true);