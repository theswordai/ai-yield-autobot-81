CREATE POLICY "anyone can read admin_wallets" ON public.admin_wallets FOR SELECT USING (true);
GRANT SELECT ON public.admin_wallets TO anon, authenticated;