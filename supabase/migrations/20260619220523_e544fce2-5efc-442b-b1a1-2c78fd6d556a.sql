
-- 1) admin_wallets: remove anon read. Client uses has_role-style RPC instead.
DROP POLICY IF EXISTS "anyone can read admin_wallets" ON public.admin_wallets;

-- 2) announcement_reads: remove anon read; expose only the caller's own read ids via SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "anyone read reads" ON public.announcement_reads;

CREATE OR REPLACE FUNCTION public.get_read_announcement_ids(_wallet text)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT announcement_id
  FROM public.announcement_reads
  WHERE lower(wallet_address) = lower(_wallet)
$$;

REVOKE ALL ON FUNCTION public.get_read_announcement_ids(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_read_announcement_ids(text) TO anon, authenticated;

-- 3) announcement-images bucket: remove public INSERT. Admin uploader already uses data-URLs, not storage.
DROP POLICY IF EXISTS "anyone upload announcement images" ON storage.objects;
