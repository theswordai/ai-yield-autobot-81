import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";
import { useStakingData } from "@/hooks/useStakingData";

const ZERO = "0x0000000000000000000000000000000000000000";
const PAGE_SIZE = 200;
const SEND_COOLDOWN_MS = 3000;
const LAST_SEEN_KEY = "chatroom:lastSeenAt";

export interface ChatMessage {
  id: string;
  wallet_address: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

export function useChatRoom(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const { account } = useWeb3();
  const { data: staking } = useStakingData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSentRef = useRef<number>(0);

  const canChat = useMemo(() => {
    if (!account) return false;
    if (!staking) return false;
    const hasInviter = !!staking.referralStats?.inviterAddress
      && staking.referralStats.inviterAddress.toLowerCase() !== ZERO;
    const hasStake = (staking.activePositions?.length || 0) > 0;
    return hasInviter || hasStake;
  }, [account, staking]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    const list = ((data || []) as ChatMessage[]).reverse();
    setMessages(list);
    setLoading(false);
  }, []);

  useEffect(() => { if (enabled) load(); }, [enabled, load]);

  // Realtime
  useEffect(() => {
    if (!enabled) return;
    const ch = supabase
      .channel("chat_messages_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const m = payload.new as ChatMessage;
        if (m.is_deleted) return;
        setMessages((prev) => [...prev, m].slice(-PAGE_SIZE));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, (payload) => {
        const m = payload.new as ChatMessage;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)).filter((x) => !x.is_deleted));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [enabled]);

  // Unread tracking based on lastSeen timestamp in localStorage
  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
    const c = messages.filter((m) => new Date(m.created_at).getTime() > lastSeen).length;
    setUnreadCount(c);
  }, [messages]);

  const markAllRead = useCallback(() => {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
    setUnreadCount(0);
  }, []);

  const send = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || !account || !canChat) return { ok: false, reason: "not-eligible" as const };
    if (text.length > 500) return { ok: false, reason: "too-long" as const };
    const now = Date.now();
    if (now - lastSentRef.current < SEND_COOLDOWN_MS) return { ok: false, reason: "cooldown" as const };
    lastSentRef.current = now;
    const { error } = await supabase
      .from("chat_messages")
      .insert({ wallet_address: account.toLowerCase(), content: text });
    if (error) return { ok: false, reason: "error" as const };
    return { ok: true as const };
  }, [account, canChat]);

  const softDelete = useCallback(async (id: string) => {
    await supabase.from("chat_messages").update({ is_deleted: true }).eq("id", id);
  }, []);

  return { messages, loading, canChat, account, send, softDelete, unreadCount, markAllRead };
}
