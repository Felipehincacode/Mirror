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
      challenges: {
        Row: {
          created_at: string | null
          day_index: number
          description: string | null
          id: number
          tag: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          day_index: number
          description?: string | null
          id?: number
          tag?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          day_index?: number
          description?: string | null
          id?: number
          tag?: string | null
          title?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          emoji_type: string
          id: number
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji_type: string
          id?: number
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji_type?: string
          id?: number
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          challenge_id: number
          created_at: string | null
          id: string
          location: unknown | null
          note: string | null
          photo_url: string
          title: string
          user_id: string
        }
        Insert: {
          challenge_id: number
          created_at?: string | null
          id?: string
          location?: unknown | null
          note?: string | null
          photo_url: string
          title: string
          user_id: string
        }
        Update: {
          challenge_id?: number
          created_at?: string | null
          id?: string
          location?: unknown | null
          note?: string | null
          photo_url?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          id: string
          author_name: string
          target_user_id: string | null
          type: string
          text: string
          scheduled_at: string | null
          lat: number | null
          lon: number | null
          radius_m: number | null
          recurrent: boolean | null
          state: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          author_name: string
          target_user_id?: string | null
          type: string
          text: string
          scheduled_at?: string | null
          lat?: number | null
          lon?: number | null
          radius_m?: number | null
          recurrent?: boolean | null
          state?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          author_name?: string
          target_user_id?: string | null
          type?: string
          text?: string
          scheduled_at?: string | null
          lat?: number | null
          lon?: number | null
          radius_m?: number | null
          recurrent?: boolean | null
          state?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_messages: {
        Row: {
          date: string
          message: string
        }
        Insert: {
          date: string
          message: string
        }
        Update: {
          date?: string
          message?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_submission: {
        Args: {
          p_challenge_id: number
          p_location_lat?: number
          p_location_lng?: number
          p_note?: string
          p_photo_url: string
          p_title: string
          p_user_id: string
        }
        Returns: {
          message: string
          submission_id: string
          success: boolean
        }[]
      }
      delete_push_subscription: {
        Args: { p_endpoint: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      delete_submission: {
        Args: { p_submission_id: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      get_all_challenges: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          day_index: number
          description: string
          id: number
          tag: string
          title: string
        }[]
      }
      get_all_push_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_key: string
          endpoint: string
          p256dh_key: string
          user_id: string
          username: string
        }[]
      }
      get_calendar_data: {
        Args: { start_date?: string }
        Returns: {
          challenge_description: string
          challenge_tag: string
          challenge_title: string
          day_index: number
          felipe_created_at: string
          felipe_note: string
          felipe_photo_url: string
          felipe_title: string
          has_felipe: boolean
          has_manuela: boolean
          manuela_created_at: string
          manuela_note: string
          manuela_photo_url: string
          manuela_title: string
        }[]
      }
      get_challenge_by_day: {
        Args: { day_number: number }
        Returns: {
          created_at: string
          day_index: number
          description: string
          id: number
          tag: string
          title: string
        }[]
      }
      get_challenge_submissions: {
        Args: { p_challenge_id: number }
        Returns: {
          created_at: string
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
          user_id: string
          username: string
        }[]
      }
      get_challenges_range: {
        Args: { end_day: number; start_day: number }
        Returns: {
          created_at: string
          day_index: number
          description: string
          id: number
          tag: string
          title: string
        }[]
      }
      get_current_challenge: {
        Args: { start_date?: string }
        Returns: {
          created_at: string
          day_index: number
          description: string
          id: number
          tag: string
          title: string
        }[]
      }
      get_gallery_felipe: {
        Args: { p_user_id: string }
        Returns: {
          challenge_title: string
          created_at: string
          day_index: number
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
        }[]
      }
      get_gallery_manuela: {
        Args: { p_user_id: string }
        Returns: {
          challenge_title: string
          created_at: string
          day_index: number
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
        }[]
      }
      get_gallery_mirror: {
        Args: Record<PropertyKey, never>
        Returns: {
          challenge_title: string
          created_at: string
          day_index: number
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
          user_id: string
          username: string
        }[]
      }
      get_map_photos: {
        Args: { p_user_id: string }
        Returns: {
          challenge_title: string
          created_at: string
          day_index: number
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
        }[]
      }
      get_user_progress: {
        Args: { user_uuid: string }
        Returns: {
          completed_challenges: number
          completion_percentage: number
          current_day: number
          total_challenges: number
        }[]
      }
      get_user_push_subscriptions: {
        Args: { p_user_id: string }
        Returns: {
          auth_key: string
          created_at: string
          endpoint: string
          p256dh_key: string
          subscription_id: string
        }[]
      }
      get_user_submission_by_challenge: {
        Args: { p_challenge_id: number; p_user_id: string }
        Returns: {
          created_at: string
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
        }[]
      }
      get_user_submissions: {
        Args: { p_user_id: string }
        Returns: {
          challenge_description: string
          challenge_id: number
          challenge_title: string
          created_at: string
          day_index: number
          location_lat: number
          location_lng: number
          note: string
          photo_url: string
          submission_id: string
          title: string
          updated_at: string
        }[]
      }
      get_dashboard_data: {
        Args: { p_user_id: string; start_date?: string }
        Returns: {
          current_challenge_id: number
          current_challenge_title: string
          current_challenge_description: string
          current_challenge_tag: string
          current_day: number
          total_challenges: number
          completed_challenges: number
          completion_percentage: number
          has_submission_today: boolean
        }[]
      }
      save_push_subscription: {
        Args: {
          p_auth_key: string
          p_endpoint: string
          p_p256dh_key: string
          p_user_id: string
        }
        Returns: {
          message: string
          subscription_id: string
          success: boolean
        }[]
      }
      send_daily_reminder_notification: {
        Args: Record<PropertyKey, never>
        Returns: {
          message: string
          notifications_sent: number
          success: boolean
        }[]
      }
      update_submission: {
        Args: {
          p_location_lat?: number
          p_location_lng?: number
          p_note?: string
          p_photo_url?: string
          p_submission_id: string
          p_title?: string
          p_user_id: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
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
