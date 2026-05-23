
-- 1) Admin check helper (SECURITY DEFINER bypasses RLS so client never reads admin_wallets)
CREATE OR REPLACE FUNCTION public.is_admin_wallet(_wallet text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_wallets
    WHERE lower(wallet_address) = lower(_wallet)
  )
$$;
REVOKE ALL ON FUNCTION public.is_admin_wallet(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin_wallet(text) TO anon, authenticated;

-- 2) admin_wallets — drop all permissive policies; only service role can touch
DROP POLICY IF EXISTS "anyone read admins" ON public.admin_wallets;
DROP POLICY IF EXISTS "anyone insert admins" ON public.admin_wallets;
DROP POLICY IF EXISTS "anyone delete admins" ON public.admin_wallets;
-- (no replacement policies → RLS denies all for anon/authenticated)

-- 3) announcements — public read only; writes locked down
DROP POLICY IF EXISTS "anyone insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "anyone update announcements" ON public.announcements;
DROP POLICY IF EXISTS "anyone delete announcements" ON public.announcements;
-- "anyone read announcements" remains (intentional public read)

-- 4) announcement_reads — drop public SELECT (leaks wallet list); INSERT stays so users can mark read
DROP POLICY IF EXISTS "anyone read reads" ON public.announcement_reads;
-- "anyone insert reads" remains

-- 5) chat_messages — drop UPDATE / DELETE from anon
DROP POLICY IF EXISTS "anyone update chat" ON public.chat_messages;
DROP POLICY IF EXISTS "anyone delete chat" ON public.chat_messages;

-- 6) chat_bot_config — drop public UPDATE
DROP POLICY IF EXISTS "anyone update bot config" ON public.chat_bot_config;

-- 7) inbox_messages — fully lock down (no per-wallet auth available)
DROP POLICY IF EXISTS "anyone read inbox" ON public.inbox_messages;
DROP POLICY IF EXISTS "anyone insert inbox" ON public.inbox_messages;
DROP POLICY IF EXISTS "anyone update inbox" ON public.inbox_messages;
DROP POLICY IF EXISTS "anyone delete inbox" ON public.inbox_messages;

-- 8) support_threads / support_messages — fully lock down
DROP POLICY IF EXISTS "anyone read threads" ON public.support_threads;
DROP POLICY IF EXISTS "anyone insert threads" ON public.support_threads;
DROP POLICY IF EXISTS "anyone update threads" ON public.support_threads;
DROP POLICY IF EXISTS "anyone delete threads" ON public.support_threads;
DROP POLICY IF EXISTS "anyone read messages" ON public.support_messages;
DROP POLICY IF EXISTS "anyone insert messages" ON public.support_messages;
