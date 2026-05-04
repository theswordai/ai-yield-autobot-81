import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
}

export interface InboxMessage {
  id: string;
  wallet_address: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SupportThread {
  id: string;
  wallet_address: string;
  subject: string | null;
  status: string;
  unread_user: boolean;
  unread_admin: boolean;
  last_message_at: string;
  created_at: string;
}

export function useMessageCenter() {
  const { account } = useWeb3();
  const wallet = account?.toLowerCase() || null;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [thread, setThread] = useState<SupportThread | null>(null);

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    const now = Date.now();
    const filtered = (data || []).filter((a) => {
      if (a.start_at && new Date(a.start_at).getTime() > now) return false;
      if (a.end_at && new Date(a.end_at).getTime() < now) return false;
      return true;
    });
    setAnnouncements(filtered);
  }, []);

  const loadReads = useCallback(async () => {
    if (!wallet) { setReadIds(new Set()); return; }
    const { data } = await supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("wallet_address", wallet);
    setReadIds(new Set((data || []).map((r) => r.announcement_id)));
  }, [wallet]);

  const loadInbox = useCallback(async () => {
    if (!wallet) { setInbox([]); return; }
    const { data } = await supabase
      .from("inbox_messages")
      .select("*")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false });
    setInbox(data || []);
  }, [wallet]);

  const loadThread = useCallback(async () => {
    if (!wallet) { setThread(null); return; }
    const { data } = await supabase
      .from("support_threads")
      .select("*")
      .eq("wallet_address", wallet)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setThread(data || null);
  }, [wallet]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);
  useEffect(() => { loadReads(); }, [loadReads]);
  useEffect(() => { loadInbox(); }, [loadInbox]);
  useEffect(() => { loadThread(); }, [loadThread]);

  // Realtime
  useEffect(() => {
    if (!wallet) return;
    const ch = supabase
      .channel(`mc-${wallet}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inbox_messages", filter: `wallet_address=eq.${wallet}` }, loadInbox)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_threads", filter: `wallet_address=eq.${wallet}` }, loadThread)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => { loadAnnouncements(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [wallet, loadInbox, loadThread, loadAnnouncements]);

  const markAnnouncementRead = useCallback(async (id: string) => {
    if (!wallet) return;
    await supabase.from("announcement_reads").upsert({ wallet_address: wallet, announcement_id: id }, { onConflict: "wallet_address,announcement_id" });
    setReadIds((prev) => new Set(prev).add(id));
  }, [wallet]);

  const markInboxRead = useCallback(async (id: string) => {
    await supabase.from("inbox_messages").update({ is_read: true }).eq("id", id);
    setInbox((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  }, []);

  const markAllInboxRead = useCallback(async () => {
    if (!wallet) return;
    await supabase.from("inbox_messages").update({ is_read: true }).eq("wallet_address", wallet).eq("is_read", false);
    setInbox((prev) => prev.map((m) => ({ ...m, is_read: true })));
  }, [wallet]);

  const unreadAnnouncements = announcements.filter((a) => !readIds.has(a.id));
  const unreadInboxCount = inbox.filter((m) => !m.is_read).length;
  const unreadSupportCount = thread?.unread_user ? 1 : 0;
  const totalUnread = unreadAnnouncements.length + unreadInboxCount + unreadSupportCount;

  return {
    wallet,
    announcements,
    unreadAnnouncements,
    inbox,
    unreadInboxCount,
    thread,
    unreadSupportCount,
    totalUnread,
    markAnnouncementRead,
    markInboxRead,
    markAllInboxRead,
    refresh: () => { loadAnnouncements(); loadReads(); loadInbox(); loadThread(); },
  };
}
