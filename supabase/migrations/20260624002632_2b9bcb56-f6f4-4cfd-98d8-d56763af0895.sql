
CREATE TABLE public.blocked_wallets (
  wallet_address text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blocked_wallets TO anon, authenticated;
GRANT ALL ON public.blocked_wallets TO service_role;

ALTER TABLE public.blocked_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read blocked wallets"
ON public.blocked_wallets FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.blocked_wallets (wallet_address, note)
VALUES ('0x82e9e55e42bcf3bca2341779dde08bacfc72270f', 'initial')
ON CONFLICT (wallet_address) DO NOTHING;
