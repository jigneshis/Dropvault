import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for missing environment variables
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'dropvault-files';

// Database types
export interface SharedFile {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  password_hash?: string;
  expires_at: string;
  max_downloads?: number;
  current_downloads: number;
  created_at: string;
  last_accessed?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface FileStats {
  total_files: number;
  total_downloads: number;
  files_today: number;
  avg_file_size: number;
}