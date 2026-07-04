
-- prediction_accounts
CREATE TABLE public.prediction_accounts (
  wallet_address text PRIMARY KEY,
  balance numeric NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  total_payout numeric NOT NULL DEFAULT 0,
  realized_pnl numeric NOT NULL DEFAULT 0,
  claimed_initial_balance_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_accounts_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
GRANT ALL ON public.prediction_accounts TO service_role;
ALTER TABLE public.prediction_accounts ENABLE ROW LEVEL SECURITY;
-- no client policies: all access via edge function

-- prediction_markets
CREATE TABLE public.prediction_markets (
  market_id text PRIMARY KEY,
  title text NOT NULL,
  slug text,
  description text,
  category text,
  outcomes jsonb NOT NULL DEFAULT '["Yes","No"]'::jsonb,
  end_date timestamptz,
  yes_price numeric,
  no_price numeric,
  volume numeric,
  volume_24hr numeric,
  liquidity numeric,
  image text,
  icon text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_markets_status_valid CHECK (status IN ('open','settled','closed','cancelled'))
);
GRANT SELECT ON public.prediction_markets TO anon, authenticated;
GRANT ALL ON public.prediction_markets TO service_role;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prediction_markets public read" ON public.prediction_markets FOR SELECT USING (true);

-- prediction_orders
CREATE TABLE public.prediction_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  market_id text NOT NULL REFERENCES public.prediction_markets(market_id) ON DELETE CASCADE,
  outcome_index integer NOT NULL,
  outcome_label text NOT NULL,
  amount numeric NOT NULL,
  price numeric NOT NULL,
  shares numeric NOT NULL,
  status text NOT NULL DEFAULT 'open',
  settled_at timestamptz,
  payout numeric NOT NULL DEFAULT 0,
  pnl numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_orders_amount_pos CHECK (amount > 0),
  CONSTRAINT prediction_orders_shares_pos CHECK (shares > 0),
  CONSTRAINT prediction_orders_price_range CHECK (price > 0 AND price <= 1),
  CONSTRAINT prediction_orders_status_valid CHECK (status IN ('open','won','lost','refunded')),
  CONSTRAINT prediction_orders_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
CREATE INDEX prediction_orders_wallet_idx ON public.prediction_orders(wallet_address);
CREATE INDEX prediction_orders_market_idx ON public.prediction_orders(market_id);
CREATE INDEX prediction_orders_status_idx ON public.prediction_orders(status);
GRANT ALL ON public.prediction_orders TO service_role;
ALTER TABLE public.prediction_orders ENABLE ROW LEVEL SECURITY;
-- no client policies

-- prediction_ledger
CREATE TABLE public.prediction_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  market_id text,
  order_id uuid,
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_ledger_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
CREATE INDEX prediction_ledger_wallet_idx ON public.prediction_ledger(wallet_address, created_at DESC);
GRANT ALL ON public.prediction_ledger TO service_role;
ALTER TABLE public.prediction_ledger ENABLE ROW LEVEL SECURITY;

-- prediction_settlements
CREATE TABLE public.prediction_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id text NOT NULL REFERENCES public.prediction_markets(market_id) ON DELETE CASCADE,
  winning_outcome_index integer NOT NULL,
  winning_outcome_label text NOT NULL,
  source text NOT NULL DEFAULT 'admin',
  settled_by_wallet text,
  settled_at timestamptz NOT NULL DEFAULT now(),
  note text
);
CREATE INDEX prediction_settlements_market_idx ON public.prediction_settlements(market_id);
GRANT SELECT ON public.prediction_settlements TO anon, authenticated;
GRANT ALL ON public.prediction_settlements TO service_role;
ALTER TABLE public.prediction_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prediction_settlements public read" ON public.prediction_settlements FOR SELECT USING (true);

-- Aggregated open positions view
CREATE VIEW public.prediction_positions AS
SELECT
  wallet_address,
  market_id,
  outcome_index,
  outcome_label,
  COUNT(*)::int AS order_count,
  SUM(amount) AS total_amount,
  SUM(shares) AS total_shares,
  CASE WHEN SUM(shares) > 0 THEN SUM(amount) / SUM(shares) ELSE 0 END AS avg_price
FROM public.prediction_orders
WHERE status = 'open'
GROUP BY wallet_address, market_id, outcome_index, outcome_label;
GRANT SELECT ON public.prediction_positions TO anon, authenticated, service_role;

-- updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER prediction_accounts_set_updated_at
BEFORE UPDATE ON public.prediction_accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER prediction_markets_set_updated_at
BEFORE UPDATE ON public.prediction_markets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
