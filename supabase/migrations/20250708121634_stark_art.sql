/*
  # Insert Sample Data

  1. Sample Users
    - Admin user
    - Regular user

  2. Sample Drafts
    - Business templates
    - Academic templates
    - Career templates

  3. Notes
    - Passwords will be handled by Supabase Auth
    - This creates the user profiles in our custom users table
*/

-- Insert sample users (these will be linked to Supabase Auth users)
INSERT INTO users (id, email, name, role, downloads_this_month, is_premium, selected_plan) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@demo.com', 'Admin User', 'admin', 0, true, 'yearly'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user@demo.com', 'Demo User', 'user', 2, false, null);

-- Insert sample drafts
INSERT INTO drafts (id, title, description, file_name, file_size, category, tags, download_count, is_published, created_by) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Business Proposal Template',
    'Professional business proposal template for client presentations. Includes sections for executive summary, project scope, timeline, and budget.',
    'business_proposal_template.docx',
    '2.3 MB',
    'Business',
    ARRAY['proposal', 'business', 'template', 'professional'],
    45,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'Resume Template - Modern',
    'Clean and modern resume template for job applications. Features contemporary design with sections for experience, skills, and education.',
    'modern_resume_template.docx',
    '1.8 MB',
    'Career',
    ARRAY['resume', 'cv', 'job', 'template', 'modern'],
    89,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Project Report Format',
    'Academic project report template with proper formatting. Includes title page, abstract, methodology, results, and references sections.',
    'project_report_format.docx',
    '1.5 MB',
    'Academic',
    ARRAY['project', 'report', 'academic', 'format', 'research'],
    23,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'Invoice Template',
    'Professional invoice template for freelancers and small businesses. Includes company details, itemized billing, and payment terms.',
    'invoice_template.docx',
    '1.2 MB',
    'Business',
    ARRAY['invoice', 'billing', 'business', 'freelance'],
    67,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    'Cover Letter Template',
    'Professional cover letter template that complements the modern resume. Customizable for different job applications.',
    'cover_letter_template.docx',
    '1.1 MB',
    'Career',
    ARRAY['cover letter', 'job application', 'career', 'professional'],
    34,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    'Meeting Minutes Template',
    'Structured template for recording meeting minutes. Includes agenda items, action points, and attendee tracking.',
    'meeting_minutes_template.docx',
    '1.0 MB',
    'Business',
    ARRAY['meeting', 'minutes', 'business', 'organization'],
    28,
    true,
    '550e8400-e29b-41d4-a716-446655440001'
  );