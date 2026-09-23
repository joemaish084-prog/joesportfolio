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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: boolean
          passcode_hash: string
        }
        Insert: {
          id?: boolean
          passcode_hash: string
        }
        Update: {
          id?: boolean
          passcode_hash?: string
        }
        Relationships: []
      }
      agency_leads: {
        Row: {
          budget_range: string | null
          business_name: string | null
          created_at: string
          email: string
          goals: string | null
          id: string
          name: string
          phone: string | null
          service_interest: string | null
          source: string | null
          status: string
        }
        Insert: {
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          goals?: string | null
          id?: string
          name: string
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: string
        }
        Update: {
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          goals?: string | null
          id?: string
          name?: string
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          meta_description: string
          read_time: number
          title: string
          topic: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meta_description: string
          read_time?: number
          title: string
          topic: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta_description?: string
          read_time?: number
          title?: string
          topic?: string
        }
        Relationships: []
      }
      chat_leads: {
        Row: {
          budget_range: string | null
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          need: string | null
          qualified: boolean | null
          source: string | null
          start_timeframe: string | null
          status: string
          step: string
          updated_at: string
          what_they_sell: string | null
          whatsapp: string | null
        }
        Insert: {
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          need?: string | null
          qualified?: boolean | null
          source?: string | null
          start_timeframe?: string | null
          status?: string
          step?: string
          updated_at?: string
          what_they_sell?: string | null
          whatsapp?: string | null
        }
        Update: {
          budget_range?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          need?: string | null
          qualified?: boolean | null
          source?: string | null
          start_timeframe?: string | null
          status?: string
          step?: string
          updated_at?: string
          what_they_sell?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          source: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          source?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      pulses: {
        Row: {
          created_at: string
          duration_ms: number | null
          element_selector: string | null
          element_text: string | null
          event_type: string
          id: number
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          element_selector?: string | null
          element_text?: string | null
          event_type: string
          id?: never
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          element_selector?: string | null
          element_text?: string | null
          event_type?: string
          id?: never
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pulses_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          browser: string | null
          device_id: string | null
          device_type: string | null
          first_seen: string
          id: string
          ip_hash: string
          is_bot: boolean
          last_seen: string
          os: string | null
          user_agent: string | null
          visit_count: number
        }
        Insert: {
          browser?: string | null
          device_id?: string | null
          device_type?: string | null
          first_seen?: string
          id?: string
          ip_hash: string
          is_bot?: boolean
          last_seen?: string
          os?: string | null
          user_agent?: string | null
          visit_count?: number
        }
        Update: {
          browser?: string | null
          device_id?: string | null
          device_type?: string | null
          first_seen?: string
          id?: string
          ip_hash?: string
          is_bot?: boolean
          last_seen?: string
          os?: string | null
          user_agent?: string | null
          visit_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_analytics: { Args: { p_days?: number }; Returns: Json }
      touch_visitor: { Args: { p_visitor_id: string }; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
