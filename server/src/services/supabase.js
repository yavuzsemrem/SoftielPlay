const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ SUPABASE_URL environment variable bulunamadı');
}

if (!supabaseServiceRoleKey && !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY veya SUPABASE_ANON_KEY environment variable bulunamadı');
}

// Service role key varsa onu kullan (admin işlemleri için), yoksa anon key kullan
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

// Supabase client (server-side)
const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

module.exports = {
  supabase
};
