import { createContext, useEffect, useRef, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextValue {
  // Context doesn't need to expose any values since we're using Zustand store
  // This context just ensures the auth listener is set up once
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, setLoading, clearUser } = useAuthStore();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent multiple initializations - check if subscription already exists
    if (subscriptionRef.current) {
      console.log('[Auth] Subscription already exists, skipping setup');
      return;
    }

    // Set a timeout to prevent infinite loading state
    // If loading doesn't complete within 5 seconds, force it to false
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('[Auth] Loading timeout - forcing loading state to false');
      setLoading(false);
    }, 5000);

    console.log('[Auth] Setting up auth state listener (single instance)');

    // Set up single auth state listener for the entire app
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Store subscription reference
      subscriptionRef.current = subscription;
      console.log('[Auth] Auth state changed:', event);

      // Clear the loading timeout since we received an auth event
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = undefined;
      }

      // Handle INITIAL_SESSION and SIGNED_IN events
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        try {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('[Auth] Error fetching profile:', error);
            setLoading(false);
            return;
          }

          if (profile) {
            setUser(profile as Profile);
            console.log('[Auth] User profile loaded:', profile.email);
          } else {
            console.warn('[Auth] User session exists but no profile found');
            setLoading(false);
          }
        } catch (error) {
          console.error('[Auth] Error in auth state change:', error);
          setLoading(false);
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session on initial load - user is not logged in
        console.log('[Auth] No session found on initial load');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        clearUser();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[Auth] Token refreshed successfully');
        // Don't change loading state on token refresh
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Refetch profile when user is updated
        console.log('[Auth] User updated, refetching profile');
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
          console.error('[Auth] Error updating user profile:', error);
        }
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth state listener');
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [setUser, setLoading, clearUser]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
