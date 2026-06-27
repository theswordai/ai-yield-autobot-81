
DROP POLICY IF EXISTS "anyone read blocked wallets" ON public.blocked_wallets;

CREATE POLICY "admins read blocked wallets"
ON public.blocked_wallets
FOR SELECT
TO anon, authenticated
USING (public.is_admin_wallet(lower(coalesce(current_setting('request.jwt.claims', true), '')))
       OR false);

-- Above policy effectively denies anon/auth (we don't have wallet in JWT). Admin reads will go through service role via edge function. Simpler: just drop and rely on service role.
DROP POLICY IF EXISTS "admins read blocked wallets" ON public.blocked_wallets;

-- No SELECT policy => no anon/authenticated reads. service_role bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_wallet_blocked(_wallet text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_wallets
    WHERE lower(wallet_address) = lower(_wallet)
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_wallet_blocked(text) TO anon, authenticated;
