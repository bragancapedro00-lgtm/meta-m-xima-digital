import { NextRequest, NextResponse } from 'next/server';
import {
  generateIdeas,
  generateScript,
  generateCaption,
  generateCarousel,
  generateAd,
  generateVariations,
  improveContent,
  analyzePerformance,
  generateStrategy,
  DEFAULT_GEMINI_MODEL,
} from '@/lib/ai/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AIToolType, BrandContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      input,
      brandContext,
      userId,
      projectId,
    }: {
      type: AIToolType;
      input: Record<string, unknown>;
      brandContext?: Partial<BrandContext>;
      userId?: string;
      projectId?: string;
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Parâmetro "type" é obrigatório.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'A chave GEMINI_API_KEY não está configurada no servidor. Configure a variável no ambiente (.env.local ou Vercel) para ativar o Gemini.',
          code: 'GEMINI_KEY_MISSING',
        },
        { status: 503 }
      );
    }

    let result: unknown;

    switch (type) {
      case 'ideias':
        result = await generateIdeas(input as any, brandContext);
        break;

      case 'roteiro':
        result = await generateScript(input as any, brandContext);
        break;

      case 'legenda':
        result = await generateCaption(input as any, brandContext);
        break;

      case 'carrossel':
        result = await generateCarousel(input as any, brandContext);
        break;

      case 'anuncio':
        result = await generateAd(input as any, brandContext);
        break;

      case 'variacoes':
        result = await generateVariations(input as any, brandContext);
        break;

      case 'melhorar':
        result = await generateImproveContent(input as any, brandContext);
        break;

      case 'performance':
        result = await analyzePerformance(input as any, brandContext);
        break;

      case 'estrategia':
        result = await generateStrategy(input as any, brandContext);
        break;

      default:
        return NextResponse.json(
          { error: `Tipo de ferramenta de IA desconhecido: ${type}` },
          { status: 400 }
        );
    }

    // Registrar geração no Supabase (se configurado) para histórico e auditoria
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('ai_generations').insert({
          user_id: userId || null,
          project_id: projectId || 'default',
          type,
          input_context: input,
          output: typeof result === 'string' ? result : JSON.stringify(result),
          model: DEFAULT_GEMINI_MODEL,
        });
      } catch (logErr) {
        console.warn('Não foi possível gravar log em ai_generations:', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      type,
      model: DEFAULT_GEMINI_MODEL,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/generate:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro inesperado ao processar solicitação de IA.',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

function generateImproveContent(input: any, brandContext?: Partial<BrandContext>) {
  return improveContent(input, brandContext);
}
