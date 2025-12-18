import { useState, useEffect } from 'react';
import { supabase, getCurrentUserStatus } from '../../shared/services/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut session'ı kontrol et
    checkSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserStatus(session.user.id);
        } else {
          setUser(null);
          setUserStatus(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserStatus(session.user.id);
      }
    } catch (error) {
      console.error('Session kontrolü hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStatus = async (userId) => {
    try {
      const status = await getCurrentUserStatus();
      setUserStatus(status);
    } catch (error) {
      console.error('Kullanıcı status yükleme hatası:', error);
      setUserStatus(null);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
        await loadUserStatus(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { error: { message: error.message || 'Giriş yapılamadı' } };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
        await loadUserStatus(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { error: { message: error.message || 'Kayıt oluşturulamadı' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL || 'softielplay://auth/callback'}`,
        },
      });

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error: { message: error.message || 'Google ile giriş yapılamadı' } };
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL || 'softielplay://auth/callback'}`,
        },
      });

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error: { message: error.message || 'Apple ile giriş yapılamadı' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      setUser(null);
      setUserStatus(null);
      return { error: null };
    } catch (error) {
      return { error: { message: error.message || 'Çıkış yapılamadı' } };
    }
  };

  const isPro = () => {
    if (!userStatus) return false;
    return userStatus.isPro;
  };

  return {
    user,
    userStatus,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    isPro,
  };
}
