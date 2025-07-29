/*
  # Create payments table for tracking Razorpay transactions

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - user who made payment
      - `razorpay_payment_id` (text) - Razorpay payment ID
      - `razorpay_order_id` (text) - Razorpay order ID (optional)
      - `amount` (integer) - payment amount in paise
      - `currency` (text) - payment currency
      - `plan_type` (text) - purchased plan type
      - `status` (text) - payment status
      - `created_at` (timestamp) - record creation time
      - `updated_at` (timestamp) - record update time

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to read their own payments
    - Add policy for admins to read all payments
    - Add policy for authenticated users to insert payments
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_payment_id text NOT NULL UNIQUE,
  razorpay_order_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_payment_id_idx ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own payments
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for admins to read all payments
CREATE POLICY "Admins can read all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for authenticated users to insert payments
CREATE POLICY "Users can insert payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trigger to automatically update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();