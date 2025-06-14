/*
  # Fix RLS INSERT Policy for File Uploads

  1. Policy Updates
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that properly allows anonymous file uploads
    - Ensure the policy allows both anonymous and authenticated users to insert records

  2. Security
    - Maintain RLS protection while allowing necessary operations
    - Keep existing SELECT and UPDATE policies intact
*/

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Allow public insert" ON shared_files;

-- Create a new INSERT policy that allows anonymous uploads
CREATE POLICY "Enable insert for anonymous and authenticated users"
  ON shared_files
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure the existing SELECT policy is properly configured
DROP POLICY IF EXISTS "Allow public read access to non-expired files" ON shared_files;
CREATE POLICY "Allow public read access to non-expired files"
  ON shared_files
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- Ensure the existing UPDATE policy is properly configured
DROP POLICY IF EXISTS "Allow public update for download tracking" ON shared_files;
CREATE POLICY "Allow public update for download tracking"
  ON shared_files
  FOR UPDATE
  TO anon, authenticated
  USING (expires_at > now())
  WITH CHECK (expires_at > now());