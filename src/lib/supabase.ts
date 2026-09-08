import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache em memoria do cliente Supabase para reutilizacao eficiente
let _cachedClient: SupabaseClient | null = null;
let _cachedUrl: string = '';
let _cachedKey: string = '';

// Normaliza e corrige automaticamente formatos comuns de URLs do Supabase
export function normalizeSupabaseUrl(inputUrl: string): string {
  if (!inputUrl) return '';
  let trimmed = inputUrl.trim();

  // Se o usuario copiou a URL da barra do navegador na dashboard (ex: https://supabase.com/dashboard/project/abcdefghij)
  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Remove caminhos finais como /rest/v1, /auth/v1, /settings/api ou barras no final
  trimmed = trimmed.replace(/\/rest\/v1\/?$/i, '');
  trimmed = trimmed.replace(/\/auth\/v1\/?$/i, '');
  trimmed = trimmed.replace(/\/settings\/api\/?$/i, '');
  trimmed = trimmed.replace(/\/+$/, '');

  // Garante https:// se começou sem protocolo
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
}

// Obtem a URL do Supabase com prioridade para variaveis de ambiente e fallback local
export function getSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('mmd_supabase_url');
      if (local && local.startsWith('http') && !isPlaceholder(local)) {
        return normalizeSupabaseUrl(local);
      }
    } catch {}
  }
  return normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
}

// Obtem a Anon Key do Supabase com prioridade para variaveis de ambiente e fallback local
export function getSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('mmd_supabase_anon_key');
      if (local && local.length > 20 && !isPlaceholder(local)) {
        return local.trim();
      }
    } catch {}
  }
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
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
  rawUrl: string,
  rawAnonKey: string
): Promise<{ success: boolean; error?: string; hasPerfisTable?: boolean; normalizedUrl?: string }> {
  try {
    const url = normalizeSupabaseUrl(rawUrl);
    const anonKey = (rawAnonKey || '').trim();

    if (!url || !url.startsWith('https://')) {
      return { success: false, error: 'A URL do Supabase deve ser um endereço HTTPS válido (ex: https://seu-projeto.supabase.co)' };
    }
    if (!anonKey || anonKey.length < 20) {
      return { success: false, error: 'A chave anon do Supabase é inválida ou muito curta' };
    }

    // 1. Testa a conectividade basica com a raiz da API PostgREST
    try {
      const pingRes = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: 'no-store',
      });

      if (pingRes.status === 401 || pingRes.status === 403) {
        return {
          success: false,
          error: 'Chave anônima pública (anon key) inválida ou não autorizada. Copie a chave "anon public" em Project Settings > API no Supabase.',
        };
      }
    } catch (netErr: any) {
      return {
        success: false,
        error: `Não foi possível conectar ao endereço ${url}. Verifique se o projeto Supabase está ativo. (${netErr.message || 'Erro de rede'})`,
      };
    }

    // 2. Consulta a tabela perfis para testar se ja existe
    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { error } = await testClient
      .from('perfis')
      .select('id')
      .limit(1);

    if (error) {
      // PGRST125 = "Invalid path specified in request URL" (PostgREST indica que a tabela nao existe)
      // 42P01 = "relation public.perfis does not exist"
      const isTableMissing =
        error.code === 'PGRST125' ||
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST200' ||
        error.message?.includes('Invalid path specified in request URL') ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation');

      if (isTableMissing) {
        return {
          success: true,
          hasPerfisTable: false,
          normalizedUrl: url,
          error: 'Conexão com o Supabase estabelecida com sucesso! A tabela "perfis" ainda não foi criada no banco.',
        };
      }

      return {
        success: false,
        error: `Erro retornado pelo Supabase: ${error.message} (Código: ${error.code || 'desconhecido'})`,
      };
    }

    return {
      success: true,
      hasPerfisTable: true,
      normalizedUrl: url,
    };
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
