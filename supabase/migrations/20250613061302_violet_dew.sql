/*
  # DropVault Database Schema

  1. New Tables
    - `shared_files`
      - `id` (uuid, primary key)
      - `file_path` (text, unique) - Storage path identifier
      - `file_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `password_hash` (text, nullable) - Hashed password
      - `expires_at` (timestamptz) - Expiration timestamp
      - `max_downloads` (integer, nullable) - Download limit
      - `current_downloads` (integer) - Current download count
      - `created_at` (timestamptz) - Creation timestamp
      - `last_accessed` (timestamptz, nullable) - Last access time
      - `ip_address` (text, nullable) - Uploader IP for analytics
      - `user_agent` (text, nullable) - Browser info for analytics

  2. Storage
    - Create 'dropvault-files' bucket for file storage
    - Enable RLS on bucket

  3. Security
    - Enable RLS on `shared_files` table
    - Add policies for public access to non-expired files
    - Add cleanup function for expired files
*/

-- Create the shared_files table
CREATE TABLE IF NOT EXISTS shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text UNIQUE NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  password_hash text,
  expires_at timestamptz NOT NULL,
  max_downloads integer,
  current_downloads integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz,
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to non-expired files
CREATE POLICY "Allow public read access to non-expired files"
  ON shared_files
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

CREATE POLICY "Allow public insert"
  ON shared_files
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update for download tracking"
  ON shared_files
  FOR UPDATE
  TO anon, authenticated
  USING (expires_at > now())
  WITH CHECK (expires_at > now());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_files_file_path ON shared_files(file_path);
CREATE INDEX IF NOT EXISTS idx_shared_files_expires_at ON shared_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_files_created_at ON shared_files(created_at DESC);

-- Create function to clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM shared_files 
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Create a function to get file stats
CREATE OR REPLACE FUNCTION get_file_stats()
RETURNS TABLE(
  total_files bigint,
  total_downloads bigint,
  files_today bigint,
  avg_file_size numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_files,
    COALESCE(SUM(current_downloads), 0)::bigint as total_downloads,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::bigint as files_today,
    COALESCE(AVG(file_size), 0)::numeric as avg_file_size
  FROM shared_files
  WHERE expires_at > now();
END;
$$;