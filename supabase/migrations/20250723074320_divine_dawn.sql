/*
  # Create drafts table for template storage

  1. New Tables
    - `drafts`
      - `id` (uuid, primary key)
      - `title` (text) - template title
      - `description` (text) - template description
      - `file_name` (text) - original file name
      - `file_size` (text) - file size display
      - `file_url` (text) - file storage URL (optional)
      - `upload_date` (timestamp) - upload date
      - `category` (text) - template category
      - `tags` (text array) - template tags
      - `download_count` (integer) - download counter
      - `is_published` (boolean) - publication status
      - `created_by` (uuid) - creator user ID
      - `created_at` (timestamp) - record creation time
      - `updated_at` (timestamp) - record update time

  2. Security
    - Enable RLS on `drafts` table
    - Add policy for authenticated users to read published drafts
    - Add policy for admins to manage all drafts
    - Add policy for creators to manage their own drafts
*/

CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  file_name text NOT NULL,
  file_size text NOT NULL,
  file_url text,
  upload_date timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  download_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read published drafts
CREATE POLICY "Users can read published drafts"
  ON drafts
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Policy for admins to manage all drafts
CREATE POLICY "Admins can manage all drafts"
  ON drafts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for creators to manage their own drafts
CREATE POLICY "Creators can manage own drafts"
  ON drafts
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Trigger to automatically update updated_at
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample drafts
INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by) 
SELECT 
  'Business Proposal Template',
  'Professional business proposal template for client presentations. Includes sections for executive summary, project scope, timeline, and budget.',
  'business_proposal_template.docx',
  '2.3 MB',
  'Business',
  ARRAY['proposal', 'business', 'template', 'professional'],
  45,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by)
SELECT 
  'Resume Template - Modern',
  'Clean and modern resume template for job applications. Features contemporary design with sections for experience, skills, and education.',
  'modern_resume_template.doc',
  '1.8 MB',
  'Career',
  ARRAY['resume', 'cv', 'job', 'template', 'modern'],
  89,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by)
SELECT 
  'Project Report Format',
  'Academic project report template with proper formatting. Includes title page, abstract, methodology, results, and references sections.',
  'project_report_format.doc',
  '1.5 MB',
  'Academic',
  ARRAY['project', 'report', 'academic', 'format', 'research'],
  23,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by)
SELECT 
  'Invoice Template',
  'Professional invoice template for freelancers and small businesses. Includes company details, itemized billing, and payment terms.',
  'invoice_template.doc',
  '1.2 MB',
  'Business',
  ARRAY['invoice', 'billing', 'business', 'freelance'],
  67,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by)
SELECT 
  'Cover Letter Template',
  'Professional cover letter template that complements the modern resume. Customizable for different job applications.',
  'cover_letter_template.doc',
  '1.1 MB',
  'Career',
  ARRAY['cover letter', 'job application', 'career', 'professional'],
  34,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;

INSERT INTO drafts (title, description, file_name, file_size, category, tags, download_count, is_published, created_by)
SELECT 
  'Meeting Minutes Template',
  'Structured template for recording meeting minutes. Includes agenda items, action points, and attendee tracking.',
  'meeting_minutes_template.doc',
  '1.0 MB',
  'Business',
  ARRAY['meeting', 'minutes', 'business', 'organization'],
  28,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;