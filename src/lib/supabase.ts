import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Function to validate if a string is a valid URL
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

let supabase;

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl) || supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-supabase-anon-key-here') {
  console.warn('Supabase environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  // Create a dummy client to prevent errors during development
  supabase = createClient('https://xyzcompany.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzgxODQwMCwiZXhwIjoxOTU5Mzk0NDAwfQ.dummy-key-for-development');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'user' | 'admin';
          downloads_this_month: number;
          last_reset_date: string;
          is_premium: boolean;
          selected_plan: 'monthly' | 'quarterly' | 'yearly' | null;
          plan_expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'user' | 'admin';
          downloads_this_month?: number;
          last_reset_date?: string;
          is_premium?: boolean;
          selected_plan?: 'monthly' | 'quarterly' | 'yearly' | null;
          plan_expiry_date?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'user' | 'admin';
          downloads_this_month?: number;
          last_reset_date?: string;
          is_premium?: boolean;
          selected_plan?: 'monthly' | 'quarterly' | 'yearly' | null;
          plan_expiry_date?: string | null;
        };
      };
      drafts: {
        Row: {
          id: string;
          title: string;
          description: string;
          file_name: string;
          file_size: string;
          file_url: string | null;
          upload_date: string;
          category: string;
          tags: string[];
          download_count: number;
          is_published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          file_name: string;
          file_size: string;
          file_url?: string | null;
          upload_date?: string;
          category: string;
          tags?: string[];
          download_count?: number;
          is_published?: boolean;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          file_name?: string;
          file_size?: string;
          file_url?: string | null;
          upload_date?: string;
          category?: string;
          tags?: string[];
          download_count?: number;
          is_published?: boolean;
          created_by?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          user_id: string;
          draft_id: string;
          downloaded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          draft_id: string;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          draft_id?: string;
          downloaded_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          razorpay_payment_id: string;
          razorpay_order_id: string | null;
          amount: number;
          currency: string;
          plan_type: 'monthly' | 'quarterly' | 'yearly';
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_payment_id: string;
          razorpay_order_id?: string | null;
          amount: number;
          currency?: string;
          plan_type: 'monthly' | 'quarterly' | 'yearly';
          status?: 'pending' | 'completed' | 'failed';
        };
        Update: {
          id?: string;
          user_id?: string;
          razorpay_payment_id?: string;
          razorpay_order_id?: string | null;
          amount?: number;
          currency?: string;
          plan_type?: 'monthly' | 'quarterly' | 'yearly';
          status?: 'pending' | 'completed' | 'failed';
        };
      };
    };
  };
}