import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { LOCK_ADDRESS, USDT_DECIMALS } from "@/config/contracts";
import { LockStaking_ABI } from "@/abis/LockStaking";
import { useI18n } from "@/hooks/useI18n";

interface StakingEvent {
  address: string;
  amount: string;
  lockDays: number;
  expectedYield: string;
  timestamp: number;
  isFake?: boolean;
}

const RPC_URLS = [
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed3.binance.org",
];

const LOCK_DAYS_MAP: Record<number, number> = { 0: 90, 1: 180, 2: 365 };
const APR_MAP: Record<number, number> = { 0: 50, 1: 120, 2: 280 }; // percentage

const CACHE_KEY = "staking_events_cache";
const FAKE_CHECK_KEY = "staking_last_real_event";
const ONE_HOUR = 60 * 60 * 1000;

// Calculate expected yield using daily compound interest
function calculateExpectedYield(principal: number, lockChoice: number): number {
  const lockDays = LOCK_DAYS_MAP[lockChoice] || 90;
  const apr = APR_MAP[lockChoice] || 50;
  const dailyRate = apr / 365 / 100;
  return principal * (Math.pow(1 + dailyRate, lockDays) - 1);
}

// Shorten address for display
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

// Generate random fake address
function generateFakeAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 4; i++) addr += chars[Math.floor(Math.random() * 16)];
  addr += "...";
  for (let i = 0; i < 3; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

// Generate fake staking event
function generateFakeEvent(): StakingEvent {
  const amounts = [500, 800, 1000, 1500, 2000, 3000, 5000, 8000, 10000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const lockChoice = Math.floor(Math.random() * 3);
  const lockDays = LOCK_DAYS_MAP[lockChoice];
  const expectedYield = calculateExpectedYield(amount, lockChoice);

  return {
    address: generateFakeAddress(),
    amount: amount.toLocaleString(),
    lockDays,
    expectedYield: expectedYield.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    timestamp: Date.now(),
    isFake: true,
  };
}

export function StakingTicker() {
  const { t } = useI18n();
  const [events, setEvents] = useState<StakingEvent[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        return data || [];
      }
    } catch (e) {
      console.warn("Failed to load cached staking events:", e);
    }
    return [];
  });
  const timerRef = useRef<number | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const providerRef = useRef<JsonRpcProvider | null>(null);
  const contractRef = useRef<Contract | null>(null);

  // Initialize provider and contract
  const initProvider = useCallback(async () => {
    for (const url of RPC_URLS) {
      try {
        const provider = new JsonRpcProvider(url);
        await provider.getBlockNumber();
        providerRef.current = provider;
        contractRef.current = new Contract(LOCK_ADDRESS, LockStaking_ABI, provider);
        return true;
      } catch (e) {
        console.warn(`RPC ${url} failed:`, e);
      }
    }
    return false;
  }, []);

  // Fetch historical Deposited events
  const fetchHistoricalEvents = useCallback(async () => {
    if (!contractRef.current || !providerRef.current) return;

    try {
      const currentBlock = await providerRef.current.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // ~8 hours of blocks

      const filter = contractRef.current.filters.Deposited();
      const rawEvents = await contractRef.current.queryFilter(filter, fromBlock, currentBlock);

      const newEvents: StakingEvent[] = rawEvents.map((event: any) => {
        const { user, amount, lockChoice } = event.args;
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));
        const lockDays = LOCK_DAYS_MAP[Number(lockChoice)] || 90;
        const expectedYield = calculateExpectedYield(amountNum, Number(lockChoice));

        return {
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          lockDays,
          expectedYield: expectedYield.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          timestamp: Date.now(),
          isFake: false,
        };
      });

      if (newEvents.length > 0) {
        setEvents(prev => {
          const combined = [...newEvents.reverse(), ...prev.filter(e => e.isFake)];
          const limited = combined.slice(0, 20);
          
          // Cache and update last real event time
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: limited }));
            localStorage.setItem(FAKE_CHECK_KEY, Date.now().toString());
          } catch (e) {
            console.warn("Failed to cache staking events:", e);
          }
          
          return limited;
        });
      }
    } catch (e) {
      console.warn("Failed to fetch historical events:", e);
    }
  }, []);

  // Check if we need to generate fake data
  const checkAndGenerateFake = useCallback(() => {
    try {
      const lastRealStr = localStorage.getItem(FAKE_CHECK_KEY);
      const lastReal = lastRealStr ? parseInt(lastRealStr) : 0;
      const now = Date.now();

      if (now - lastReal > ONE_HOUR) {
        const fakeEvent = generateFakeEvent();
        setEvents(prev => {
          const updated = [fakeEvent, ...prev].slice(0, 20);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated }));
          } catch (e) {
            console.warn("Failed to cache fake event:", e);
          }
          return updated;
        });
        // Update the fake check time so we don't spam
        localStorage.setItem(FAKE_CHECK_KEY, now.toString());
      }
    } catch (e) {
      console.warn("Failed to check/generate fake event:", e);
    }
  }, []);

  // Listen for new Deposited events
  const subscribeToEvents = useCallback(() => {
    if (!contractRef.current) return;

    try {
      contractRef.current.on("Deposited", (user, posId, amount, fee, lockChoice, aprBps) => {
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));
        const lockDays = LOCK_DAYS_MAP[Number(lockChoice)] || 90;
        const expectedYield = calculateExpectedYield(amountNum, Number(lockChoice));

        const newEvent: StakingEvent = {
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          lockDays,
          expectedYield: expectedYield.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          timestamp: Date.now(),
          isFake: false,
        };

        setEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 20);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated }));
            localStorage.setItem(FAKE_CHECK_KEY, Date.now().toString());
          } catch (e) {
            console.warn("Failed to cache new event:", e);
          }
          return updated;
        });
      });
    } catch (e) {
      console.warn("Failed to subscribe to events:", e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const success = await initProvider();
      if (success) {
        fetchHistoricalEvents();
        subscribeToEvents();
      }
    };

    init();

    // Check for fake data every 10 minutes
    fakeTimerRef.current = window.setInterval(checkAndGenerateFake, 10 * 60 * 1000);
    // Initial check
    checkAndGenerateFake();

    // Refresh events every 60 seconds
    timerRef.current = window.setInterval(fetchHistoricalEvents, 60000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (fakeTimerRef.current) window.clearInterval(fakeTimerRef.current);
      if (contractRef.current) {
        contractRef.current.removeAllListeners("Deposited");
      }
    };
  }, [initProvider, fetchHistoricalEvents, subscribeToEvents, checkAndGenerateFake]);

  // If no events, generate some initial fake ones
  useEffect(() => {
    if (events.length === 0) {
      const initialFakes = Array.from({ length: 5 }, () => generateFakeEvent());
      setEvents(initialFakes);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: initialFakes }));
        localStorage.setItem(FAKE_CHECK_KEY, Date.now().toString());
      } catch (e) {
        console.warn("Failed to cache initial fake events:", e);
      }
    }
  }, [events.length]);

  const doubled = useMemo(() => (events.length > 0 ? [...events, ...events] : []), [events]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur animate-fade-in mt-2">
      <style>{`
        @keyframes staking-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 bg-card/80 pr-2">
        <span className="w-2 h-2 rounded-full bg-accent pulse" aria-hidden />
        <span className="text-xs text-accent font-medium">{t("stakingTicker.live")}</span>
      </div>
      <div
        className="flex gap-6 whitespace-nowrap py-3 pl-20"
        style={{ width: "200%", animation: "staking-marquee 40s linear infinite" }}
        role="list"
        aria-label={t("stakingTicker.ariaLabel")}
      >
        {doubled.map((event, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 text-sm" role="listitem">
            <span className="text-accent">🔒</span>
            <span className="text-foreground font-mono">{event.address}</span>
            <span className="text-muted-foreground">{t("stakingTicker.invested")}</span>
            <span className="text-primary font-semibold">{event.amount} USDT</span>
            <span className="text-muted-foreground">{t("stakingTicker.lockedFor")}</span>
            <span className="text-accent font-semibold">{event.lockDays}{t("stakingTicker.days")}</span>
            <span className="text-muted-foreground">{t("stakingTicker.expectedYield")}</span>
            <span className="text-primary font-semibold">{event.expectedYield} USDT</span>
          </div>
        ))}
      </div>
    </div>
  );
}
