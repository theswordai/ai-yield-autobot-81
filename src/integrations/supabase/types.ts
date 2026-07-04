export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_wallets: {
        Row: {
          created_at: string
          note: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          note?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          wallet_address: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          wallet_address: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          end_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          start_at: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_at?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_at?: string | null
          title?: string
        }
        Relationships: []
      }
      blocked_wallets: {
        Row: {
          created_at: string
          note: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          note?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      chat_bot_config: {
        Row: {
          enabled: boolean
          id: number
          last_bot_post_at: string | null
          max_interval_minutes: number
          min_interval_minutes: number
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: number
          last_bot_post_at?: string | null
          max_interval_minutes?: number
          min_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: number
          last_bot_post_at?: string | null
          max_interval_minutes?: number
          min_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          wallet_address: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          wallet_address: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          wallet_address?: string
        }
        Relationships: []
      }
      inbox_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          wallet_address: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          wallet_address: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          wallet_address?: string
        }
        Relationships: []
      }
      prediction_accounts: {
        Row: {
          balance: number
          claimed_initial_balance: boolean
          created_at: string
          total_pnl: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          balance?: number
          claimed_initial_balance?: boolean
          created_at?: string
          total_pnl?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          balance?: number
          claimed_initial_balance?: boolean
          created_at?: string
          total_pnl?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      prediction_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          note: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          wallet_address: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          note?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          wallet_address: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          note?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      prediction_markets: {
        Row: {
          created_at: string
          end_date: string | null
          no_price: number | null
          outcomes: Json
          polymarket_id: string
          settled_at: string | null
          slug: string | null
          status: string
          title: string
          updated_at: string
          winning_outcome: string | null
          yes_price: number | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          no_price?: number | null
          outcomes?: Json
          polymarket_id: string
          settled_at?: string | null
          slug?: string | null
          status?: string
          title: string
          updated_at?: string
          winning_outcome?: string | null
          yes_price?: number | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          no_price?: number | null
          outcomes?: Json
          polymarket_id?: string
          settled_at?: string | null
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string
          winning_outcome?: string | null
          yes_price?: number | null
        }
        Relationships: []
      }
      prediction_orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          outcome: string
          payout: number
          pnl: number
          polymarket_id: string
          price: number
          settled_at: string | null
          shares: number
          status: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          outcome: string
          payout?: number
          pnl?: number
          polymarket_id: string
          price: number
          settled_at?: string | null
          shares: number
          status?: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          outcome?: string
          payout?: number
          pnl?: number
          polymarket_id?: string
          price?: number
          settled_at?: string | null
          shares?: number
          status?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_orders_polymarket_id_fkey"
            columns: ["polymarket_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["polymarket_id"]
          },
        ]
      }
      prediction_positions: {
        Row: {
          avg_price: number
          invested: number
          outcome: string
          polymarket_id: string
          realized_pnl: number
          shares: number
          status: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          avg_price?: number
          invested?: number
          outcome: string
          polymarket_id: string
          realized_pnl?: number
          shares?: number
          status?: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          avg_price?: number
          invested?: number
          outcome?: string
          polymarket_id?: string
          realized_pnl?: number
          shares?: number
          status?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_positions_polymarket_id_fkey"
            columns: ["polymarket_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["polymarket_id"]
          },
        ]
      }
      prediction_settlements: {
        Row: {
          created_at: string
          id: string
          polymarket_id: string
          settled_by: string
          source: string
          winning_outcome: string
        }
        Insert: {
          created_at?: string
          id?: string
          polymarket_id: string
          settled_by: string
          source?: string
          winning_outcome: string
        }
        Update: {
          created_at?: string
          id?: string
          polymarket_id?: string
          settled_by?: string
          source?: string
          winning_outcome?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_settlements_polymarket_id_fkey"
            columns: ["polymarket_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["polymarket_id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "support_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      support_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          status: string
          subject: string | null
          unread_admin: boolean
          unread_user: boolean
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: string
          subject?: string | null
          unread_admin?: boolean
          unread_user?: boolean
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          status?: string
          subject?: string | null
          unread_admin?: boolean
          unread_user?: boolean
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_read_announcement_ids: {
        Args: { _wallet: string }
        Returns: string[]
      }
      is_admin_wallet: { Args: { _wallet: string }; Returns: boolean }
      is_wallet_blocked: { Args: { _wallet: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
