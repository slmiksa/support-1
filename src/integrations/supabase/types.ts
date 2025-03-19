export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          notification_email: string | null
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_fields: {
        Row: {
          created_at: string
          display_name: string
          field_name: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          display_name: string
          field_name: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string
          field_name?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          favicon_url: string | null
          footer_text: string
          id: string
          logo_url: string | null
          page_title: string | null
          primary_color: string
          secondary_color: string
          site_name: string
          support_available: boolean | null
          support_message: string | null
          text_color: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          footer_text?: string
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          support_available?: boolean | null
          support_message?: string | null
          text_color?: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          footer_text?: string
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          support_available?: boolean | null
          support_message?: string | null
          text_color?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean | null
          response: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          response: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          response?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      tickets: {
        Row: {
          anydesk_number: string | null
          branch: string
          created_at: string
          custom_fields: Json | null
          description: string
          employee_id: string
          extension_number: string | null
          id: string
          image_url: string | null
          priority: string | null
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          anydesk_number?: string | null
          branch: string
          created_at?: string
          custom_fields?: Json | null
          description: string
          employee_id: string
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          anydesk_number?: string | null
          branch?: string
          created_at?: string
          custom_fields?: Json | null
          description?: string
          employee_id?: string
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_ticket_response: {
        Args: {
          p_ticket_id: string
          p_response: string
          p_is_admin?: boolean
        }
        Returns: string
      }
      check_admin_credentials: {
        Args: {
          p_username: string
          p_password: string
        }
        Returns: boolean
      }
      update_ticket_status: {
        Args: {
          p_ticket_id: string
          p_status: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
