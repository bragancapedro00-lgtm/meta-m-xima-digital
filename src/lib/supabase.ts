import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache em memoria do cliente Supabase para reutilizacao eficiente
let _cachedClient: SupabaseClient | null = null;
let _cachedUrl: string = '';
let _cachedKey: string = '';

// Obtem a URL do Supabase com prioridade para variaveis de ambiente e fallback local
export function getSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('mmd_supabase_url');
      if (local && local.startsWith('http') && !isPlaceholder(local)) {
        return local;
      }
    } catch {}
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

// Obtem a Anon Key do Supabase com prioridade para variaveis de ambiente e fallback local
export function getSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('mmd_supabase_anon_key');
      if (local && local.length > 20 && !isPlaceholder(local)) {
        return local;
      }
    } catch {}
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function isPlaceholder(val: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('seu-projeto') ||
    lower.includes('mock-instance') ||
    lower.includes('placeholder') ||
    lower.includes('sua-chave') ||
    lower.includes('mock-anon-key') ||
    lower.includes('dummy')
  );
}

// Verifica se o Supabase esta configurado com credenciais validas (nao-placeholder)
export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return Boolean(
    url &&
    url.startsWith('http') &&
    !isPlaceholder(url) &&
    key &&
    key.length > 20 &&
    !isPlaceholder(key)
  );
};

// Retorna ou instancia o cliente Supabase adequado
export function getSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const configured = isSupabaseConfigured();

  const effectiveUrl = configured ? url : 'https://placeholder-instance.supabase.co';
  const effectiveKey = configured ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  if (_cachedClient && _cachedUrl === effectiveUrl && _cachedKey === effectiveKey) {
    return _cachedClient;
  }

  _cachedClient = createClient(effectiveUrl, effectiveKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  _cachedUrl = effectiveUrl;
  _cachedKey = effectiveKey;

  return _cachedClient;
}

// Testa conexao com credenciais informadas sem alterar o estado global
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; error?: string; hasPerfisTable?: boolean }> {
  try {
    if (!url || !url.startsWith('http')) {
      return { success: false, error: 'A URL do Supabase deve começar com https://' };
    }
    if (!anonKey || anonKey.length < 20) {
      return { success: false, error: 'A chave anon do Supabase é inválida ou muito curta' };
    }

    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Testa consulta a tabela perfis
    const { data, error } = await testClient
      .from('perfis')
      .select('id')
      .limit(1);

    if (error) {
      // Se o erro for de tabela inexistente (42P01 em Postgres)
      if (error.code === '42P01' || error.message?.includes('relation "public.perfis" does not exist')) {
        return {
          success: true,
          hasPerfisTable: false,
          error: 'Conectado ao Supabase, mas a tabela "perfis" ainda não foi criada. Execute o script schema.sql no SQL Editor.',
        };
      }
      return { success: false, error: `Erro retornado pelo Supabase: ${error.message} (Código: ${error.code || 'desconhecido'})` };
    }

    return { success: true, hasPerfisTable: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha de conexão com os servidores do Supabase' };
  }
}

// Proxy transparente para manter retrocompatibilidade com imports existentes:
// import { supabase } from '@/lib/supabase'
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
