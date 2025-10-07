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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      document_history: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          expiry_date: string
          id: string
          issuing_authority: string | null
          name: string
          notes: string | null
          renewal_period_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expiry_date: string
          id?: string
          issuing_authority?: string | null
          name: string
          notes?: string | null
          renewal_period_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expiry_date?: string
          id?: string
          issuing_authority?: string | null
          name?: string
          notes?: string | null
          renewal_period_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string | null
          display_name: string | null
          email_notifications_enabled: boolean | null
          expiry_reminders_enabled: boolean | null
          id: string
          push_notifications_enabled: boolean | null
          renewal_reminders_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest_enabled: boolean | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications_enabled?: boolean | null
          expiry_reminders_enabled?: boolean | null
          id?: string
          push_notifications_enabled?: boolean | null
          renewal_reminders_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest_enabled?: boolean | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications_enabled?: boolean | null
          expiry_reminders_enabled?: boolean | null
          id?: string
          push_notifications_enabled?: boolean | null
          renewal_reminders_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest_enabled?: boolean | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          is_sent: boolean | null
          reminder_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          is_sent?: boolean | null
          reminder_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          is_sent?: boolean | null
          reminder_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
