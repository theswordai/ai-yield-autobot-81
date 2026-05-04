
-- announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "anyone insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "anyone delete announcements" ON public.announcements FOR DELETE USING (true);

-- announcement_reads
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wallet_address, announcement_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read reads" ON public.announcement_reads FOR SELECT USING (true);
CREATE POLICY "anyone insert reads" ON public.announcement_reads FOR INSERT WITH CHECK (true);
CREATE INDEX idx_reads_wallet ON public.announcement_reads(wallet_address);

-- inbox_messages
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read inbox" ON public.inbox_messages FOR SELECT USING (true);
CREATE POLICY "anyone insert inbox" ON public.inbox_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update inbox" ON public.inbox_messages FOR UPDATE USING (true);
CREATE POLICY "anyone delete inbox" ON public.inbox_messages FOR DELETE USING (true);
CREATE INDEX idx_inbox_wallet ON public.inbox_messages(wallet_address);

-- support_threads
CREATE TABLE public.support_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  unread_user BOOLEAN NOT NULL DEFAULT false,
  unread_admin BOOLEAN NOT NULL DEFAULT false,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read threads" ON public.support_threads FOR SELECT USING (true);
CREATE POLICY "anyone insert threads" ON public.support_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update threads" ON public.support_threads FOR UPDATE USING (true);
CREATE POLICY "anyone delete threads" ON public.support_threads FOR DELETE USING (true);
CREATE INDEX idx_threads_wallet ON public.support_threads(wallet_address);

-- support_messages
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.support_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user','admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read messages" ON public.support_messages FOR SELECT USING (true);
CREATE POLICY "anyone insert messages" ON public.support_messages FOR INSERT WITH CHECK (true);
CREATE INDEX idx_messages_thread ON public.support_messages(thread_id);

-- admin_wallets
CREATE TABLE public.admin_wallets (
  wallet_address TEXT PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read admins" ON public.admin_wallets FOR SELECT USING (true);
CREATE POLICY "anyone insert admins" ON public.admin_wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone delete admins" ON public.admin_wallets FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.inbox_messages REPLICA IDENTITY FULL;
ALTER TABLE public.support_threads REPLICA IDENTITY FULL;
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;
