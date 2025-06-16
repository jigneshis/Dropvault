import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Only create client if both URL and key are available
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type SharedFile = {
  id: string
  file_path: string
  file_name: string
  file_size: number
  file_type: string
  password_hash?: string
  expires_at: string
  max_downloads?: number
  current_downloads?: number
  created_at?: string
  last_accessed?: string
  ip_address?: string
  user_agent?: string
}