import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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