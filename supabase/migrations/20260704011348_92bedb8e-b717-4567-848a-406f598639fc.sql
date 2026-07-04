
-- Drop previous prediction schema (no data yet)
DROP VIEW IF EXISTS public.prediction_positions CASCADE;
DROP TABLE IF EXISTS public.prediction_settlements CASCADE;
DROP TABLE IF EXISTS public.prediction_ledger CASCADE;
DROP TABLE IF EXISTS public.prediction_orders CASCADE;
DROP TABLE IF EXISTS public.prediction_markets CASCADE;
DROP TABLE IF EXISTS public.prediction_accounts CASCADE;

-- prediction_accounts
CREATE TABLE public.prediction_accounts (
  wallet_address text PRIMARY KEY,
  balance numeric NOT NULL DEFAULT 0,
  total_pnl numeric NOT NULL DEFAULT 0,
  claimed_initial_balance boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_accounts_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
GRANT ALL ON public.prediction_accounts TO service_role;
ALTER TABLE public.prediction_accounts ENABLE ROW LEVEL SECURITY;

-- prediction_markets
CREATE TABLE public.prediction_markets (
  polymarket_id text PRIMARY KEY,
  title text NOT NULL,
  slug text,
  outcomes jsonb NOT NULL DEFAULT '["Yes","No"]'::jsonb,
  end_date timestamptz,
  yes_price numeric,
  no_price numeric,
  status text NOT NULL DEFAULT 'open',
  winning_outcome text,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prediction_markets_status_valid CHECK (status IN ('open','settled','closed','cancelled'))
);
GRANT SELECT ON public.prediction_markets TO anon, authenticated;
GRANT ALL ON public.prediction_markets TO service_role;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prediction_markets public read"
  ON public.prediction_markets FOR SELECT USING (true);

-- prediction_orders
CREATE TABLE public.prediction_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  polymarket_id text NOT NULL REFERENCES public.prediction_markets(polymarket_id) ON DELETE CASCADE,
  outcome text NOT NULL,
  amount numeric NOT NULL,
  price numeric NOT NULL,
  shares numeric NOT NULL,
  status text NOT NULL DEFAULT 'open',
  payout numeric NOT NULL DEFAULT 0,
  pnl numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz,
  CONSTRAINT prediction_orders_amount_pos CHECK (amount > 0),
  CONSTRAINT prediction_orders_shares_pos CHECK (shares > 0),
  CONSTRAINT prediction_orders_price_range CHECK (price > 0 AND price <= 1),
  CONSTRAINT prediction_orders_status_valid CHECK (status IN ('open','won','lost','refunded')),
  CONSTRAINT prediction_orders_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
CREATE INDEX prediction_orders_wallet_idx ON public.prediction_orders(wallet_address);
CREATE INDEX prediction_orders_market_idx ON public.prediction_orders(polymarket_id);
CREATE INDEX prediction_orders_status_idx ON public.prediction_orders(status);
GRANT ALL ON public.prediction_orders TO service_role;
ALTER TABLE public.prediction_orders ENABLE ROW LEVEL SECURITY;

-- prediction_positions (table, not view)
CREATE TABLE public.prediction_positions (
  wallet_address text NOT NULL,
  polymarket_id text NOT NULL REFERENCES public.prediction_markets(polymarket_id) ON DELETE CASCADE,
  outcome text NOT NULL,
  shares numeric NOT NULL DEFAULT 0,
  invested numeric NOT NULL DEFAULT 0,
  avg_price numeric NOT NULL DEFAULT 0,
  realized_pnl numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (wallet_address, polymarket_id, outcome),
  CONSTRAINT prediction_positions_status_valid CHECK (status IN ('open','won','lost','refunded')),
  CONSTRAINT prediction_positions_wallet_lower CHECK (wallet_address = lower(wallet_address))
);
CREATE INDEX prediction_positions_wallet_idx ON public.prediction_positions(wallet_address);
CREATE INDEX prediction_positions_market_idx ON public.prediction_positions(polymarket_id);
GRANT ALL ON public.prediction_positions TO service_role;
ALTER TABLE public.prediction_positions ENABLE ROW LEVEL SECURITY;

-- prediction_ledger
CREATE TABLE public.prediction_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  reference_type text,
  reference_id text,
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
  polymarket_id text NOT NULL REFERENCES public.prediction_markets(polymarket_id) ON DELETE CASCADE,
  winning_outcome text NOT NULL,
  settled_by text NOT NULL,
  source text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prediction_settlements_market_idx ON public.prediction_settlements(polymarket_id);
GRANT SELECT ON public.prediction_settlements TO anon, authenticated;
GRANT ALL ON public.prediction_settlements TO service_role;
ALTER TABLE public.prediction_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prediction_settlements public read"
  ON public.prediction_settlements FOR SELECT USING (true);

-- updated_at triggers (set_updated_at already exists from prior migration)
CREATE TRIGGER prediction_accounts_set_updated_at
BEFORE UPDATE ON public.prediction_accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER prediction_markets_set_updated_at
BEFORE UPDATE ON public.prediction_markets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER prediction_positions_set_updated_at
BEFORE UPDATE ON public.prediction_positions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
