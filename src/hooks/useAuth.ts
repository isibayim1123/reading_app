import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations within the same component instance
    if (initRef.current) {
      return;
    }

    initRef.current = true;

    // Listen for auth changes
    // onAuthStateChange automatically fires INITIAL_SESSION event on mount
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      // Handle INITIAL_SESSION and SIGNED_IN the same way
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        try {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          }

          if (profile) {
            setUser(profile as Profile);
          } else {
            console.warn('User session exists but no profile found');
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setLoading(false);
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session on initial load
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        clearUser();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        // Don't change loading state on token refresh
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Refetch profile when user is updated
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as Profile);
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // Zustand store functions are stable and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
