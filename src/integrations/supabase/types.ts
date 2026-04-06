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
      approval_steps: {
        Row: {
          acted_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          request_id: string
          role: Database["public"]["Enums"]["approver_role"]
          status: string
        }
        Insert: {
          acted_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id: string
          role: Database["public"]["Enums"]["approver_role"]
          status?: string
        }
        Update: {
          acted_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id?: string
          role?: Database["public"]["Enums"]["approver_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "approvers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "credit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approvers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_ooo: boolean
          name: string
          ooo_delegate_id: string | null
          role: Database["public"]["Enums"]["approver_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_ooo?: boolean
          name: string
          ooo_delegate_id?: string | null
          role: Database["public"]["Enums"]["approver_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_ooo?: boolean
          name?: string
          ooo_delegate_id?: string | null
          role?: Database["public"]["Enums"]["approver_role"]
        }
        Relationships: [
          {
            foreignKeyName: "approvers_ooo_delegate_id_fkey"
            columns: ["ooo_delegate_id"]
            isOneToOne: false
            referencedRelation: "approvers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_requests: {
        Row: {
          assigned_approver_id: string | null
          aws_account_id: string
          aws_marketplace_deal_id: string | null
          business_justification: string | null
          created_at: string
          credit_amount: number
          credit_type: string
          customer_email: string
          customer_name: string
          deal_end_date: string | null
          deal_start_date: string | null
          denial_reason: string | null
          fiscal_year: string
          id: string
          internal_notes: string | null
          invoice_number: string | null
          products: string[]
          status: Database["public"]["Enums"]["request_status"]
          tier: Database["public"]["Enums"]["request_tier"]
          tracking_id: string
          updated_at: string
        }
        Insert: {
          assigned_approver_id?: string | null
          aws_account_id: string
          aws_marketplace_deal_id?: string | null
          business_justification?: string | null
          created_at?: string
          credit_amount: number
          credit_type?: string
          customer_email: string
          customer_name: string
          deal_end_date?: string | null
          deal_start_date?: string | null
          denial_reason?: string | null
          fiscal_year?: string
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          products?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          tier: Database["public"]["Enums"]["request_tier"]
          tracking_id: string
          updated_at?: string
        }
        Update: {
          assigned_approver_id?: string | null
          aws_account_id?: string
          aws_marketplace_deal_id?: string | null
          business_justification?: string | null
          created_at?: string
          credit_amount?: number
          credit_type?: string
          customer_email?: string
          customer_name?: string
          deal_end_date?: string | null
          deal_start_date?: string | null
          denial_reason?: string | null
          fiscal_year?: string
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          products?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          tier?: Database["public"]["Enums"]["request_tier"]
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_requests_assigned_approver_id_fkey"
            columns: ["assigned_approver_id"]
            isOneToOne: false
            referencedRelation: "approvers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          changed_by: string
          comments: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["request_status"] | null
          id: string
          request_id: string
          to_status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          changed_by: string
          comments?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["request_status"] | null
          id?: string
          request_id: string
          to_status: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          changed_by?: string
          comments?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["request_status"] | null
          id?: string
          request_id?: string
          to_status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "credit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      approver_role: "FINANCE" | "DIRECTOR" | "VP"
      request_status:
        | "SUBMITTED"
        | "FINANCE_REVIEW"
        | "DIRECTOR_PENDING"
        | "VP_PENDING"
        | "NEEDS_CHANGES"
        | "APPROVED"
        | "DENIED"
        | "PAID_OUT"
      request_tier: "UNDER_10K" | "BETWEEN_10K_50K" | "OVER_50K"
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
    Enums: {
      approver_role: ["FINANCE", "DIRECTOR", "VP"],
      request_status: [
        "SUBMITTED",
        "FINANCE_REVIEW",
        "DIRECTOR_PENDING",
        "VP_PENDING",
        "NEEDS_CHANGES",
        "APPROVED",
        "DENIED",
        "PAID_OUT",
      ],
      request_tier: ["UNDER_10K", "BETWEEN_10K_50K", "OVER_50K"],
    },
  },
} as const
