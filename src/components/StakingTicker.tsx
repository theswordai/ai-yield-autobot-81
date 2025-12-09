import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { LOCK_ADDRESS, USDT_DECIMALS } from "@/config/contracts";
import { LockStaking_ABI } from "@/abis/LockStaking";
import { useI18n } from "@/hooks/useI18n";

interface StakingEvent {
  type: 'deposit' | 'claim';
  address: string;
  amount: string;
  lockDays?: number;
  timestamp: number;
  blockNumber: number;
}

const RPC_URLS = [
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed3.binance.org",
];

const LOCK_DAYS_MAP: Record<number, number> = { 0: 90, 1: 180, 2: 365 };

const CACHE_KEY = "staking_events_cache_v2";

// Shorten address for display: 0x...123
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `0x...${address.slice(-3)}`;
}

export function StakingTicker() {
  const { t } = useI18n();
  const [events, setEvents] = useState<StakingEvent[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        if (data && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Failed to load cached staking events:", e);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<number | null>(null);
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

  // Fetch historical Deposited and Claimed events with batched queries
  const fetchHistoricalEvents = useCallback(async () => {
    if (!contractRef.current || !providerRef.current) return;

    const BATCH_SIZE = 5000; // BSC RPC limit per query
    const MAX_EVENTS = 100;  // Stop once we have enough events
    const MAX_BLOCKS = 1728000; // 2 months max

    try {
      const currentBlock = await providerRef.current.getBlockNumber();
      console.log("StakingTicker: Current block:", currentBlock);
      
      const minBlock = Math.max(0, currentBlock - MAX_BLOCKS);
      const depositFilter = contractRef.current.filters.Deposited();
      const claimFilter = contractRef.current.filters.Claimed();
      
      let allDepositEvents: any[] = [];
      let allClaimEvents: any[] = [];
      let endBlock = currentBlock;
      
      // Batch query from newest to oldest
      while (endBlock > minBlock && (allDepositEvents.length + allClaimEvents.length) < MAX_EVENTS) {
        const startBlock = Math.max(minBlock, endBlock - BATCH_SIZE);
        
        console.log(`StakingTicker: Querying blocks ${startBlock} to ${endBlock}...`);
        
        try {
          const [deposits, claims] = await Promise.all([
            contractRef.current!.queryFilter(depositFilter, startBlock, endBlock),
            contractRef.current!.queryFilter(claimFilter, startBlock, endBlock),
          ]);
          
          allDepositEvents.push(...deposits);
          allClaimEvents.push(...claims);
          
          console.log(`StakingTicker: Batch found ${deposits.length} deposits, ${claims.length} claims`);
          
          // If we found enough events, stop early
          if (allDepositEvents.length + allClaimEvents.length >= MAX_EVENTS) {
            console.log("StakingTicker: Collected enough events, stopping early");
            break;
          }
        } catch (batchError) {
          console.warn(`StakingTicker: Batch ${startBlock}-${endBlock} failed:`, batchError);
        }
        
        endBlock = startBlock - 1;
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
      
      console.log(`StakingTicker: Total - ${allDepositEvents.length} deposits, ${allClaimEvents.length} claims`);

      // Process deposit events
      const processedDeposits: StakingEvent[] = allDepositEvents.map((event: any) => {
        const { user, amount, lockChoice } = event.args;
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));
        const lockDays = LOCK_DAYS_MAP[Number(lockChoice)] || 90;

        return {
          type: 'deposit' as const,
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          lockDays,
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
        };
      });

      // Process claim events
      const processedClaims: StakingEvent[] = allClaimEvents.map((event: any) => {
        const { user, amount } = event.args;
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));

        return {
          type: 'claim' as const,
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
        };
      });

      // Combine and sort by block number (newest first)
      const allEvents = [...processedDeposits, ...processedClaims]
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 100);

      if (allEvents.length > 0) {
        setEvents(allEvents);
        
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: allEvents }));
        } catch (e) {
          console.warn("Failed to cache staking events:", e);
        }
      } else {
        console.warn("StakingTicker: No events found in range");
      }
      setIsLoading(false);
    } catch (e) {
      console.warn("Failed to fetch historical events:", e);
      setIsLoading(false);
    }
  }, []);

  // Listen for new Deposited and Claimed events
  const subscribeToEvents = useCallback(() => {
    if (!contractRef.current) return;

    try {
      // Subscribe to Deposited events
      contractRef.current.on("Deposited", (user, posId, amount, fee, lockChoice, aprBps) => {
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));
        const lockDays = LOCK_DAYS_MAP[Number(lockChoice)] || 90;

        const newEvent: StakingEvent = {
          type: 'deposit',
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          lockDays,
          timestamp: Date.now(),
          blockNumber: Date.now(), // Use timestamp as pseudo block number for real-time
        };

        setEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 100);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated }));
          } catch (e) {
            console.warn("Failed to cache new event:", e);
          }
          return updated;
        });
      });

      // Subscribe to Claimed events
      contractRef.current.on("Claimed", (user, posId, amount) => {
        const amountNum = parseFloat(formatUnits(amount, USDT_DECIMALS));

        const newEvent: StakingEvent = {
          type: 'claim',
          address: shortenAddress(user),
          amount: amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          timestamp: Date.now(),
          blockNumber: Date.now(),
        };

        setEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 100);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated }));
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

    // Refresh events every 60 seconds
    timerRef.current = window.setInterval(fetchHistoricalEvents, 60000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (contractRef.current) {
        contractRef.current.removeAllListeners("Deposited");
        contractRef.current.removeAllListeners("Claimed");
      }
    };
  }, [initProvider, fetchHistoricalEvents, subscribeToEvents]);

  // Duplicate for seamless loop
  const doubled = useMemo(() => (events.length > 0 ? [...events, ...events] : []), [events]);

  // Show loading state with placeholder
  if (events.length === 0) {
    if (isLoading) {
      return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur animate-fade-in mt-2">
          <div className="flex items-center gap-2 py-3 px-4">
            <span className="w-2 h-2 rounded-full bg-accent pulse" aria-hidden />
            <span className="text-xs text-accent font-medium">{t("stakingTicker.live")}</span>
            <span className="text-sm text-muted-foreground ml-2">加载链上数据中...</span>
          </div>
        </div>
      );
    }
    return null;
  }

  // Adjust animation duration based on event count
  const animationDuration = Math.max(40, events.length * 0.8);

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
        style={{ width: "200%", animation: `staking-marquee ${animationDuration}s linear infinite` }}
        role="list"
        aria-label={t("stakingTicker.ariaLabel")}
      >
        {doubled.map((event, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 text-sm" role="listitem">
            {event.type === 'deposit' ? (
              <>
                <span className="text-accent">🔒</span>
                <span className="text-foreground font-mono">{event.address}地址</span>
                <span className="text-muted-foreground">投资</span>
                <span className="text-primary font-semibold">{event.amount} USDT</span>
              </>
            ) : (
              <>
                <span className="text-green-400">💰</span>
                <span className="text-foreground font-mono">{event.address}地址</span>
                <span className="text-muted-foreground">提取收益</span>
                <span className="text-green-400 font-semibold">{event.amount} USDT</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
