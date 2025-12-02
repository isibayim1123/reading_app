import { useContext } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  // Ensure AuthProvider is present in the component tree
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  // Get auth state from Zustand store (managed by AuthProvider)
  const { user, isLoading } = useAuthStore();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: 'student' | 'teacher',
    grade?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Manually create profile after user creation
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          user_type: userType,
          grade: grade,
        });

      if (profileError) throw profileError;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
