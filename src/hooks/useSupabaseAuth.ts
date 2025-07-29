import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        // Check if we need to reset monthly downloads
        const lastReset = new Date(data.last_reset_date);
        const now = new Date();
        
        let shouldReset = false;
        
        if (data.selected_plan === 'quarterly') {
          // For quarterly plans, reset every 3 months (quarterly)
          const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
          shouldReset = monthsDiff >= 3;
        } else {
          // For monthly and yearly plans, reset monthly
          const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
          shouldReset = monthsDiff > 0;
        }
        
        if (shouldReset) {
          // Reset downloads for new period (monthly or quarterly)
          const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({
              downloads_this_month: 0,
              last_reset_date: now.toISOString()
            })
            .eq('id', authUser.id)
            .select()
            .single();

          if (!updateError && updatedData) {
            setUser(mapDatabaseUserToUser(updatedData));
          }
        } else {
          setUser(mapDatabaseUserToUser(data));
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const mapDatabaseUserToUser = (dbUser: any): User => ({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    downloadsThisMonth: dbUser.downloads_this_month,
    lastResetDate: dbUser.last_reset_date,
    isPremium: dbUser.is_premium,
    selectedPlan: dbUser.selected_plan,
    planExpiryDate: dbUser.plan_expiry_date
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        console.error('Registration error:', authError);
        return false;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            role: 'user',
            downloads_this_month: 0,
            last_reset_date: new Date().toISOString(),
            is_premium: false,
            selected_plan: null
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          downloads_this_month: updatedUser.downloadsThisMonth,
          last_reset_date: updatedUser.lastResetDate,
          is_premium: updatedUser.isPremium,
          selected_plan: updatedUser.selectedPlan,
          plan_expiry_date: updatedUser.planExpiryDate
        })
        .eq('id', updatedUser.id);

      if (error) {
        console.error('Update user error:', error);
        return;
      }

      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };
};