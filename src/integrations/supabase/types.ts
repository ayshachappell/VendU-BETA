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
          appointment_at: string | null
          build: string
          conversation_id: string | null
          created_at: string
          id: string
          service: string | null
          status: string
          student_email: string
          vendor_email: string | null
          vendor_id: string
        }
        Insert: {
          appointment_at?: string | null
          build?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          service?: string | null
          status?: string
          student_email: string
          vendor_email?: string | null
          vendor_id: string
        }
        Update: {
          appointment_at?: string | null
          build?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          service?: string | null
          status?: string
          student_email?: string
          vendor_email?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      campus_events: {
        Row: {
          active: boolean
          build: string
          created_at: string
          creator_email: string
          creator_name: string
          description: string | null
          domain: string
          ends_at: string | null
          id: string
          image_url: string | null
          location: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          build?: string
          created_at?: string
          creator_email: string
          creator_name: string
          description?: string | null
          domain: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          build?: string
          created_at?: string
          creator_email?: string
          creator_name?: string
          description?: string | null
          domain?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      conversation_messages: {
        Row: {
          attachment: Json | null
          body: string | null
          build: string
          conversation_id: string
          created_at: string
          id: string
          kind: string
          sender_email: string | null
          sender_name: string
        }
        Insert: {
          attachment?: Json | null
          body?: string | null
          build?: string
          conversation_id: string
          created_at?: string
          id?: string
          kind?: string
          sender_email?: string | null
          sender_name: string
        }
        Update: {
          attachment?: Json | null
          body?: string | null
          build?: string
          conversation_id?: string
          created_at?: string
          id?: string
          kind?: string
          sender_email?: string | null
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reads: {
        Row: {
          conversation_id: string
          read_at: string
          reader_email: string
        }
        Insert: {
          conversation_id: string
          read_at?: string
          reader_email: string
        }
        Update: {
          conversation_id?: string
          read_at?: string
          reader_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          build: string
          created_at: string
          id: string
          participant_a_email: string
          participant_a_name: string | null
          participant_b_email: string
          participant_b_name: string | null
          updated_at: string
        }
        Insert: {
          build?: string
          created_at?: string
          id?: string
          participant_a_email: string
          participant_a_name?: string | null
          participant_b_email: string
          participant_b_name?: string | null
          updated_at?: string
        }
        Update: {
          build?: string
          created_at?: string
          id?: string
          participant_a_email?: string
          participant_a_name?: string | null
          participant_b_email?: string
          participant_b_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_interests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          student_email: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          student_email: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          student_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notifications: {
        Row: {
          actor_email: string | null
          build: string
          created_at: string
          event_id: string | null
          id: string
          kind: string
          message: string
          read_at: string | null
          recipient_email: string
        }
        Insert: {
          actor_email?: string | null
          build?: string
          created_at?: string
          event_id?: string | null
          id?: string
          kind?: string
          message: string
          read_at?: string | null
          recipient_email: string
        }
        Update: {
          actor_email?: string | null
          build?: string
          created_at?: string
          event_id?: string | null
          id?: string
          kind?: string
          message?: string
          read_at?: string | null
          recipient_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
        ]
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
      message_notifications: {
        Row: {
          build: string
          conversation_id: string | null
          created_at: string
          id: string
          kind: string
          message: string
          read_at: string | null
          recipient_email: string
          transaction_id: string | null
        }
        Insert: {
          build?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          message: string
          read_at?: string | null
          recipient_email: string
          transaction_id?: string | null
        }
        Update: {
          build?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string
          read_at?: string | null
          recipient_email?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "message_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      message_transactions: {
        Row: {
          appointment_at: string | null
          build: string
          buyer_email: string
          buyer_met_at: string | null
          buyer_name: string
          buyer_paid_at: string | null
          conversation_id: string
          created_at: string
          id: string
          kind: string
          meetup_available_at: string | null
          payment_methods: Json
          payment_not_received_at: string | null
          reference_id: string
          reminder_sent_at: string | null
          reported_at: string | null
          seller_email: string
          seller_met_at: string | null
          seller_name: string
          seller_paid_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_at?: string | null
          build?: string
          buyer_email: string
          buyer_met_at?: string | null
          buyer_name: string
          buyer_paid_at?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          kind?: string
          meetup_available_at?: string | null
          payment_methods?: Json
          payment_not_received_at?: string | null
          reference_id: string
          reminder_sent_at?: string | null
          reported_at?: string | null
          seller_email: string
          seller_met_at?: string | null
          seller_name: string
          seller_paid_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_at?: string | null
          build?: string
          buyer_email?: string
          buyer_met_at?: string | null
          buyer_name?: string
          buyer_paid_at?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          kind?: string
          meetup_available_at?: string | null
          payment_methods?: Json
          payment_not_received_at?: string | null
          reference_id?: string
          reminder_sent_at?: string | null
          reported_at?: string | null
          seller_email?: string
          seller_met_at?: string | null
          seller_name?: string
          seller_paid_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_transactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      post_comments: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          post_id: string
          student_email: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          post_id: string
          student_email: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          student_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          student_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          student_email: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          student_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_email: string
          author_name: string | null
          auto: boolean
          badges: Json
          body: string | null
          build: string
          campus_domain: string
          created_at: string
          event_id: string | null
          id: string
          image_url: string | null
          kind: string
          price_label: string | null
          sold: boolean
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          author_email: string
          author_name?: string | null
          auto?: boolean
          badges?: Json
          body?: string | null
          build?: string
          campus_domain: string
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          price_label?: string | null
          sold?: boolean
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string | null
          auto?: boolean
          badges?: Json
          body?: string | null
          build?: string
          campus_domain?: string
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          price_label?: string | null
          sold?: boolean
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          campus_domain: string | null
          campus_name: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          last_seen_at: string
          notify: Json
          payments: Json
          phone: string | null
          socials: Json
          updated_at: string
          vendor_mode: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          campus_domain?: string | null
          campus_name?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          last_seen_at?: string
          notify?: Json
          payments?: Json
          phone?: string | null
          socials?: Json
          updated_at?: string
          vendor_mode?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          campus_domain?: string | null
          campus_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          last_seen_at?: string
          notify?: Json
          payments?: Json
          phone?: string | null
          socials?: Json
          updated_at?: string
          vendor_mode?: boolean
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          build: string
          campus: string | null
          created_at: string
          id: string
          qualified: boolean
          qualified_at: string | null
          ref_code: string
          referred_email: string
        }
        Insert: {
          build?: string
          campus?: string | null
          created_at?: string
          id?: string
          qualified?: boolean
          qualified_at?: string | null
          ref_code: string
          referred_email: string
        }
        Update: {
          build?: string
          campus?: string | null
          created_at?: string
          id?: string
          qualified?: boolean
          qualified_at?: string | null
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
      vendor_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          service_id: string | null
          sort_order: number
          url: string
          vendor_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          sort_order?: number
          url: string
          vendor_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          sort_order?: number
          url?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_photos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price_cents: number | null
          price_label: string | null
          promo: string | null
          promo_ends_at: string | null
          sort_order: number
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price_cents?: number | null
          price_label?: string | null
          promo?: string | null
          promo_ends_at?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price_cents?: number | null
          price_label?: string | null
          promo?: string | null
          promo_ends_at?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          accent_color: string | null
          availability: string | null
          avatar_url: string | null
          badges: Json
          boosted: boolean
          build: string
          campus_domain: string
          category: string | null
          created_at: string
          id: string
          layout: string
          owner_email: string
          payments: Json
          published: boolean
          shop_name: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          availability?: string | null
          avatar_url?: string | null
          badges?: Json
          boosted?: boolean
          build?: string
          campus_domain: string
          category?: string | null
          created_at?: string
          id?: string
          layout?: string
          owner_email: string
          payments?: Json
          published?: boolean
          shop_name: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          availability?: string | null
          avatar_url?: string | null
          badges?: Json
          boosted?: boolean
          build?: string
          campus_domain?: string
          category?: string | null
          created_at?: string
          id?: string
          layout?: string
          owner_email?: string
          payments?: Json
          published?: boolean
          shop_name?: string
          tagline?: string | null
          updated_at?: string
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
