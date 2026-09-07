import fs from 'fs/promises';
import path from 'path';
import { Perfil, DEFAULT_ROLE_PERMISSIONS } from '@/types';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbProfiles } = await supabase
        .from('perfis')
        .select('*')
        .order('criado_em', { ascending: true });

      if (dbProfiles && dbProfiles.length > 0) {
        // Merge Supabase com local (Supabase tem prioridade para perfis existentes)
        const profileMap = new Map<string, Perfil>();
        for (const p of fileProfiles) {
          profileMap.set(p.email.toLowerCase(), p);
        }
        for (const dbP of dbProfiles) {
          profileMap.set(dbP.email.toLowerCase(), dbP as Perfil);
        }
        fileProfiles = Array.from(profileMap.values());
      }
    } catch (err) {
      console.warn('Aviso: falha na sincronização remota do Supabase:', err);
    }
  }

  return fileProfiles;
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

  // Sincroniza com Supabase se configurado
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('perfis').upsert({
        id: finalMember.id,
        nome: finalMember.nome,
        email: finalMember.email,
        avatar_url: finalMember.avatar_url,
        cargo: finalMember.cargo,
        role: finalMember.role,
        status: finalMember.status,
        permissoes: finalMember.permissoes,
        senha: finalMember.senha,
      });
    } catch (err) {
      console.warn('Aviso: falha ao salvar membro no Supabase:', err);
    }
  }

  return finalMember;
}

// Remove um membro do servidor
export async function deleteStoredTeamMember(id: string): Promise<boolean> {
  await ensureStorageFile();

  const currentMembers = await getStoredTeamMembers();
  const updatedList = currentMembers.filter((m) => m.id !== id);

  try {
    await fs.writeFile(TEAM_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao atualizar team-members.json após exclusão:', err);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('perfis').delete().eq('id', id);
    } catch (err) {
      console.warn('Aviso: falha ao deletar membro no Supabase:', err);
    }
  }

  return true;
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
