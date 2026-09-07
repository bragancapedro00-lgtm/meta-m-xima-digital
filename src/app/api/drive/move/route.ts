import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DRIVE_FOLDER_IDS, DRIVE_PHYSICAL_STAGES } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postId,
      fileId,
      sourceFolderId,
      targetFolderId,
      targetStatus,
      fileName,
    }: {
      postId: string;
      fileId: string;
      sourceFolderId?: string;
      targetFolderId: string;
      targetStatus: 'gravado' | 'editado' | 'postado';
      fileName?: string;
    } = body;

    if (!postId || !fileId || !targetFolderId || !targetStatus) {
      return NextResponse.json(
        {
          error: 'Parâmetros obrigatórios ausentes: postId, fileId, targetFolderId, targetStatus.',
        },
        { status: 400 }
      );
    }

    // Valida se a etapa destino é realmente física
    if (!DRIVE_PHYSICAL_STAGES.includes(targetStatus)) {
      return NextResponse.json(
        {
          error: `Etapa ${targetStatus} não é uma etapa com pasta física no Google Drive.`,
        },
        { status: 400 }
      );
    }

    // Se houver token do Google Drive configurado nas variáveis de ambiente, executar chamada real
    const googleToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
    let driveApiSuccess = true;
    let driveApiError: string | undefined;

    if (googleToken) {
      try {
        const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
        url.searchParams.append('addParents', targetFolderId);
        if (sourceFolderId && sourceFolderId !== targetFolderId) {
          url.searchParams.append('removeParents', sourceFolderId);
        }
        url.searchParams.append('fields', 'id, parents, name, mimeType, webViewLink');

        const driveRes = await fetch(url.toString(), {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!driveRes.ok) {
          const errData = await driveRes.json();
          throw new Error(errData.error?.message || 'Falha na API files.update do Google Drive');
        }
      } catch (apiErr: any) {
        driveApiSuccess = false;
        driveApiError = apiErr.message || 'Erro ao comunicar com Google Drive API';
      }
    }

    // Registrar log no Supabase (se configurado)
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('google_drive_sync_logs').insert([
          {
            post_id: postId,
            post_titulo: fileName || 'Conteúdo',
            file_id: fileId,
            file_name: fileName || fileId,
            from_folder_id: sourceFolderId || null,
            to_folder_id: targetFolderId,
            to_folder_name: targetStatus.toUpperCase(),
            status: driveApiSuccess ? 'sucesso' : 'erro',
            erro_mensagem: driveApiError || null,
          },
        ]);

        if (driveApiSuccess) {
          await supabase
            .from('posts')
            .update({
              google_drive_folder_id: targetFolderId,
              google_drive_sync_status: 'sincronizado',
              google_drive_sync_error: null,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', postId);
        } else {
          await supabase
            .from('posts')
            .update({
              google_drive_sync_status: 'pendente',
              google_drive_sync_error: driveApiError,
              atualizado_em: new Date().toISOString(),
            })
            .eq('id', postId);
        }
      } catch (dbErr) {
        console.warn('Erro ao registrar log de sync no Supabase:', dbErr);
      }
    }

    if (!driveApiSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não foi possível sincronizar o arquivo com o Google Drive.',
          details: driveApiError,
          syncStatus: 'pendente',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Arquivo ${fileId} movido com sucesso para a pasta ${targetStatus} (${targetFolderId}).`,
      postId,
      fileId,
      targetFolderId,
      targetStatus,
      syncStatus: 'sincronizado',
    });
  } catch (error: any) {
    console.error('Erro na rota /api/drive/move:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno ao mover arquivo no Google Drive.',
      },
      { status: 500 }
    );
  }
}
