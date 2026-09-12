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
      bookings: {
        Row: {
          build: string
          created_at: string
          id: string
          service: string | null
          student_email: string
          vendor_id: string
        }
        Insert: {
          build?: string
          created_at?: string
          id?: string
          service?: string | null
          student_email: string
          vendor_id: string
        }
        Update: {
          build?: string
          created_at?: string
          id?: string
          service?: string | null
          student_email?: string
          vendor_id?: string
        }
        Relationships: []
      }
      campus_event_feeds: {
        Row: {
          active: boolean
          created_at: string
          domain: string
          feed_type: string
          feed_url: string
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          domain: string
          feed_type?: string
          feed_url: string
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          domain?: string
          feed_type?: string
          feed_url?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_event_feeds_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["domain"]
          },
        ]
      }
      campuses: {
        Row: {
          accent_color: string
          created_at: string
          display_name: string
          domain: string
          id: string
          mascot: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          display_name: string
          domain: string
          id?: string
          mascot?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          display_name?: string
          domain?: string
          id?: string
          mascot?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          admin_note: string | null
          build: string
          campus: string | null
          created_at: string
          details: string | null
          id: string
          kind: string
          reason: string
          reporter_email: string | null
          resolved_at: string | null
          status: string
          target_id: string
          target_name: string | null
        }
        Insert: {
          admin_note?: string | null
          build?: string
          campus?: string | null
          created_at?: string
          details?: string | null
          id?: string
          kind: string
          reason: string
          reporter_email?: string | null
          resolved_at?: string | null
          status?: string
          target_id: string
          target_name?: string | null
        }
        Update: {
          admin_note?: string | null
          build?: string
          campus?: string | null
          created_at?: string
          details?: string | null
          id?: string
          kind?: string
          reason?: string
          reporter_email?: string | null
          resolved_at?: string | null
          status?: string
          target_id?: string
          target_name?: string | null
        }
        Relationships: []
      }
      events_cache: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          ends_at: string | null
          external_id: string
          fetched_at: string
          id: string
          link: string | null
          location: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          ends_at?: string | null
          external_id: string
          fetched_at?: string
          id?: string
          link?: string | null
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          ends_at?: string | null
          external_id?: string
          fetched_at?: string
          id?: string
          link?: string | null
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_blocks: {
        Row: {
          action: string
          build: string
          created_at: string
          id: string
          kind: string
          reason: string | null
          target_id: string
        }
        Insert: {
          action?: string
          build?: string
          created_at?: string
          id?: string
          kind: string
          reason?: string | null
          target_id: string
        }
        Update: {
          action?: string
          build?: string
          created_at?: string
          id?: string
          kind?: string
          reason?: string | null
          target_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          build: string
          campus: string | null
          created_at: string
          id: string
          ref_code: string
          referred_email: string
        }
        Insert: {
          build?: string
          campus?: string | null
          created_at?: string
          id?: string
          ref_code: string
          referred_email: string
        }
        Update: {
          build?: string
          campus?: string | null
          created_at?: string
          id?: string
          ref_code?: string
          referred_email?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          build: string
          created_at: string
          id: string
          stars: number
          student_email: string
          vendor_id: string
        }
        Insert: {
          body?: string | null
          build?: string
          created_at?: string
          id?: string
          stars: number
          student_email: string
          vendor_id: string
        }
        Update: {
          body?: string | null
          build?: string
          created_at?: string
          id?: string
          stars?: number
          student_email?: string
          vendor_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          build: string
          created_at: string
          email: string
          grad_year: string | null
          id: string
          is_founder: boolean
          last_active_at: string
          school_domain: string
          verified_at: string
        }
        Insert: {
          build?: string
          created_at?: string
          email: string
          grad_year?: string | null
          id?: string
          is_founder?: boolean
          last_active_at?: string
          school_domain: string
          verified_at?: string
        }
        Update: {
          build?: string
          created_at?: string
          email?: string
          grad_year?: string | null
          id?: string
          is_founder?: boolean
          last_active_at?: string
          school_domain?: string
          verified_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          kind: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          kind?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kind?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purge_stale_students: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
