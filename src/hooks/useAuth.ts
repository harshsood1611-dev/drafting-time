import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Check if we need to reset monthly downloads
      const lastReset = new Date(userData.lastResetDate);
      const now = new Date();
      
      let shouldReset = false;
      
      if (userData.selectedPlan === 'quarterly' && userData.isPremium) {
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
        userData.downloadsThisMonth = 0;
        userData.lastResetDate = now.toISOString();
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((u: User) => 
          u.id === userData.id ? userData : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: 'user' as const,
        downloadsThisMonth: 0,
        lastResetDate: new Date().toISOString(),
        isPremium: false,
        selectedPlan: undefined
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === updatedUser.id ? { ...updatedUser, password: u.password } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
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