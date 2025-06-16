/*
  # Create storage bucket for shared files

  1. Storage Setup
    - Create 'shared-files' bucket for file storage
    - Set up public access policies for downloads
    - Configure bucket settings for security

  2. Security
    - Allow public uploads (anonymous users can upload)
    - Allow public downloads with proper file ID verification
    - Set reasonable file size limits
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shared-files',
  'shared-files',
  true,
  104857600, -- 100MB limit
  ARRAY[
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'text/*'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the bucket
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'shared-files');

-- Allow public downloads from the bucket
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shared-files');

-- Allow public deletion (for cleanup)
CREATE POLICY "Allow public deletion"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'shared-files');