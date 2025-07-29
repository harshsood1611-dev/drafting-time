import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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