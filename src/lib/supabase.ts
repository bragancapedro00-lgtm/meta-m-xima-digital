import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  const isPlaceholderUrl =
    !supabaseUrl ||
    supabaseUrl.includes('seu-projeto') ||
    supabaseUrl.includes('mock-instance') ||
    supabaseUrl.includes('placeholder');

  const isPlaceholderKey =
    !supabaseAnonKey ||
    supabaseAnonKey.includes('sua-chave') ||
    supabaseAnonKey.includes('mock-anon-key') ||
    supabaseAnonKey.includes('dummy');

  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    !isPlaceholderUrl &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20 &&
    !isPlaceholderKey
  );
};

// Instância do Supabase garantida como SupabaseClient para o TypeScript,
// enquanto isSupabaseConfigured() controla se chamadas reais são efetuadas.
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-instance.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);
