/*
  # Fix anonymous file upload permissions

  1. Security Updates
    - Add INSERT policy for anonymous users on shared_files table
    - Allow anonymous users to upload files without authentication
    - Maintain existing security for read/update operations

  2. Changes Made
    - Create policy "Allow anonymous file uploads" for INSERT operations
    - Policy allows any anonymous user to insert new file records
    - Existing policies for SELECT and UPDATE remain unchanged
*/

-- Add INSERT policy for anonymous users to upload files
CREATE POLICY "Allow anonymous file uploads"
  ON shared_files
  FOR INSERT
  TO anon
  WITH CHECK (true);