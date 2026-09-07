import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredTeamMembers,
  saveStoredTeamMember,
  deleteStoredTeamMember,
} from '@/lib/teamStore';
import { Perfil } from '@/types';

// Retorna todos os colaboradores registrados no servidor
export async function GET() {
  try {
    const members = await getStoredTeamMembers();
    return NextResponse.json(
      { success: true, members },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao carregar colaboradores' },
      { status: 500 }
    );
  }
}

// Salva ou atualiza um colaborador no servidor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = body.member as Perfil;

    if (!member || !member.email || !member.nome) {
      return NextResponse.json(
        { success: false, error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      );
    }

    const saved = await saveStoredTeamMember(member);
    return NextResponse.json({ success: true, member: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao salvar colaborador' },
      { status: 500 }
    );
  }
}

// Deleta um colaborador do servidor
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do membro não fornecido' },
        { status: 400 }
      );
    }

    await deleteStoredTeamMember(id);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao deletar colaborador' },
      { status: 500 }
    );
  }
}
