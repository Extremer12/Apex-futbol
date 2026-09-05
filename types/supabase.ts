export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cloud_saves: {
        Row: {
          created_at: string
          game_date: string
          game_state: Json
          id: string
          player_profile: Json
          save_name: string
          schema_version: number | null
          season: number
          slot_id: string
          team_id: number
          team_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_date: string
          game_state: Json
          id?: string
          player_profile: Json
          save_name: string
          schema_version?: number | null
          season?: number
          slot_id: string
          team_id: number
          team_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_date?: string
          game_state?: Json
          id?: string
          player_profile?: Json
          save_name?: string
          schema_version?: number | null
          season?: number
          slot_id?: string
          team_id?: number
          team_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_packs: {
        Row: {
          author_name: string
          category: string | null
          created_at: string
          description: string | null
          downloads_count: number | null
          id: string
          manifest_url: string
          title: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          id?: string
          manifest_url: string
          title: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          id?: string
          manifest_url?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          board_confidence: number | null
          club_value: number | null
          created_at: string
          fan_approval: number | null
          id: string
          manager_name: string
          score: number
          season: number
          team_name: string
          trophies_count: number | null
          user_id: string | null
        }
        Insert: {
          board_confidence?: number | null
          club_value?: number | null
          created_at?: string
          fan_approval?: number | null
          id?: string
          manager_name: string
          score: number
          season: number
          team_name: string
          trophies_count?: number | null
          user_id?: string | null
        }
        Update: {
          board_confidence?: number | null
          club_value?: number | null
          created_at?: string
          fan_approval?: number | null
          id?: string
          manager_name?: string
          score?: number
          season?: number
          team_name?: string
          trophies_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
