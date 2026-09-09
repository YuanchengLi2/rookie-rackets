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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          summary: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          summary: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          id: string
          note: string
          recorded_by: string | null
          registration_id: string
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          recorded_by?: string | null
          registration_id: string
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          recorded_by?: string | null
          registration_id?: string
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "public_program_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          active: boolean
          archived_at: string | null
          availability: string
          created_at: string
          email: string
          experience: string
          id: string
          name: string
          role: string
          updated_at: string
          volunteer_minutes: number
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          availability?: string
          created_at?: string
          email: string
          experience?: string
          id?: string
          name: string
          role: string
          updated_at?: string
          volunteer_minutes?: number
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          availability?: string
          created_at?: string
          email?: string
          experience?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
          volunteer_minutes?: number
        }
        Relationships: []
      }
      consents: {
        Row: {
          accepted: boolean
          created_at: string
          id: string
          registration_id: string
          responded_at: string | null
          type: string
          updated_at: string
          version: string
        }
        Insert: {
          accepted: boolean
          created_at?: string
          id?: string
          registration_id: string
          responded_at?: string | null
          type: string
          updated_at?: string
          version: string
        }
        Update: {
          accepted?: boolean
          created_at?: string
          id?: string
          registration_id?: string
          responded_at?: string | null
          type?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string
          created_at: string
          id: string
          media_type: string
          name: string
          organization_id: string | null
          program_id: string | null
          project_id: string | null
          registration_id: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          media_type: string
          name: string
          organization_id?: string | null
          program_id?: string | null
          project_id?: string | null
          registration_id?: string | null
          size_bytes: number
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          media_type?: string
          name?: string
          organization_id?: string | null
          program_id?: string | null
          project_id?: string | null
          registration_id?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_entries: {
        Row: {
          amount_cents: number
          archived_at: string | null
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          kind: string
          paid_by: string
          program_id: string | null
          project_id: string | null
          receipt_file_id: string | null
          reimbursement_status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          archived_at?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          id?: string
          kind: string
          paid_by: string
          program_id?: string | null
          project_id?: string | null
          receipt_file_id?: string | null
          reimbursement_status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          archived_at?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          kind?: string
          paid_by?: string
          program_id?: string | null
          project_id?: string | null
          receipt_file_id?: string | null
          reimbursement_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_entries_receipt_file_id_fkey"
            columns: ["receipt_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_signups: {
        Row: {
          archived_at: string | null
          child_name: string
          comments: string
          created_at: string
          email: string
          grade: string
          id: string
          idempotency_key: string
          parent_name: string
          phone: string
          public_reference: string
          referral: string
          school: string
          status: string
          submitted_at: string
          updated_at: string
          workshop: string
        }
        Insert: {
          archived_at?: string | null
          child_name: string
          comments?: string
          created_at?: string
          email: string
          grade: string
          id?: string
          idempotency_key: string
          parent_name: string
          phone: string
          public_reference: string
          referral: string
          school: string
          status?: string
          submitted_at?: string
          updated_at?: string
          workshop: string
        }
        Update: {
          archived_at?: string | null
          child_name?: string
          comments?: string
          created_at?: string
          email?: string
          grade?: string
          id?: string
          idempotency_key?: string
          parent_name?: string
          phone?: string
          public_reference?: string
          referral?: string
          school?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          workshop?: string
        }
        Relationships: []
      }
      organization_interactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          next_action: string
          notes: string
          occurred_on: string
          organization_id: string
          outcome: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          next_action?: string
          notes?: string
          occurred_on: string
          organization_id: string
          outcome: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          next_action?: string
          notes?: string
          occurred_on?: string
          organization_id?: string
          outcome?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_interactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_support_staff: {
        Row: {
          organization_id: string
          staff_id: string
        }
        Insert: {
          organization_id: string
          staff_id: string
        }
        Update: {
          organization_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_support_staff_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_support_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string
          archived_at: string | null
          created_at: string
          id: string
          last_update: string
          lead_staff_id: string | null
          name: string
          next_step: string
          primary_contact: string
          primary_contact_email: string | null
          status: string
          type: string
          updated_at: string
          website: string
        }
        Insert: {
          address?: string
          archived_at?: string | null
          created_at?: string
          id?: string
          last_update?: string
          lead_staff_id?: string | null
          name: string
          next_step?: string
          primary_contact?: string
          primary_contact_email?: string | null
          status: string
          type: string
          updated_at?: string
          website?: string
        }
        Update: {
          address?: string
          archived_at?: string | null
          created_at?: string
          id?: string
          last_update?: string
          lead_staff_id?: string | null
          name?: string
          next_step?: string
          primary_contact?: string
          primary_contact_email?: string | null
          status?: string
          type?: string
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_lead_staff_id_fkey"
            columns: ["lead_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          external_reference: string
          id: string
          method: string
          note: string
          receipt_file_id: string | null
          received_at: string | null
          registration_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          external_reference?: string
          id?: string
          method?: string
          note?: string
          receipt_file_id?: string | null
          received_at?: string | null
          registration_id: string
          status: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          external_reference?: string
          id?: string
          method?: string
          note?: string
          receipt_file_id?: string | null
          received_at?: string | null
          registration_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_receipt_file_id_fkey"
            columns: ["receipt_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      program_sessions: {
        Row: {
          arrival_time: string
          created_at: string
          curriculum: Json
          date: string
          end_time: string
          id: string
          lead_coach_id: string | null
          location: string
          notes: string
          program_id: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          curriculum?: Json
          date: string
          end_time: string
          id?: string
          lead_coach_id?: string | null
          location: string
          notes?: string
          program_id: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          curriculum?: Json
          date?: string
          end_time?: string
          id?: string
          lead_coach_id?: string | null
          location?: string
          notes?: string
          program_id?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_sessions_lead_coach_id_fkey"
            columns: ["lead_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          archived_at: string | null
          capacity: number
          contact: string
          created_at: string
          description: string
          eligibility: string
          equipment_provided: boolean
          id: string
          image: string
          lead_coach_id: string | null
          name: string
          organization_id: string | null
          price_cents: number
          registration_deadline: string
          skill_level: string
          slug: string
          status: string
          type: string
          updated_at: string
          venue: string
          visibility: string
          what_to_bring: string[]
        }
        Insert: {
          archived_at?: string | null
          capacity: number
          contact?: string
          created_at?: string
          description?: string
          eligibility?: string
          equipment_provided?: boolean
          id?: string
          image?: string
          lead_coach_id?: string | null
          name: string
          organization_id?: string | null
          price_cents?: number
          registration_deadline: string
          skill_level?: string
          slug: string
          status: string
          type: string
          updated_at?: string
          venue?: string
          visibility?: string
          what_to_bring?: string[]
        }
        Update: {
          archived_at?: string | null
          capacity?: number
          contact?: string
          created_at?: string
          description?: string
          eligibility?: string
          equipment_provided?: boolean
          id?: string
          image?: string
          lead_coach_id?: string | null
          name?: string
          organization_id?: string | null
          price_cents?: number
          registration_deadline?: string
          skill_level?: string
          slug?: string
          status?: string
          type?: string
          updated_at?: string
          venue?: string
          visibility?: string
          what_to_bring?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "programs_lead_coach_id_fkey"
            columns: ["lead_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contributors: {
        Row: {
          project_id: string
          staff_id: string
        }
        Insert: {
          project_id: string
          staff_id: string
        }
        Update: {
          project_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contributors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contributors_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          priority: string
          program_id: string | null
          start_date: string
          status: string
          target_date: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          priority: string
          program_id?: string | null
          start_date: string
          status: string
          target_date: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string
          program_id?: string | null
          start_date?: string
          status?: string
          target_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_sessions: {
        Row: {
          created_at: string
          registration_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          registration_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          registration_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_sessions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "public_program_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          archived_at: string | null
          child_first_name: string
          child_last_name: string
          created_at: string
          created_by: string | null
          date_of_birth: string
          emergency_name: string
          emergency_phone: string
          emergency_relationship: string
          grade: string
          guardian_email: string
          guardian_first_name: string
          guardian_last_name: string
          guardian_phone: string
          id: string
          idempotency_key: string
          internal_notes: string
          needs_racket: boolean
          parent_onsite: boolean
          payment_status: string
          program_id: string
          public_reference: string
          registration_status: string
          skill_level: string
          source: string
          submitted_at: string
          support_notes: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          child_first_name: string
          child_last_name: string
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          emergency_name: string
          emergency_phone: string
          emergency_relationship: string
          grade: string
          guardian_email: string
          guardian_first_name: string
          guardian_last_name: string
          guardian_phone: string
          id?: string
          idempotency_key: string
          internal_notes?: string
          needs_racket?: boolean
          parent_onsite?: boolean
          payment_status: string
          program_id: string
          public_reference: string
          registration_status: string
          skill_level: string
          source: string
          submitted_at?: string
          support_notes?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          child_first_name?: string
          child_last_name?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          emergency_name?: string
          emergency_phone?: string
          emergency_relationship?: string
          grade?: string
          guardian_email?: string
          guardian_first_name?: string
          guardian_last_name?: string
          guardian_phone?: string
          id?: string
          idempotency_key?: string
          internal_notes?: string
          needs_racket?: boolean
          parent_onsite?: boolean
          payment_status?: string
          program_id?: string
          public_reference?: string
          registration_status?: string
          skill_level?: string
          source?: string
          submitted_at?: string
          support_notes?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_coaches: {
        Row: {
          accepted: boolean
          coach_id: string
          created_at: string
          id: string
          session_id: string
          slot: string
          updated_at: string
        }
        Insert: {
          accepted?: boolean
          coach_id: string
          created_at?: string
          id?: string
          session_id: string
          slot: string
          updated_at?: string
        }
        Update: {
          accepted?: boolean
          coach_id?: string
          created_at?: string
          id?: string
          session_id?: string
          slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_coaches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_coaches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "public_program_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_allowlist: {
        Row: {
          active: boolean
          created_at: string
          email: string
          invited_by: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          invited_by?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          invited_by?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          initials: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id: string
          initials?: string
          name?: string
          role: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          initials?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived_at: string | null
          created_at: string
          due_date: string
          id: string
          notes: string
          organization_id: string | null
          owner_id: string | null
          priority: string
          program_id: string | null
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          notes?: string
          organization_id?: string | null
          owner_id?: string | null
          priority: string
          program_id?: string | null
          project_id?: string | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string
          organization_id?: string | null
          owner_id?: string | null
          priority?: string
          program_id?: string | null
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          confirmation_copy: string
          contact_email: string
          id: boolean
          organization_name: string
          participation_waiver_version: string
          photo_video_version: string
          pickup_policy_version: string
          program_acknowledgment_version: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          confirmation_copy?: string
          contact_email?: string
          id?: boolean
          organization_name?: string
          participation_waiver_version?: string
          photo_video_version?: string
          pickup_policy_version?: string
          program_acknowledgment_version?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          confirmation_copy?: string
          contact_email?: string
          id?: boolean
          organization_name?: string
          participation_waiver_version?: string
          photo_video_version?: string
          pickup_policy_version?: string
          program_acknowledgment_version?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_program_sessions: {
        Row: {
          date: string | null
          end_time: string | null
          id: string | null
          location: string | null
          program_id: string | null
          start_time: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "public_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      public_programs: {
        Row: {
          capacity: number | null
          contact: string | null
          description: string | null
          eligibility: string | null
          equipment_provided: boolean | null
          id: string | null
          image: string | null
          name: string | null
          price_cents: number | null
          registration_deadline: string | null
          skill_level: string | null
          slug: string | null
          status: string | null
          type: string | null
          venue: string | null
          what_to_bring: string[] | null
        }
        Insert: {
          capacity?: number | null
          contact?: string | null
          description?: string | null
          eligibility?: string | null
          equipment_provided?: boolean | null
          id?: string | null
          image?: string | null
          name?: string | null
          price_cents?: number | null
          registration_deadline?: string | null
          skill_level?: string | null
          slug?: string | null
          status?: string | null
          type?: string | null
          venue?: string | null
          what_to_bring?: string[] | null
        }
        Update: {
          capacity?: number | null
          contact?: string | null
          description?: string | null
          eligibility?: string | null
          equipment_provided?: boolean | null
          id?: string | null
          image?: string | null
          name?: string | null
          price_cents?: number | null
          registration_deadline?: string | null
          skill_level?: string | null
          slug?: string | null
          status?: string | null
          type?: string | null
          venue?: string | null
          what_to_bring?: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      log_activity: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_metadata?: Json
          p_summary: string
        }
        Returns: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          summary: string
        }
        SetofOptions: {
          from: "*"
          to: "activity_log"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_interest_signup: {
        Args: { idempotency_key: string; payload: Json }
        Returns: Json
      }
      submit_registration: {
        Args: { idempotency_key: string; payload: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
          versioning_status: string
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          archived_at: string | null
          bucket_id: string | null
          created_at: string | null
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
