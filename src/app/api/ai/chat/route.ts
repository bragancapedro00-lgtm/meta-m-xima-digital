import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant, DEFAULT_GEMINI_MODEL } from '@/lib/ai/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { BrandContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      brandContext,
      conversationId,
      previousInteractionId,
      userId,
    }: {
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      brandContext?: Partial<BrandContext>;
      conversationId?: string;
      previousInteractionId?: string;
      userId?: string;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Array de mensagens é obrigatório.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'A chave GEMINI_API_KEY não está configurada no servidor. Configure a variável para utilizar o Assistente Livre.',
          code: 'GEMINI_KEY_MISSING',
        },
        { status: 503 }
      );
    }

    const { text, interactionId } = await chatWithAssistant(
      messages,
      brandContext,
      previousInteractionId
    );

    // Se houver conversa salva no Supabase, gravar a mensagem do assistente
    if (conversationId && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('ai_messages').insert([
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
            model: DEFAULT_GEMINI_MODEL,
          },
        ]);
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } catch (dbErr) {
        console.warn('Erro ao salvar mensagem no Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: text,
      interactionId,
      model: DEFAULT_GEMINI_MODEL,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/chat:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro inesperado na conversa com o Assistente.',
      },
      { status: 500 }
    );
  }
}
