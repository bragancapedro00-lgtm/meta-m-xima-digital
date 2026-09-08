import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  testSupabaseConnection,
} from '@/lib/supabase';
import { syncAllMembersToSupabase, getStoredTeamMembers } from '@/lib/teamStore';

const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');

// Retorna status atual e dados mascarados do Supabase
export async function GET() {
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    const isConfigured = isSupabaseConfigured();

    let maskedKey = '';
    if (key && key.length > 8) {
      maskedKey = `${key.slice(0, 6)}...${key.slice(-4)}`;
    }

    let connectionTest: { success: boolean; hasPerfisTable?: boolean; error?: string } = {
      success: false,
      hasPerfisTable: false,
    };
    if (isConfigured) {
      connectionTest = await testSupabaseConnection(url, key);
    }

    const members = await getStoredTeamMembers();

    return NextResponse.json({
      success: true,
      isConfigured,
      url: isConfigured ? url : '',
      maskedKey,
      hasPerfisTable: connectionTest.hasPerfisTable,
      connectionOk: connectionTest.success,
      connectionError: connectionTest.error,
      localProfilesCount: members.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro ao carregar configurações do Supabase' },
      { status: 500 }
    );
  }
}

// Salva e valida credenciais do Supabase, sincronizando membros automaticamente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Acao de sincronizacao manual
    if (body.action === 'sync') {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { success: false, error: 'Configure a URL e a Anon Key do Supabase antes de sincronizar.' },
          { status: 400 }
        );
      }

      const syncResult = await syncAllMembersToSupabase();
      return NextResponse.json({
        success: syncResult.success,
        syncedCount: syncResult.synced,
        message: `Sincronização concluída: ${syncResult.synced} colaboradores sincronizados com o Supabase.`,
      });
    }

    const { url, anonKey } = body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe uma URL válida do Supabase (iniciada com https://).' },
        { status: 400 }
      );
    }

    if (!anonKey || typeof anonKey !== 'string' || anonKey.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe a Chave Anônima (Anon Key) pública do Supabase.' },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    // 1. Testa a conexao real antes de persistir
    const testResult = await testSupabaseConnection(cleanUrl, cleanKey);
    if (!testResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: testResult.error || 'Falha ao conectar à instância do Supabase. Verifique a URL e a chave.',
          hasPerfisTable: false,
        },
        { status: 400 }
      );
    }

    // 2. Atualiza variaveis em memoria no servidor imediatamente
    process.env.NEXT_PUBLIC_SUPABASE_URL = cleanUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = cleanKey;

    // 3. Persiste no arquivo .env.local preservando outras configuracoes
    let currentEnv = '';
    try {
      currentEnv = await fs.readFile(ENV_LOCAL_PATH, 'utf-8');
    } catch {
      currentEnv = '';
    }

    let updatedEnv = currentEnv;

    if (updatedEnv.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
      updatedEnv = updatedEnv.replace(
        /NEXT_PUBLIC_SUPABASE_URL=.*/,
        `NEXT_PUBLIC_SUPABASE_URL=${cleanUrl}`
      );
    } else {
      updatedEnv += `\nNEXT_PUBLIC_SUPABASE_URL=${cleanUrl}`;
    }

    if (updatedEnv.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      updatedEnv = updatedEnv.replace(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cleanKey}`
      );
    } else {
      updatedEnv += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${cleanKey}`;
    }

    await fs.writeFile(ENV_LOCAL_PATH, updatedEnv.trim() + '\n', 'utf-8');

    // 4. Sincroniza automaticamente todos os perfis locais para a tabela perfis do Supabase
    let syncedCount = 0;
    if (testResult.hasPerfisTable) {
      const syncRes = await syncAllMembersToSupabase();
      syncedCount = syncRes.synced;
    }

    return NextResponse.json({
      success: true,
      message: testResult.hasPerfisTable
        ? `✅ Conectado com sucesso! ${syncedCount} colaborador(es) sincronizados no Supabase.`
        : '⚠️ Conectado ao Supabase! A tabela "perfis" precisa ser criada no SQL Editor.',
      hasPerfisTable: testResult.hasPerfisTable,
      syncedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro ao processar configuração do Supabase' },
      { status: 500 }
    );
  }
}
