import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vtukfmractjmswafejps.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWtmbXJhY3RqbXN3YWZlanBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU5ODYsImV4cCI6MjA2OTA4MTk4Nn0.v7iUmxy63wEOMbZ0zLaIF1q-sD4hvXQrNdLH6MZGaHg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          client: string
          location: string | null
          budget: number | null
          start_date: string | null
          end_date: string | null
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          client: string
          location?: string | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          client?: string
          location?: string | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          milestone_id: string | null
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in_progress' | 'completed'
          assigned_to: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          milestone_id?: string | null
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          milestone_id?: string | null
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          project_id: string
          user_id: string
          name: string
          type: 'material' | 'equipment' | 'subcontractor'
          quantity: number | null
          unit: string | null
          cost: number | null
          supplier: string | null
          status: 'ordered' | 'delivered' | 'in_use' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          name: string
          type: 'material' | 'equipment' | 'subcontractor'
          quantity?: number | null
          unit?: string | null
          cost?: number | null
          supplier?: string | null
          status?: 'ordered' | 'delivered' | 'in_use' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          name?: string
          type?: 'material' | 'equipment' | 'subcontractor'
          quantity?: number | null
          unit?: string | null
          cost?: number | null
          supplier?: string | null
          status?: 'ordered' | 'delivered' | 'in_use' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      client_updates: {
        Row: {
          id: string
          project_id: string
          user_id: string
          type: 'progress' | 'milestone' | 'issue' | 'completion'
          title: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          type: 'progress' | 'milestone' | 'issue' | 'completion'
          title: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          type?: 'progress' | 'milestone' | 'issue' | 'completion'
          title?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}