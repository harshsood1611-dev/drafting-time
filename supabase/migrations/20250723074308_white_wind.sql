/*
  # Create users table for DraftKeeper

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth.users.id
      - `email` (text, unique) - user email address
      - `name` (text) - user full name
      - `role` (text) - user role (user/admin)
      - `downloads_this_month` (integer) - current download count
      - `last_reset_date` (timestamp) - last download reset date
      - `is_premium` (boolean) - premium status
      - `selected_plan` (text) - selected plan type
      - `plan_expiry_date` (timestamp) - plan expiry date
      - `created_at` (timestamp) - record creation time
      - `updated_at` (timestamp) - record update time

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for admins to read all user data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  downloads_this_month integer NOT NULL DEFAULT 0,
  last_reset_date timestamptz NOT NULL DEFAULT now(),
  is_premium boolean NOT NULL DEFAULT false,
  selected_plan text CHECK (selected_plan IN ('monthly', 'quarterly', 'yearly')),
  plan_expiry_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read and update their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admins to read all user data
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user (you can modify the email)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@demo.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insert the admin user profile
INSERT INTO users (id, email, name, role, downloads_this_month, last_reset_date, is_premium)
SELECT 
  id,
  'admin@demo.com',
  'Admin User',
  'admin',
  0,
  now(),
  true
FROM auth.users 
WHERE email = 'admin@demo.com'
ON CONFLICT (id) DO NOTHING;