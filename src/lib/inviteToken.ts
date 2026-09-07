import { Perfil, DEFAULT_ROLE_PERMISSIONS } from '@/types';

// Codifica os dados do colaborador em um token URL-safe que funciona em qualquer navegador/dispositivo
export function encodeInviteToken(member: Partial<Perfil>): string {
  const payload = {
    id: member.id,
    nome: member.nome,
    email: member.email?.trim().toLowerCase(),
    cargo: member.cargo,
    role: member.role,
    senha: member.senha || '123456',
    status: member.status || 'convidado',
    permissoes: member.permissoes,
    ts: Date.now(),
  };

  const jsonStr = JSON.stringify(payload);
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    return Buffer.from(jsonStr, 'utf-8').toString('base64url');
  }
}

// Decodifica e valida o token de convite em qualquer dispositivo
export function decodeInviteToken(token: string): Partial<Perfil> | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      jsonStr = decodeURIComponent(escape(atob(base64)));
    } else {
      jsonStr = Buffer.from(token, 'base64url').toString('utf-8');
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed.email || !parsed.nome) return null;

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
