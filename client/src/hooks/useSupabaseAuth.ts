import { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { name?: string; phone?: string; cpf?: string }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    setLoading(false);
    if (error) setError(error);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) setError(error);
    return { error };
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error);
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);
    if (error) setError(error);
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}
