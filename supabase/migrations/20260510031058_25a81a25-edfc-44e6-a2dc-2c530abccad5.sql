CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages (created_at DESC);
CREATE INDEX idx_chat_messages_wallet_created ON public.chat_messages (wallet_address, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "anyone insert chat" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update chat" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "anyone delete chat" ON public.chat_messages FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;