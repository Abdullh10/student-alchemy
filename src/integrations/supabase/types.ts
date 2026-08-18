export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          specialization: string | null
          school: string | null
          education_admin: string | null
          stage: string | null
          subjects: string[]
          school_year: string | null
          semester: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          specialization?: string | null
          school?: string | null
          education_admin?: string | null
          stage?: string | null
          subjects?: string[]
          school_year?: string | null
          semester?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          specialization?: string | null
          school?: string | null
          education_admin?: string | null
          stage?: string | null
          subjects?: string[]
          school_year?: string | null
          semester?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          name: string
          grade_level: string | null
          subject: string | null
          school_year: string | null
          semester: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          grade_level?: string | null
          subject?: string | null
          school_year?: string | null
          semester?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          grade_level?: string | null
          subject?: string | null
          school_year?: string | null
          semester?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          teacher_id: string
          class_id: string | null
          name: string
          student_number: string | null
          avatar_url: string | null
          notes_general: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id?: string | null
          name: string
          student_number?: string | null
          avatar_url?: string | null
          notes_general?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string | null
          name?: string
          student_number?: string | null
          avatar_url?: string | null
          notes_general?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      grade_criteria: {
        Row: {
          id: string
          teacher_id: string
          class_id: string | null
          category: "academic" | "behavioral"
          name: string
          max_points: number
          raw_min: number
          raw_max: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id?: string | null
          category: "academic" | "behavioral"
          name: string
          max_points?: number
          raw_min?: number
          raw_max?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string | null
          category?: "academic" | "behavioral"
          name?: string
          max_points?: number
          raw_min?: number
          raw_max?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_criteria_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      note_types: {
        Row: {
          id: string
          teacher_id: string
          criteria_id: string | null
          category: "academic" | "behavioral"
          name: string
          default_points: number
          is_positive: boolean
          icon: string | null
          color: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          criteria_id?: string | null
          category: "academic" | "behavioral"
          name: string
          default_points?: number
          is_positive?: boolean
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          criteria_id?: string | null
          category?: "academic" | "behavioral"
          name?: string
          default_points?: number
          is_positive?: boolean
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_types_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "grade_criteria"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          class_id: string | null
          note_type_id: string | null
          category: "academic" | "behavioral"
          type_name: string
          points: number
          comment: string | null
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          class_id?: string | null
          note_type_id?: string | null
          category: "academic" | "behavioral"
          type_name: string
          points?: number
          comment?: string | null
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          class_id?: string | null
          note_type_id?: string | null
          category?: "academic" | "behavioral"
          type_name?: string
          points?: number
          comment?: string | null
          occurred_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_note_type_id_fkey"
            columns: ["note_type_id"]
            isOneToOne: false
            referencedRelation: "note_types"
            referencedColumns: ["id"]
          }
        ]
      }
      badges: {
        Row: {
          id: string
          teacher_id: string
          name: string
          description: string | null
          icon: string
          color: string
          rule_type: "total_points" | "academic_points" | "behavior_points" | "notes_count" | "note_type_count" | "manual"
          threshold: number | null
          note_type_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          description?: string | null
          icon?: string
          color?: string
          rule_type: "total_points" | "academic_points" | "behavior_points" | "notes_count" | "note_type_count" | "manual"
          threshold?: number | null
          note_type_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          rule_type?: "total_points" | "academic_points" | "behavior_points" | "notes_count" | "note_type_count" | "manual"
          threshold?: number | null
          note_type_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_note_type_id_fkey"
            columns: ["note_type_id"]
            isOneToOne: false
            referencedRelation: "note_types"
            referencedColumns: ["id"]
          }
        ]
      }
      student_badges: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          badge_id: string
          awarded_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          badge_id: string
          awarded_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          badge_id?: string
          awarded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          teacher_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
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
