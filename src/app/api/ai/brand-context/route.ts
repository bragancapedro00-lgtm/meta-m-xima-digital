import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { BrandContext } from '@/types';

export const DEFAULT_BRAND_CONTEXT: BrandContext = {
  nome_empresa: 'Meta Máxima Digital',
  nicho: 'Marketing Digital & Tráfego Pago',
  publico_alvo: 'Empresários, infoprodutores e marcas que buscam escala em vendas',
  persona: 'Decisores de 28 a 50 anos focados em ROI, autoridade e conversão consistente',
  produtos: 'Consultoria de Escala, Gestão de Tráfego Pago, Produção de Conteúdo Estratégico',
  servicos: 'Gestão de Meta Ads, Google Ads, Funis de Conversão, Criativos de Alta Conversão',
  diferenciais: 'Estratégias baseadas em dados reais, criativos orientados a conversão e acompanhamento diário de ROI',
  tom_de_voz: 'Profissional, persuasivo, autoritário e direto ao ponto, sem enrolação',
  palavras_obrigatorias: 'escala, conversão, ROI, previsibilidade, autoridade',
  palavras_proibidas: 'fórmula mágica, enriquecer rápido, segredo infalível, hack',
  cta_padrao: 'Clique no link da bio para agendar um diagnóstico estratégico gratuito.',
  regiao_atuacao: 'Brasil e operações internacionais',
  objetivos: 'Geração de leads qualificados, fortalecimento de autoridade e conversão direta',
};

export async function GET() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('brand_context')
        .select('*')
        .order('atualizado_em', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, brandContext: data });
      }
    } catch (err) {
      console.warn('Fallback para brand context padrão:', err);
    }
  }

  return NextResponse.json({ success: true, brandContext: DEFAULT_BRAND_CONTEXT });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brandData: Partial<BrandContext> = body.brandContext;

    if (!brandData || !brandData.nome_empresa) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório no contexto da marca.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('brand_context')
          .upsert({
            project_id: 'default',
            ...brandData,
            atualizado_em: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, brandContext: data });
        }
      } catch (err) {
        console.warn('Erro ao salvar no Supabase, retornando dados locais:', err);
      }
    }

    return NextResponse.json({
      success: true,
      brandContext: { ...DEFAULT_BRAND_CONTEXT, ...brandData },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar contexto da marca.' },
      { status: 500 }
    );
  }
}
