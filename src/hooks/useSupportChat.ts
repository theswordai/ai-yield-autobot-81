import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender: "user" | "admin";
  content: string;
  created_at: string;
}

/**
 * Manages a single support thread for a given wallet (user side) or a given threadId (admin side).
 * If wallet is provided and no thread exists, sending the first message will create one.
 */
export function useSupportChat(opts: { wallet?: string | null; threadId?: string | null; side: "user" | "admin" }) {
  const { wallet, threadId: initialThreadId, side } = opts;
  const [threadId, setThreadId] = useState<string | null>(initialThreadId || null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Resolve thread for user side
  useEffect(() => {
    if (side !== "user" || !wallet) return;
    (async () => {
      const { data } = await supabase
        .from("support_threads")
        .select("id")
        .eq("wallet_address", wallet)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setThreadId(data.id);
    })();
  }, [wallet, side]);

  // Sync external threadId changes (admin side)
  useEffect(() => {
    if (initialThreadId !== undefined) setThreadId(initialThreadId);
  }, [initialThreadId]);

  const loadMessages = useCallback(async () => {
    if (!threadId) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setMessages((data || []) as SupportMessage[]);
    setLoading(false);

    // Mark unread on this side as read
    const patch = side === "user" ? { unread_user: false } : { unread_admin: false };
    await supabase.from("support_threads").update(patch).eq("id", threadId);
  }, [threadId, side]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Realtime
  useEffect(() => {
    if (!threadId) return;
    const ch = supabase
      .channel(`thread-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `thread_id=eq.${threadId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as SupportMessage]);
        const patch = side === "user" ? { unread_user: false } : { unread_admin: false };
        supabase.from("support_threads").update(patch).eq("id", threadId);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [threadId, side]);

  const send = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text) return;
    let tid = threadId;
    let isNewThread = false;
    if (!tid) {
      if (side !== "user" || !wallet) return;
      const { data } = await supabase
        .from("support_threads")
        .insert({ wallet_address: wallet, status: "open", last_message_at: new Date().toISOString(), unread_admin: true })
        .select("id")
        .single();
      tid = data?.id || null;
      if (tid) {
        setThreadId(tid);
        isNewThread = true;
      }
    }
    if (!tid) return;
    await supabase.from("support_messages").insert({ thread_id: tid, sender: side, content: text });
    const patch: any = {
      last_message_at: new Date().toISOString(),
      ...(side === "user" ? { unread_admin: true, unread_user: false } : { unread_user: true, unread_admin: false }),
    };
    await supabase.from("support_threads").update(patch).eq("id", tid);

    // Auto welcome reply on the very first user message of a brand-new thread
    if (isNewThread && side === "user") {
      await supabase.from("support_messages").insert({
        thread_id: tid,
        sender: "admin",
        content: AUTO_WELCOME_MESSAGE,
      });
      await supabase.from("support_threads").update({
        last_message_at: new Date().toISOString(),
        unread_admin: true,
      }).eq("id", tid);
    }
  }, [threadId, side, wallet]);

  return { threadId, messages, loading, send };
}
