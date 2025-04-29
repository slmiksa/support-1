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
          created_at: string | null
          employee_id: string | null
          id: string
          notification_email: string | null
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      branch_resource_types: {
        Row: {
          available: number
          branch_id: string
          created_at: string | null
          id: string
          in_use: number
          resource_type_id: string
        }
        Insert: {
          available?: number
          branch_id: string
          created_at?: string | null
          id?: string
          in_use?: number
          resource_type_id: string
        }
        Update: {
          available?: number
          branch_id?: string
          created_at?: string | null
          id?: string
          in_use?: number
          resource_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_resource_types_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_resource_types_resource_type_id_fkey"
            columns: ["resource_type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_resources: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          name: string | null
          resource_type_id: string
          status: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          name?: string | null
          resource_type_id: string
          status?: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          name?: string | null
          resource_type_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_resources_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_resources_resource_type_id_fkey"
            columns: ["resource_type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
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
      resource_types: {
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
      site_fields: {
        Row: {
          created_at: string | null
          display_name: string
          field_name: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          placeholder: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          field_name: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          field_name?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          company_sender_email: string | null
          company_sender_name: string | null
          created_at: string | null
          email_settings: Json | null
          favicon_url: string | null
          footer_text: string | null
          id: string
          logo_url: string | null
          page_title: string | null
          primary_color: string | null
          secondary_color: string | null
          support_available: boolean | null
          support_help_fields: Json | null
          support_info: string | null
          support_message: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          company_sender_email?: string | null
          company_sender_name?: string | null
          created_at?: string | null
          email_settings?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          support_available?: boolean | null
          support_help_fields?: Json | null
          support_info?: string | null
          support_message?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          company_sender_email?: string | null
          company_sender_name?: string | null
          created_at?: string | null
          email_settings?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          support_available?: boolean | null
          support_help_fields?: Json | null
          support_info?: string | null
          support_message?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          private: boolean | null
          response: string
          ticket_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          private?: boolean | null
          response: string
          ticket_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          private?: boolean | null
          response?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
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
          assigned_to: string | null
          branch: string
          created_at: string | null
          custom_fields: Json | null
          customer_email: string | null
          description: string
          employee_id: string | null
          extension_number: string | null
          id: string
          image_url: string | null
          priority: Database["public"]["Enums"]["priority_type"]
          status: string
          support_email: string | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          anydesk_number?: string | null
          assigned_to?: string | null
          branch: string
          created_at?: string | null
          custom_fields?: Json | null
          customer_email?: string | null
          description: string
          employee_id?: string | null
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: Database["public"]["Enums"]["priority_type"]
          status?: string
          support_email?: string | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          anydesk_number?: string | null
          assigned_to?: string | null
          branch?: string
          created_at?: string | null
          custom_fields?: Json | null
          customer_email?: string | null
          description?: string
          employee_id?: string | null
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: Database["public"]["Enums"]["priority_type"]
          status?: string
          support_email?: string | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_company_email_columns: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      add_ticket_response_with_admin: {
        Args: {
          p_ticket_id: string
          p_response: string
          p_is_admin: boolean
          p_admin_id: string
        }
        Returns: Json
      }
      check_admin_credentials: {
        Args: { p_username: string; p_password: string }
        Returns: boolean
      }
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      delete_ticket_by_id: {
        Args: { p_ticket_id: string }
        Returns: boolean
      }
      update_ticket_status: {
        Args: { p_ticket_id: string; p_status: string }
        Returns: boolean
      }
    }
    Enums: {
      priority_type: "urgent" | "medium" | "normal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      priority_type: ["urgent", "medium", "normal"],
    },
  },
} as const
