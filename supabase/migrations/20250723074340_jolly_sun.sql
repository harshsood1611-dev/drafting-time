/*
  # Create downloads table for tracking user downloads

  1. New Tables
    - `downloads`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - user who downloaded
      - `draft_id` (uuid) - downloaded draft
      - `downloaded_at` (timestamp) - download timestamp
      - `created_at` (timestamp) - record creation time

  2. Security
    - Enable RLS on `downloads` table
    - Add policy for users to read their own downloads
    - Add policy for admins to read all downloads
    - Add policy for authenticated users to insert downloads
*/

CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draft_id uuid NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS downloads_user_id_idx ON downloads(user_id);
CREATE INDEX IF NOT EXISTS downloads_draft_id_idx ON downloads(draft_id);
CREATE INDEX IF NOT EXISTS downloads_downloaded_at_idx ON downloads(downloaded_at);

-- Enable RLS
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own downloads
CREATE POLICY "Users can read own downloads"
  ON downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for admins to read all downloads
CREATE POLICY "Admins can read all downloads"
  ON downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for authenticated users to insert downloads
CREATE POLICY "Users can insert downloads"
  ON downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());