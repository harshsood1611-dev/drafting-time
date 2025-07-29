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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
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
      console.log('Fetching user profile for:', authUser.email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If user doesn't exist in our users table, create them
        if (error.code === 'PGRST116') {
          console.log('User not found in users table, creating profile...');
          await createUserProfile(authUser);
          return;
        }
        return;
      }

      if (data) {
        console.log('User profile fetched successfully:', data);
        
        // Check if we need to reset monthly downloads
        const lastReset = new Date(data.last_reset_date);
        const now = new Date();
        
        let shouldReset = false;
        
        if (data.selected_plan === 'quarterly' && data.is_premium) {
          // For quarterly plans, reset every 3 months
          const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
          shouldReset = monthsDiff >= 3;
        } else {
          // For monthly and yearly plans, reset monthly
          const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
          shouldReset = monthsDiff > 0;
        }
        
        if (shouldReset) {
          console.log('Resetting downloads for new period');
          // Reset downloads for new period
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
          } else {
            console.error('Error updating user downloads:', updateError);
            setUser(mapDatabaseUserToUser(data));
          }
        } else {
          setUser(mapDatabaseUserToUser(data));
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Creating user profile for:', authUser.email);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'user',
          downloads_this_month: 0,
          last_reset_date: new Date().toISOString(),
          is_premium: false,
          selected_plan: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      if (data) {
        console.log('User profile created successfully:', data);
        setUser(mapDatabaseUserToUser(data));
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
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
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      console.log('Login successful for:', email);
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', email);
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (authError) {
        console.error('Registration error:', authError);
        return false;
      }

      if (authData.user) {
        console.log('Registration successful for:', email);
        
        // The user profile will be created automatically by the trigger
        // or by the fetchUserProfile function when they sign in
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
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      console.log('Updating user:', updatedUser.email);
      
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

      console.log('User updated successfully');
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