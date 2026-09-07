import { GoogleGenAI } from '@google/genai';
import {
  BrandContext,
  GeneratedIdeaItem,
  GeneratedScript,
  GeneratedCaptionVersion,
  GeneratedCarousel,
  GeneratedAd,
  GeneratedVariationItem,
  ContentImprovementAnalysis,
  PerformanceAIAnalysis,
  MarketingStrategyPlan,
} from '@/types';

// ==============================================================================
// CONFIGURAÇÃO DO MODELO GEMINI
// ==============================================================================
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * Inicializa o cliente oficial do Google Gemini Server-Side.
 * Nunca expor ou chamar este cliente no browser.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não configurada no servidor. Adicione GEMINI_API_KEY nas variáveis de ambiente do projeto.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Monta o bloco de contexto da marca que é injetado em todas as requisições.
 */
export function buildBrandContextInstruction(brand?: Partial<BrandContext> | null): string {
  if (!brand || !brand.nome_empresa) {
    return `
DIRETRIZES DA MARCA:
- Empresa: Meta Máxima Digital
- Nicho: Marketing Digital & Tráfego Pago
- Público: Empresários, infoprodutores e líderes de vendas
- Tom de Voz: Profissional, persuasivo, autoritário e direto ao ponto
- CTA padrão: Agende um diagnóstico estratégico gratuito.
- Palavras proibidas: promessas milagrosas, enriquecer fácil, hack infalível.
`;
  }

  return `
DIRETRIZES OFICIAIS DA MARCA (Siga rigorosamente estas instruções):
- Nome da Empresa: ${brand.nome_empresa}
- Nicho de Mercado: ${brand.nicho || 'Não especificado'}
- Público-Alvo: ${brand.publico_alvo || 'Não especificado'}
${brand.persona ? `- Persona Detalhada: ${brand.persona}` : ''}
- Produtos Principais: ${brand.produtos || 'Não especificado'}
${brand.servicos ? `- Serviços Oferecidos: ${brand.servicos}` : ''}
${brand.diferenciais ? `- Diferenciais Competitivos: ${brand.diferenciais}` : ''}
- Tom de Comunicação / Voz: ${brand.tom_de_voz || 'Profissional e persuasivo'}
${brand.palavras_obrigatorias ? `- Palavras/Termos Recomendados: ${brand.palavras_obrigatorias}` : ''}
${brand.palavras_proibidas ? `- PALAVRAS PROIBIDAS (NUNCA USE): ${brand.palavras_proibidas}` : ''}
${brand.cta_padrao ? `- CTA Padrão da Marca: ${brand.cta_padrao}` : ''}
${brand.regiao_atuacao ? `- Região de Atuação: ${brand.regiao_atuacao}` : ''}
${brand.objetivos ? `- Objetivos de Negócio: ${brand.objetivos}` : ''}
`;
}

/**
 * Função utilitária para chamar a API de Interactions do Gemini com tratamento de erros.
 */
async function callGeminiInteraction(prompt: string, modelOverride?: string): Promise<string> {
  const client = getGeminiClient();
  const model = modelOverride || DEFAULT_GEMINI_MODEL;

  const interaction = await client.interactions.create({
    model,
    input: prompt,
  });

  const output = interaction.output_text;
  if (!output) {
    throw new Error('O Gemini não retornou nenhum texto de saída.');
  }

  return output.trim();
}

/**
 * Extrai e converte blocos JSON de respostas markdown do Gemini.
 */
function parseJsonFromMarkdown<T>(text: string, fallback: T): T {
  try {
    // Remover blocos ```json ... ``` ou ``` ... ```
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (error) {
    console.warn('Falha ao fazer parse de JSON do Gemini, usando fallback:', error);
    return fallback;
  }
}

// ==============================================================================
// 1. GERAR IDEIAS
// ==============================================================================
export interface GenerateIdeasInput {
  cliente_projeto?: string;
  nicho?: string;
  publico?: string;
  produto_servico?: string;
  objetivo?: string;
  plataforma?: string;
  etapa_funil?: string;
  formato?: string;
  tema?: string;
  quantidade?: number;
  tom_comunicacao?: string;
  informacoes_adicionais?: string;
}

export async function generateIdeas(
  input: GenerateIdeasInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedIdeaItem[]> {
  const brandPrompt = buildBrandContextInstruction(brandContext);
  const qtd = input.quantidade || 5;

  const prompt = `
Você é um estrategista de conteúdo sênior e copywriter de alta performance.
${brandPrompt}

PARÂMETROS DA SOLICITAÇÃO:
- Cliente / Projeto: ${input.cliente_projeto || 'Geral'}
- Nicho: ${input.nicho || 'Definido nas diretrizes da marca'}
- Público-Alvo: ${input.publico || 'Definido nas diretrizes da marca'}
- Produto / Serviço: ${input.produto_servico || 'Definido nas diretrizes da marca'}
- Objetivo: ${input.objetivo || 'Engajamento e Conversão'}
- Plataforma: ${input.plataforma || 'Instagram'}
- Etapa do Funil: ${input.etapa_funil || 'topo'} (topo, meio ou fundo)
- Formato: ${input.formato || 'Reels / Vídeo curto'}
- Tema Central: ${input.tema || 'Conteúdo relevante e de alto valor'}
- Tom de Comunicação: ${input.tom_comunicacao || 'Autoritário e envolvente'}
${input.informacoes_adicionais ? `- Informações Adicionais: ${input.informacoes_adicionais}` : ''}

TAREFA:
Crie exatamente ${qtd} ideias estruturadas de conteúdo prontas para produção.
Para cada ideia, forneça:
- titulo: Título direto e claro
- hook: Gancho de retenção irresistível nos primeiros 3 segundos
- conceito: Ideia central e como será desenvolvida
- objetivo: O que esse conteúdo conquista
- formato: Formato ideal (ex: Reels, Carrossel, Vídeo longo)
- etapa_funil: 'topo', 'meio' ou 'fundo'
- cta: Chamada para ação clara
- justificativa_estrategica: Por que esta ideia converte e se conecta com a persona

Retorne EXCLUSIVAMENTE um array JSON válido sem texto antes ou depois, no formato:
[
  {
    "titulo": "...",
    "hook": "...",
    "conceito": "...",
    "objetivo": "...",
    "formato": "...",
    "etapa_funil": "topo",
    "cta": "...",
    "justificativa_estrategica": "..."
  }
]
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedIdeaItem[]>(rawOutput, []);
}

// ==============================================================================
// 2. CRIAR ROTEIRO
// ==============================================================================
export interface GenerateScriptInput {
  tema: string;
  publico?: string;
  objetivo?: string;
  plataforma?: string;
  funil?: string;
  duracao?: '15 segundos' | '30 segundos' | '45 segundos' | '60 segundos' | '90 segundos';
  tom_de_voz?: string;
  produto_servico?: string;
  oferta?: string;
  informacoes_adicionais?: string;
  ideia_origem?: string;
}

export async function generateScript(
  input: GenerateScriptInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedScript> {
  const brandPrompt = buildBrandContextInstruction(brandContext);

  const prompt = `
Você é um diretor de criação e roteirista profissional para mídias digitais.
${brandPrompt}

PARÂMETROS DO ROTEIRO:
- Tema: ${input.tema}
${input.ideia_origem ? `- Ideia de Origem: ${input.ideia_origem}` : ''}
- Público: ${input.publico || 'Público da marca'}
- Objetivo: ${input.objetivo || 'Retenção e conversão'}
- Plataforma: ${input.plataforma || 'Instagram Reels / TikTok'}
- Etapa do Funil: ${input.funil || 'meio'}
- Duração Alvo: ${input.duracao || '45 segundos'}
- Tom de Voz: ${input.tom_de_voz || 'Dinâmico, persuasivo e natural'}
- Produto / Serviço: ${input.produto_servico || 'Serviço da marca'}
${input.oferta ? `- Oferta / Chamada: ${input.oferta}` : ''}
${input.informacoes_adicionais ? `- Detalhes Adicionais: ${input.informacoes_adicionais}` : ''}

ESTRUTURA OBRIGATÓRIA:
1. HOOK: Os primeiros 3 segundos para quebrar padrão e prender atenção.
2. DESENVOLVIMENTO: Conteúdo ágil, prático e envolvente.
3. PROVA / ARGUMENTAÇÃO: Demonstração de autoridade, exemplo ou dado.
4. CTA: Chamada clara e objetiva para ação.
5. CENAS DETALHADAS: cena a cena com corte, indicação visual, sugestão de B-roll, texto falado e texto na tela.

Retorne EXCLUSIVAMENTE um objeto JSON válido no formato:
{
  "titulo": "Título do Roteiro",
  "duracao": "${input.duracao || '45 segundos'}",
  "hook": "Texto do gancho inicial...",
  "desenvolvimento": "Texto do desenvolvimento...",
  "prova": "Texto da prova ou argumentação...",
  "cta": "Texto da chamada para ação...",
  "cenas": [
    {
      "cena_numero": 1,
      "indicacao_visual": "O que a câmera mostra",
      "b_roll": "Sugestão de inserção de corte visual ou tela",
      "texto_falado": "Fala do apresentador palavra por palavra",
      "texto_na_tela": "Legenda em destaque ou texto gráfico",
      "corte_direcao": "Rápido / Zoom / Transição"
    }
  ],
  "cta_final": "Texto final de encerramento e direcionamento"
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedScript>(rawOutput, {
    titulo: input.tema,
    duracao: input.duracao || '45 segundos',
    hook: '',
    desenvolvimento: '',
    prova: '',
    cta: '',
    cenas: [],
    cta_final: '',
  });
}

// ==============================================================================
// 3. CRIAR LEGENDA
// ==============================================================================
export interface GenerateCaptionInput {
  tema_ou_conteudo: string;
  roteiro_base?: string;
  plataforma?: string;
  objetivo?: string;
  publico?: string;
  tom?: string;
  cta?: string;
  incluir_hashtags?: boolean;
}

export async function generateCaption(
  input: GenerateCaptionInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedCaptionVersion[]> {
  const brandPrompt = buildBrandContextInstruction(brandContext);

  const prompt = `
Você é um copywriter especialista em redes sociais de alta retenção e conversão.
${brandPrompt}

PARÂMETROS DA LEGENDA:
- Tema ou Conteúdo: ${input.tema_ou_conteudo}
${input.roteiro_base ? `- Roteiro Base: ${input.roteiro_base}` : ''}
- Plataforma: ${input.plataforma || 'Instagram'}
- Objetivo: ${input.objetivo || 'Engajamento e Comentários'}
- Público: ${input.publico || 'Público da marca'}
- Tom: ${input.tom || 'Envolvente, persuasivo e direto'}
${input.cta ? `- CTA Solicitado: ${input.cta}` : ''}

TAREFA:
Crie 3 versões diferentes de legenda com abordagens estratégicas complementares:
- Versão 1: Direta e Focada em Dor/Solução
- Versão 2: Storytelling e Conexão Emocional
- Versão 3: Curta, Impactante e Pronta para Compartilhamento

Cada versão deve conter:
- versao: número da versão (1, 2, 3)
- titulo_chamada: Primeira linha impactante para não cortar no 'ver mais'
- legenda: Corpo completo formatado com quebras de linha limpas
- cta: Chamada final forte
- hashtags: Lista de 5 a 10 hashtags estratégicas e sem poluição

Retorne EXCLUSIVAMENTE um array JSON no formato:
[
  {
    "versao": 1,
    "titulo_chamada": "...",
    "legenda": "...",
    "cta": "...",
    "hashtags": ["#marketing", "#vendas"]
  }
]
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedCaptionVersion[]>(rawOutput, []);
}

// ==============================================================================
// 4. CRIAR CARROSSEL
// ==============================================================================
export interface GenerateCarouselInput {
  tema: string;
  objetivo?: string;
  publico?: string;
  quantidade_slides?: number;
  plataforma?: string;
  funil?: string;
  cta?: string;
}

export async function generateCarousel(
  input: GenerateCarouselInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedCarousel> {
  const brandPrompt = buildBrandContextInstruction(brandContext);
  const slidesCount = Math.max(3, Math.min(10, input.quantidade_slides || 6));

  const prompt = `
Você é um designer de narrativas e especialista em carrosséis de alto salvamento e compartilhamento.
${brandPrompt}

PARÂMETROS DO CARROSSEL:
- Tema: ${input.tema}
- Objetivo: ${input.objetivo || 'Autoridade e Salvamentos'}
- Público: ${input.publico || 'Público da marca'}
- Quantidade Exata de Slides: ${slidesCount}
- Plataforma: ${input.plataforma || 'Instagram'}
- Etapa do Funil: ${input.funil || 'topo/meio'}
- CTA Final: ${input.cta || 'Salve este carrossel e compartilhe com seu sócio'}

ESTRUTURA DOS SLIDES:
- Slide 1: Capa magnética (Headline curiosa + Promessa forte)
- Slide 2 até ${slidesCount - 1}: Desenvolvimento didático em blocos digeríveis (1 ideia por slide)
- Slide ${slidesCount}: CTA final forte para salvamento/comentário

Para cada slide forneça:
- slide_numero: número inteiro
- tipo: 'capa' | 'conteudo' | 'cta_final'
- titulo: Título ou chamada do slide
- texto: Texto explicativo direto e conciso (máximo 3 frases)
- sugestao_visual: Orientação estética para o designer (cores, ícone, elemento gráfico, foto)

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "tema": "${input.tema}",
  "cta_final": "${input.cta || 'Salvar e compartilhar'}",
  "slides": [
    {
      "slide_numero": 1,
      "tipo": "capa",
      "titulo": "...",
      "texto": "...",
      "sugestao_visual": "..."
    }
  ]
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedCarousel>(rawOutput, {
    tema: input.tema,
    cta_final: '',
    slides: [],
  });
}

// ==============================================================================
// 5. CRIAR ANÚNCIO (META ADS)
// ==============================================================================
export interface GenerateAdInput {
  produto_servico: string;
  oferta: string;
  publico?: string;
  regiao?: string;
  objetivo_campanha?: string;
  etapa_funil?: string;
  plataforma?: string;
  formato?: string;
  tom_comunicacao?: string;
  contexto_meta_ads?: Record<string, unknown>;
}

export async function generateAd(
  input: GenerateAdInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedAd> {
  const brandPrompt = buildBrandContextInstruction(brandContext);

  const prompt = `
Você é um gestor de tráfego pago e copywriter de Meta Ads de elite, focado em ROI e CPL/CPA baixo.
${brandPrompt}

DADOS DA CAMPANHA:
- Produto / Serviço: ${input.produto_servico}
- Oferta Principal: ${input.oferta}
- Público: ${input.publico || 'Público da marca'}
- Região: ${input.regiao || 'Brasil'}
- Objetivo da Campanha: ${input.objetivo_campanha || 'Leads / Conversão'}
- Etapa do Funil: ${input.etapa_funil || 'meio/fundo'}
- Formato: ${input.formato || 'Reels 9:16 / Feed 1:1'}
- Tom de Comunicação: ${input.tom_comunicacao || 'Urgente, persuasivo e profissional'}
${input.contexto_meta_ads ? `- Dados de Métricas Anteriores: ${JSON.stringify(input.contexto_meta_ads)}` : ''}

TAREFA:
Crie uma campanha completa de anúncio com:
1. Headline principal forte (para o criativo e anúncio)
2. Texto principal persuasivo (Primary Text do Meta Ads)
3. Roteiro de vídeo curto (se formato vídeo) ou conceito visual
4. CTA objetivo
5. 3 a 5 variações para testes A/B de criativos (novos hooks, headlines e ângulos)

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "campanha_sugerida": "Nome recomendado para a campanha",
  "publico_sugerido": "Segmentação e público recomendado",
  "formato": "${input.formato || 'Vídeo 9:16'}",
  "headline_principal": "Headline magnética",
  "texto_principal": "Texto persuasivo com quebras de linha e gatilhos",
  "cta": "Saiba Mais / Cadastre-se",
  "roteiro_video": "Roteiro de 30s focado em quebra de objeções",
  "conceito_criativo": "Descrição do criativo e elemento de parada de feed",
  "variacoes": [
    {
      "nome_versao": "Variação A - Ângulo da Dor",
      "hook": "Gancho inicial",
      "headline": "Headline para botão",
      "texto_principal": "Texto alternativo",
      "cta": "Cadastre-se",
      "conceito_criativo": "Visual alternativo"
    }
  ]
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedAd>(rawOutput, {
    campanha_sugerida: '',
    publico_sugerido: '',
    formato: '',
    headline_principal: '',
    texto_principal: '',
    cta: '',
    conceito_criativo: '',
    variacoes: [],
  });
}

// ==============================================================================
// 6. CRIAR VARIAÇÕES
// ==============================================================================
export interface GenerateVariationsInput {
  conteudo_original: {
    titulo?: string;
    hook?: string;
    roteiro?: string;
    legenda?: string;
    cta?: string;
  };
  quantidade_variacoes?: 3 | 5 | 10;
  foco?: string;
}

export async function generateVariations(
  input: GenerateVariationsInput,
  brandContext?: Partial<BrandContext>
): Promise<GeneratedVariationItem[]> {
  const brandPrompt = buildBrandContextInstruction(brandContext);
  const qtd = input.quantidade_variacoes || 3;

  const prompt = `
Você é um especialista em testes de criativos e otimização contínua de conteúdo.
${brandPrompt}

CONTEÚDO ORIGINAL ANALISADO:
- Título: ${input.conteudo_original.titulo || 'Sem título'}
- Hook: ${input.conteudo_original.hook || 'Sem hook definido'}
- Roteiro / Conteúdo: ${input.conteudo_original.roteiro || 'Não fornecido'}
- Legenda: ${input.conteudo_original.legenda || 'Não fornecida'}
- CTA: ${input.conteudo_original.cta || 'Não fornecido'}
${input.foco ? `- Foco da Otimização: ${input.foco}` : ''}

TAREFA:
Crie exatamente ${qtd} variações inovadoras e estratégicas deste conteúdo, mudando o ângulo de abordagem (ex: Curiosidade, Dor Profunda, Quebra de Mito, Prova Irrefutável, Pergunta Provocativa).

Para cada variação forneça:
- id_versao: número
- tipo_variacao: nome da abordagem (ex: Quebra de Mito, Dor Oculta, Estudo de Caso)
- hook: Novo gancho matador
- roteiro_resumo: Novo direcionamento ou roteiro resumido
- legenda: Nova legenda adaptada
- cta: Novo CTA
- conceito: O que muda na percepção do público
- abordagem: Justificativa estratégica

Retorne EXCLUSIVAMENTE um array JSON no formato:
[
  {
    "id_versao": 1,
    "tipo_variacao": "...",
    "hook": "...",
    "roteiro_resumo": "...",
    "legenda": "...",
    "cta": "...",
    "conceito": "...",
    "abordagem": "..."
  }
]
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<GeneratedVariationItem[]>(rawOutput, []);
}

// ==============================================================================
// 7. MELHORAR CONTEÚDO
// ==============================================================================
export interface ImproveContentInput {
  tipo_conteudo: 'ideia' | 'roteiro' | 'legenda' | 'anuncio' | 'carrossel';
  conteudo_atual: string;
  objetivo_melhoria:
    | 'Mais comercial'
    | 'Mais educativo'
    | 'Mais persuasivo'
    | 'Mais curto'
    | 'Mais viral'
    | 'Mais profissional'
    | 'Mais direto'
    | 'Mais emocional';
  detalhes_adicionais?: string;
}

export async function improveContent(
  input: ImproveContentInput,
  brandContext?: Partial<BrandContext>
): Promise<ContentImprovementAnalysis> {
  const brandPrompt = buildBrandContextInstruction(brandContext);

  const prompt = `
Você é um consultor sênior de copywriting e estratégia de conversão.
${brandPrompt}

CONTEÚDO PARA REVISÃO E OTIMIZAÇÃO:
- Tipo: ${input.tipo_conteudo}
- Objetivo de Melhoria Solicitado: ${input.objetivo_melhoria}
- Conteúdo Atual:
"""
${input.conteudo_atual}
"""
${input.detalhes_adicionais ? `- Observações Adicionais: ${input.detalhes_adicionais}` : ''}

TAREFA:
Analise clinicamente o conteúdo atual e forneça:
1. Pontos fortes (o que já funciona bem)
2. Pontos fracos (o que gera dispersão, tédio ou baixa conversão)
3. Oportunidades (ângulos e ganchos não aproveitados)
4. Sugestões práticas de melhoria
5. Versão melhorada completa pronta para uso, atendendo ao objetivo "${input.objetivo_melhoria}"

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "pontos_fortes": ["..."],
  "pontos_fracos": ["..."],
  "oportunidades": ["..."],
  "sugestoes": ["..."],
  "versao_melhorada": {
    "titulo": "Título aprimorado",
    "hook": "Novo hook",
    "corpo_conteudo": "Conteúdo reescrito com alto nível de acabamento",
    "cta": "CTA aprimorado"
  }
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<ContentImprovementAnalysis>(rawOutput, {
    pontos_fortes: [],
    pontos_fracos: [],
    oportunidades: [],
    sugestooes: [],
    versao_melhorada: { corpo_conteudo: input.conteudo_atual },
  });
}

// ==============================================================================
// 8. ANALISAR PERFORMANCE COM DADOS REAIS
// ==============================================================================
export interface AnalyzePerformanceInput {
  dados_disponiveis: {
    tem_meta_ads: boolean;
    tem_pixel: boolean;
    tem_instagram: boolean;
    tem_ga4: boolean;
    resumo_metricas?: Record<string, unknown>;
    top_conteudos?: unknown[];
    piores_conteudos?: unknown[];
  };
  periodo_analise?: string;
  pergunta_especifica?: string;
}

export async function analyzePerformance(
  input: AnalyzePerformanceInput,
  brandContext?: Partial<BrandContext>
): Promise<PerformanceAIAnalysis> {
  const brandPrompt = buildBrandContextInstruction(brandContext);

  const temDadosReais =
    input.dados_disponiveis.tem_meta_ads ||
    input.dados_disponiveis.tem_pixel ||
    input.dados_disponiveis.tem_instagram ||
    input.dados_disponiveis.tem_ga4 ||
    (input.dados_disponiveis.top_conteudos && input.dados_disponiveis.top_conteudos.length > 0);

  if (!temDadosReais) {
    return {
      status_dados: 'dados_insuficientes',
      resumo:
        'Dados insuficientes para análise. Conecte o Instagram, Meta Ads ou Meta Pixel nas integrações do sistema para que a IA analise números reais de conversão, cliques e engajamento.',
      pontos_positivos: [],
      pontos_negativos: [
        'Nenhuma métrica de canais ou anúncios conectada no período selecionado.',
      ],
      padroes_identificados: [],
      conteudos_vencedores: [],
      conteudos_abaixo_media: [],
      recomendacoes: [
        'Acesse a aba Configurações e conecte suas contas oficiais do Meta Ads e Instagram.',
        'Após conectar, sincronize os dados para obter auditoria automatizada de desempenho.',
      ],
      proximos_conteudos_recomendados: [],
    };
  }

  const prompt = `
Você é um diretor de Growth & Performance Intelligence.
${brandPrompt}

REGRA CRÍTICA:
Você deve analisar EXCLUSIVAMENTE os dados reais fornecidos abaixo.
NUNCA invente números, cliques, ROAS ou métricas que não estejam presentes no JSON.
Se uma métrica não constar, declare explicitamente como não disponível.

DADOS REAIS RECEBIDOS:
${JSON.stringify(input.dados_disponiveis, null, 2)}
${input.periodo_analise ? `- Período Selecionado: ${input.periodo_analise}` : ''}
${input.pergunta_especifica ? `- Pergunta Específica: ${input.pergunta_especifica}` : ''}

TAREFA:
Retorne um diagnóstico acionável baseado puramente nesses dados:
- status_dados: 'dados_reais'
- resumo: Panorama geral conciso e profissional
- pontos_positivos: Lista dos principais acertos evidenciados pelos números
- pontos_negativos: Gargalos e quedas de eficiência identificados
- padroes_identificados: O que os dados mostram sobre preferências do público
- conteudos_vencedores: Lista de criativos/posts com melhor desempenho e a razão
- conteudos_abaixo_media: Conteúdos com pior conversão e o que ajustar
- recomendacoes: Ações táticas imediatas para a equipe
- proximos_conteudos_recomendados: Sugestões de novos conteúdos que exploram os padrões vencedores

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "status_dados": "dados_reais",
  "resumo": "...",
  "pontos_positivos": ["..."],
  "pontos_negativos": ["..."],
  "padroes_identificados": ["..."],
  "conteudos_vencedores": [
    { "titulo": "...", "metrica_chave": "CTR 3.4% / CPL R$ 4,20", "por_que_funcionou": "..." }
  ],
  "conteudos_abaixo_media": [
    { "titulo": "...", "metrica_problema": "CPL R$ 18,90", "o_que_corrigir": "..." }
  ],
  "recomendacoes": ["..."],
  "proximos_conteudos_recomendados": [
    { "titulo": "...", "formato": "Reels", "etapa_funil": "topo", "motivo": "..." }
  ]
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<PerformanceAIAnalysis>(rawOutput, {
    status_dados: 'dados_reais',
    resumo: 'Análise concluída com base nos dados do sistema.',
    pontos_positivos: [],
    pontos_negativos: [],
    padroes_identificados: [],
    conteudos_vencedores: [],
    conteudos_abaixo_media: [],
    recomendacoes: [],
    proximos_conteudos_recomendados: [],
  });
}

// ==============================================================================
// 9. GERAR ESTRATÉGIA
// ==============================================================================
export interface GenerateStrategyInput {
  periodo: string;
  objetivo: string;
  publico?: string;
  produto?: string;
  orcamento?: string;
  plataformas?: string[];
  quantidade_conteudos?: number;
}

export async function generateStrategy(
  input: GenerateStrategyInput,
  brandContext?: Partial<BrandContext>
): Promise<MarketingStrategyPlan> {
  const brandPrompt = buildBrandContextInstruction(brandContext);
  const qtd = input.quantidade_conteudos || 8;

  const prompt = `
Você é um Chief Marketing Officer (CMO) estrategista de campanhas de alta escala.
${brandPrompt}

PARÂMETROS DA ESTRATÉGIA:
- Período do Planejamento: ${input.periodo || 'Próximos 30 dias'}
- Objetivo Principal: ${input.objetivo}
- Público-Alvo: ${input.publico || 'Público da marca'}
- Produto / Serviço Central: ${input.produto || 'Produtos da marca'}
${input.orcamento ? `- Orçamento Previsto: ${input.orcamento}` : ''}
- Plataformas: ${(input.plataformas || ['Instagram', 'Meta Ads']).join(', ')}
- Quantidade Total de Conteúdos Planejados: ${qtd}

TAREFA:
Construa um plano tático executável contendo:
1. Pilares estratégicos (3 a 4 pilares de conteúdo)
2. Frequência recomendada de publicação
3. Distribuição dos formatos (Reels, Carrossel, Anúncios, etc.)
4. Temas centrais a serem dominados
5. Estrutura por etapa do funil (topo, meio e fundo)
6. Sugestões de anúncios pagos para tráfego
7. Sugestões de testes A/B para validação
8. CTAs recomendados
9. Exatamente ${qtd} conteúdos específicos prontos para serem transformados em posts no sistema (com título, formato, etapa_funil, pilar, tema, cta).

Retorne EXCLUSIVAMENTE um objeto JSON no formato:
{
  "periodo": "${input.periodo}",
  "objetivo_geral": "${input.objetivo}",
  "pilares_estrategicos": ["Pilar 1", "Pilar 2"],
  "frequencia_sugerida": "4x por semana",
  "distribuicao_formatos": ["50% Reels", "30% Carrossel", "20% Estático"],
  "temas_centrais": ["Tema A", "Tema B"],
  "estrategia_funil": {
    "topo": "Atração em massa com vídeos curtos...",
    "meio": "Quebra de objeções e educação...",
    "fundo": "Estudos de caso e oferta direta..."
  },
  "sugestoes_anuncios": ["Campanha de topo com vídeo...", "Remarketing para leads..."],
  "sugestoes_testes": ["Testar Hook com pergunta vs Hook com número"],
  "ctas_recomendados": ["Envie 'QUERO' no direct", "Link na bio"],
  "conteudos_planejados": [
    {
      "titulo": "Título do Conteúdo 1",
      "formato": "Reels",
      "etapa_funil": "topo",
      "pilar": "Autoridade",
      "tema": "Tema específico",
      "cta": "Comente abaixo"
    }
  ]
}
`;

  const rawOutput = await callGeminiInteraction(prompt);
  return parseJsonFromMarkdown<MarketingStrategyPlan>(rawOutput, {
    periodo: input.periodo,
    objetivo_geral: input.objetivo,
    pilares_estrategicos: [],
    frequencia_sugerida: '',
    distribuicao_formatos: [],
    temas_centrais: [],
    estrategia_funil: { topo: '', meio: '', fundo: '' },
    sugestoes_anuncios: [],
    sugestoes_testes: [],
    ctas_recomendados: [],
    conteudos_planejados: [],
  });
}

// ==============================================================================
// 10. ASSISTENTE LIVRE (CHAT CONVERSACIONAL)
// ==============================================================================
export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithAssistant(
  messages: ChatMessageParam[],
  brandContext?: Partial<BrandContext>,
  previousInteractionId?: string
): Promise<{ text: string; interactionId?: string }> {
  const client = getGeminiClient();
  const brandPrompt = buildBrandContextInstruction(brandContext);

  // Formata o histórico conversacional no prompt para a API Interactions
  const systemInstruction = `
Você é o Assistente de Inteligência Artificial oficial da plataforma Meta Máxima Digital.
Você é um estrategista de ponta especializado em: marketing digital, copywriting, produção de conteúdo, Meta Ads, análise de métricas, funis de conversão e planejamento.
${brandPrompt}

DIRETRIZES DE RESPOSTA:
- Mantenha tom profissional, experiente, prestativo e focado em resultados.
- Forneça respostas organizadas, com títulos em negrito, tópicos claros e exemplos práticos.
- Se o usuário solicitar ideias, roteiros ou textos, entregue o material pronto para uso imediato.
`;

  const conversationHistory = messages
    .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = `
${systemInstruction}

HISTÓRICO DA CONVERSA:
${conversationHistory}

Responda à última mensagem do Usuário de forma completa e estratégica:
`;

  const options: {
    model: string;
    input: string;
    previous_interaction_id?: string;
  } = {
    model: DEFAULT_GEMINI_MODEL,
    input: fullPrompt,
  };

  if (previousInteractionId) {
    options.previous_interaction_id = previousInteractionId;
  }

  const interaction = await client.interactions.create(options);
  const text = interaction.output_text || 'Não foi possível gerar uma resposta no momento.';

  return {
    text: text.trim(),
    interactionId: interaction.id,
  };
}
