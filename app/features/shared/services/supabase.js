import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL veya Anon Key bulunamadı. Lütfen .env veya app.json dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Kullanıcı login olduğunda status ve pro_expiry_date bilgilerini çeker
 * @param {string} userId - Kullanıcı ID (UUID)
 * @returns {Promise<{status: string, pro_expiry_date: string|null, isPro: boolean}|null>}
 */
export async function getUserStatus(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('status, pro_expiry_date')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Kullanıcı status bilgisi alınırken hata:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Pro expiry date kontrolü
    const isPro = data.status === 'pro' && 
      (data.pro_expiry_date === null || new Date(data.pro_expiry_date) > new Date());

    return {
      status: data.status,
      pro_expiry_date: data.pro_expiry_date,
      isPro
    };
  } catch (error) {
    console.error('getUserStatus hatası:', error);
    return null;
  }
}

/**
 * Mevcut kullanıcının status bilgisini çeker
 * @returns {Promise<{status: string, pro_expiry_date: string|null, isPro: boolean}|null>}
 */
export async function getCurrentUserStatus() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return await getUserStatus(user.id);
  } catch (error) {
    console.error('getCurrentUserStatus hatası:', error);
    return null;
  }
}

/**
 * Kullanıcının Pro durumunu kontrol eder (expiry date dahil)
 * @param {string} userId - Kullanıcı ID (opsiyonel, verilmezse mevcut kullanıcı)
 * @returns {Promise<boolean>}
 */
export async function isUserPro(userId = null) {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      targetUserId = user.id;
    }

    const statusInfo = await getUserStatus(targetUserId);
    
    if (!statusInfo) {
      return false;
    }

    return statusInfo.isPro;
  } catch (error) {
    console.error('isUserPro hatası:', error);
    return false;
  }
}


