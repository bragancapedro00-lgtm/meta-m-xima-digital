import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Perfil, DEFAULT_ROLE_PERMISSIONS } from '@/types';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { isSupabaseConfigured, getSupabaseClient, supabase } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEAM_FILE = path.join(DATA_DIR, 'team-members.json');

// Garante que o diretório data/ e o arquivo de membros existem
async function ensureStorageFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(TEAM_FILE);
    } catch {
      await fs.writeFile(TEAM_FILE, JSON.stringify(INITIAL_PROFILES, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Erro ao inicializar arquivo de membros:', err);
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Retorna todos os membros persistidos no servidor (arquivo local + Supabase + defaults)
export async function getStoredTeamMembers(): Promise<Perfil[]> {
  await ensureStorageFile();

  let fileProfiles: Perfil[] = [];
  try {
    const raw = await fs.readFile(TEAM_FILE, 'utf-8');
    if (raw && raw.trim()) {
      fileProfiles = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Erro ao ler team-members.json:', err);
  }

  // Se o arquivo estiver vazio, usa os perfis iniciais
  if (!fileProfiles || fileProfiles.length === 0) {
    fileProfiles = [...INITIAL_PROFILES];
  }

  // Tenta sincronizar com Supabase se estiver configurado
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      const { data: dbProfiles, error: fetchErr } = await client
        .from('perfis')
        .select('*')
        .order('criado_em', { ascending: true });

      if (fetchErr) {
        console.warn('[Supabase] Erro ao buscar perfis:', fetchErr.message);
      } else if (dbProfiles && dbProfiles.length > 0) {
        // Merge Supabase com local (Supabase tem prioridade para perfis existentes)
        const profileMap = new Map<string, Perfil>();
        for (const p of fileProfiles) {
          profileMap.set(p.email.toLowerCase(), p);
        }
        for (const dbP of dbProfiles) {
          profileMap.set(dbP.email.toLowerCase(), {
            id: dbP.id,
            nome: dbP.nome,
            email: dbP.email.toLowerCase(),
            avatar_url: dbP.avatar_url,
            cargo: dbP.cargo,
            role: dbP.role,
            status: dbP.status || 'ativo',
            permissoes: dbP.permissoes,
            senha: dbP.senha || '123456',
            criado_em: dbP.criado_em,
          });
        }
        fileProfiles = Array.from(profileMap.values());

        // Atualiza o arquivo local em background para que permaneça sincronizado
        try {
          await fs.writeFile(TEAM_FILE, JSON.stringify(fileProfiles, null, 2), 'utf-8');
        } catch {}
      } else if (dbProfiles && dbProfiles.length === 0 && fileProfiles.length > 0) {
        // Supabase esta configurado mas sem registros ainda: faz sync automatico dos locais para nuvem
        console.log('[Supabase] Tabela perfis vazia. Sincronizando automaticamente colaboradores locais...');
        for (const p of fileProfiles) {
          await upsertProfileToSupabase(p);
        }
        console.log('[Supabase] ✅ Colaboradores sincronizados no Supabase com sucesso.');
      }
    } catch (err) {
      console.warn('[Supabase] Falha na sincronização remota do Supabase:', err);
    }
  }

  return fileProfiles;
}

// Auxiliar para upsert seguro no Supabase tratando tipos e constraints
async function upsertProfileToSupabase(member: Perfil): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const cleanEmail = member.email.trim().toLowerCase();
    const isUuid = UUID_REGEX.test(member.id);

    let supabaseId = isUuid ? member.id : undefined;

    // Se o ID local não for UUID, busca o UUID já cadastrado no Supabase para esse e-mail
    if (!supabaseId) {
      const { data: existing } = await client
        .from('perfis')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing?.id) {
        supabaseId = existing.id;
      } else {
        supabaseId = crypto.randomUUID();
      }
    }

    const payload: any = {
      id: supabaseId,
      nome: member.nome,
      email: cleanEmail,
      avatar_url: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.nome)}`,
      cargo: member.cargo,
      role: member.role,
      status: member.status || 'ativo',
      permissoes: member.permissoes || DEFAULT_ROLE_PERMISSIONS[member.role] || DEFAULT_ROLE_PERMISSIONS.editor,
      senha: member.senha || '123456',
    };

    const { error } = await client
      .from('perfis')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.error(`[Supabase] Erro ao sincronizar perfil ${cleanEmail}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] ✅ Perfil ${cleanEmail} sincronizado automaticamente no Supabase.`);
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase] Falha de conexao ao sincronizar ${member.email}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

// Salva ou atualiza um membro no servidor (arquivo JSON e Supabase)
export async function saveStoredTeamMember(member: Perfil): Promise<Perfil> {
  await ensureStorageFile();

  const currentMembers = await getStoredTeamMembers();
  const cleanEmail = member.email.trim().toLowerCase();

  const existingIndex = currentMembers.findIndex(
    (p) => p.id === member.id || p.email.trim().toLowerCase() === cleanEmail
  );

  let updatedList: Perfil[];
  const finalMember: Perfil = {
    ...member,
    email: cleanEmail,
    id: member.id || crypto.randomUUID(),
    permissoes:
      member.permissoes ||
      DEFAULT_ROLE_PERMISSIONS[member.role] ||
      DEFAULT_ROLE_PERMISSIONS.editor,
    senha: member.senha || '123456',
    status: member.status || 'ativo',
  };

  if (existingIndex >= 0) {
    updatedList = [...currentMembers];
    updatedList[existingIndex] = {
      ...currentMembers[existingIndex],
      ...finalMember,
    };
  } else {
    updatedList = [...currentMembers, finalMember];
  }

  try {
    await fs.writeFile(TEAM_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao escrever em team-members.json:', err);
  }

  // Sincroniza automaticamente com Supabase se configurado
  if (isSupabaseConfigured()) {
    await upsertProfileToSupabase(finalMember);
  }

  return finalMember;
}

// Remove um membro do servidor
export async function deleteStoredTeamMember(id: string): Promise<boolean> {
  await ensureStorageFile();

  const currentMembers = await getStoredTeamMembers();
  const memberToDelete = currentMembers.find((m) => m.id === id);
  const updatedList = currentMembers.filter((m) => m.id !== id);

  try {
    await fs.writeFile(TEAM_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao atualizar team-members.json após exclusão:', err);
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (memberToDelete?.email) {
        await client.from('perfis').delete().eq('email', memberToDelete.email.toLowerCase());
      } else if (UUID_REGEX.test(id)) {
        await client.from('perfis').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Aviso: falha ao deletar membro no Supabase:', err);
    }
  }

  return true;
}

// Sincroniza todos os perfis armazenados para o Supabase
export async function syncAllMembersToSupabase(): Promise<{ success: boolean; synced: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, synced: 0, error: 'Supabase não está configurado' };
  }

  const members = await getStoredTeamMembers();
  let count = 0;
  for (const m of members) {
    const res = await upsertProfileToSupabase(m);
    if (res.success) count++;
  }

  return { success: true, synced: count };
}

// Gera um token de convite autossuficiente (URL-safe base64) contendo os dados do membro
export function generateInviteToken(member: Perfil): string {
  const payload = {
    id: member.id,
    nome: member.nome,
    email: member.email.trim().toLowerCase(),
    cargo: member.cargo,
    role: member.role,
    senha: member.senha || '123456',
    status: member.status || 'convidado',
    permissoes: member.permissoes,
    ts: Date.now(),
  };

  const jsonStr = JSON.stringify(payload);
  const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  return base64;
}

// Decodifica e valida o token de convite
export function parseInviteToken(token: string): Partial<Perfil> | null {
  try {
    const jsonStr = Buffer.from(token, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);

    if (!parsed.email || !parsed.nome) {
      return null;
    }

    return {
      id: parsed.id || `p-${Date.now()}`,
      nome: parsed.nome,
      email: parsed.email.toLowerCase(),
      cargo: parsed.cargo || 'Colaborador',
      role: parsed.role || 'social_media',
      status: 'ativo',
      senha: parsed.senha || '123456',
      permissoes:
        parsed.permissoes ||
        DEFAULT_ROLE_PERMISSIONS[parsed.role as keyof typeof DEFAULT_ROLE_PERMISSIONS] ||
        DEFAULT_ROLE_PERMISSIONS.editor,
    };
  } catch (err) {
    return null;
  }
}
