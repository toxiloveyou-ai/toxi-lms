import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuthCheck() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return {
    user,
    loading,
    requireAuth,
    isAuthModalOpen,
    setIsAuthModalOpen
  };
}
