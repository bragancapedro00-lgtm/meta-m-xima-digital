'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Lightbulb,
  Video,
  FileText,
  Layers,
  Megaphone,
  Repeat,
  BrainCircuit,
  BarChart3,
  Rocket,
  MessageSquare,
  Copy,
  Check,
  BookmarkPlus,
  Send,
  PlusCircle,
  Trash2,
  Settings2,
  AlertCircle,
  Info,
  Clock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sliders,
  ExternalLink,
  Target,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useContent } from '@/lib/context/ContentContext';
import {
  AIToolType,
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
  Post,
} from '@/types';

interface ApiStatus {
  configured: boolean;
  model: string;
  sdk: string;
  api: string;
  message: string;
}

export default function AssistenteIAPage() {
  const {
    posts,
    ideas,
    campaigns,
    ads,
    pixelConfig,
    currentUser,
    brandContext,
    updateBrandContext,
    saveAIIdeaToIdeas,
    saveAIScriptToPost,
    saveAICarouselToPost,
    saveAIAdToCreative,
  } = useContent();

  // Active Tool & Navigation
  const [activeTool, setActiveTool] = useState<AIToolType>('ideias');
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Gemini API Status Check
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [checkingApi, setCheckingApi] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/ai/status');
        const data = await res.json();
        setApiStatus(data);
      } catch {
        setApiStatus({
          configured: false,
          model: 'gemini-3.6-flash',
          sdk: '@google/genai',
          api: 'Interactions API',
          message: 'Erro ao verificar conectividade da API Gemini.',
        });
      } finally {
        setCheckingApi(false);
      }
    }
    checkStatus();
  }, []);

  // Generic loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tool 1: Ideias State
  const [ideaForm, setIdeaForm] = useState({
    cliente_projeto: '',
    nicho: brandContext?.nicho || '',
    publico: brandContext?.publico_alvo || '',
    produto_servico: brandContext?.produtos || '',
    objetivo: 'Engajamento e Atração de Leads',
    plataforma: 'Instagram',
    etapa_funil: 'topo',
    formato: 'Reels / Vídeo curto',
    tema: '',
    quantidade: 5,
    tom_comunicacao: brandContext?.tom_de_voz || 'Profissional e persuasivo',
    informacoes_adicionais: '',
  });
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdeaItem[]>([]);

  // Tool 2: Roteiro State
  const [scriptForm, setScriptForm] = useState({
    selectedIdeaId: '',
    tema: '',
    publico: '',
    objetivo: 'Retenção e conversão',
    plataforma: 'Instagram Reels',
    funil: 'meio',
    duracao: '45 segundos' as '15 segundos' | '30 segundos' | '45 segundos' | '60 segundos' | '90 segundos',
    tom_de_voz: brandContext?.tom_de_voz || 'Persuasivo e dinâmico',
    produto_servico: brandContext?.produtos || '',
    oferta: '',
    informacoes_adicionais: '',
  });
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);

  // Tool 3: Legenda State
  const [captionForm, setCaptionForm] = useState({
    selectedPostId: '',
    tema_ou_conteudo: '',
    roteiro_base: '',
    plataforma: 'Instagram',
    objetivo: 'Engajamento e Comentários',
    publico: '',
    tom: brandContext?.tom_de_voz || 'Persuasivo e envolvente',
    cta: brandContext?.cta_padrao || '',
  });
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaptionVersion[]>([]);

  // Tool 4: Carrossel State
  const [carouselForm, setCarouselForm] = useState({
    tema: '',
    objetivo: 'Autoridade e Salvamentos',
    publico: '',
    quantidade_slides: 6,
    plataforma: 'Instagram',
    funil: 'meio',
    cta: 'Salve este conteúdo para consultar depois.',
  });
  const [generatedCarousel, setGeneratedCarousel] = useState<GeneratedCarousel | null>(null);

  // Tool 5: Anúncio State
  const [adForm, setAdForm] = useState({
    produto_servico: brandContext?.produtos || '',
    oferta: '',
    publico: brandContext?.publico_alvo || '',
    regiao: brandContext?.regiao_atuacao || 'Brasil',
    objetivo_campanha: 'Leads / Formulário Instantâneo',
    etapa_funil: 'meio',
    plataforma: 'Meta Ads (Instagram + Facebook)',
    formato: 'Vídeo 9:16 (Reels & Stories)',
    tom_comunicacao: 'Direto ao ponto, com urgência e autoridade',
  });
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);

  // Tool 6: Variações State
  const [variationForm, setVariationForm] = useState({
    selectedPostId: '',
    conteudo_personalizado: '',
    quantidade_variacoes: 3 as 3 | 5 | 10,
    foco: 'Testar novos ganchos para reduzir custo por lead',
  });
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariationItem[]>([]);

  // Tool 7: Melhorar Conteúdo State
  const [improveForm, setImproveForm] = useState({
    selectedItemId: '',
    tipo_conteudo: 'roteiro' as 'ideia' | 'roteiro' | 'legenda' | 'anuncio' | 'carrossel',
    conteudo_atual: '',
    objetivo_melhoria: 'Mais persuasivo' as
      | 'Mais comercial'
      | 'Mais educativo'
      | 'Mais persuasivo'
      | 'Mais curto'
      | 'Mais viral'
      | 'Mais profissional'
      | 'Mais direto'
      | 'Mais emocional',
    detalhes_adicionais: '',
  });
  const [improvedAnalysis, setImprovedAnalysis] = useState<ContentImprovementAnalysis | null>(null);

  // Tool 8: Analisar Performance State
  const [performanceForm, setPerformanceForm] = useState({
    periodo: 'Últimos 30 dias',
    pergunta_especifica: 'Quais criativos de anúncios tiveram o melhor CTR e menor CPL e o que eles têm em comum?',
  });
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAIAnalysis | null>(null);

  // Tool 9: Gerar Estratégia State
  const [strategyForm, setStrategyForm] = useState({
    periodo: 'Próximos 30 dias',
    objetivo: 'Fortalecer autoridade no nicho e gerar leads com previsibilidade',
    publico: brandContext?.publico_alvo || '',
    produto: brandContext?.produtos || '',
    orcamento: 'R$ 5.000 / mês',
    plataformas: ['Instagram', 'Meta Ads', 'YouTube'],
    quantidade_conteudos: 8,
  });
  const [generatedStrategy, setGeneratedStrategy] = useState<MarketingStrategyPlan | null>(null);

  // Tool 10: Assistente Livre (Chat) State
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string; time: string }[]
  >([
    {
      role: 'assistant',
      content:
        'Olá! Sou o Assistente de Inteligência Artificial da Meta Máxima Digital. Estou conectado às diretrizes da sua marca, aos conteúdos e às métricas da sua operação. Como posso te ajudar hoje? (Ex: "Crie um roteiro de anúncio para médicos", "Analise as métricas dos meus anúncios", "Sugira um funil de lançamento")',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [lastInteractionId, setLastInteractionId] = useState<string | undefined>(undefined);

  // Editable Brand Context Local State
  const [editableBrand, setEditableBrand] = useState<BrandContext>(brandContext);

  useEffect(() => {
    if (brandContext) {
      setEditableBrand(brandContext);
    }
  }, [brandContext]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Generic AI Generation invoker
  const triggerGeneration = async (type: AIToolType, inputPayload: Record<string, unknown>) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          input: inputPayload,
          brandContext,
          userId: currentUser?.id,
          projectId: 'default',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Falha ao processar solicitação de IA.');
      }
      return json.data;
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Submit Gerar Ideias
  const handleGenerateIdeas = async () => {
    const data = await triggerGeneration('ideias', ideaForm);
    if (data && Array.isArray(data)) {
      setGeneratedIdeas(data);
    }
  };

  // 2. Submit Criar Roteiro
  const handleGenerateScript = async () => {
    let finalTema = scriptForm.tema;
    if (scriptForm.selectedIdeaId) {
      const idea = ideas.find((i) => i.id === scriptForm.selectedIdeaId);
      if (idea) finalTema = `${idea.titulo}: ${idea.ideia}`;
    }
    if (!finalTema) {
      setErrorMsg('Informe o tema ou selecione uma ideia existente para criar o roteiro.');
      return;
    }

    const data = await triggerGeneration('roteiro', {
      ...scriptForm,
      tema: finalTema,
    });
    if (data) {
      setGeneratedScript(data);
    }
  };

  // 3. Submit Criar Legenda
  const handleGenerateCaption = async () => {
    let tema = captionForm.tema_ou_conteudo;
    let roteiroBase = captionForm.roteiro_base;
    if (captionForm.selectedPostId) {
      const p = posts.find((item) => item.id === captionForm.selectedPostId);
      if (p) {
        tema = p.titulo;
        roteiroBase = `${p.gancho || ''} ${p.roteiro_desenvolvimento || ''}`;
      }
    }
    if (!tema && !roteiroBase) {
      setErrorMsg('Informe o tema/conteúdo ou selecione um post existente.');
      return;
    }

    const data = await triggerGeneration('legenda', {
      ...captionForm,
      tema_ou_conteudo: tema,
      roteiro_base: roteiroBase,
    });
    if (data && Array.isArray(data)) {
      setGeneratedCaptions(data);
    }
  };

  // 4. Submit Criar Carrossel
  const handleGenerateCarousel = async () => {
    if (!carouselForm.tema) {
      setErrorMsg('Informe o tema principal do carrossel.');
      return;
    }
    const data = await triggerGeneration('carrossel', carouselForm);
    if (data) {
      setGeneratedCarousel(data);
    }
  };

  // 5. Submit Criar Anúncio
  const handleGenerateAd = async () => {
    if (!adForm.produto_servico || !adForm.oferta) {
      setErrorMsg('Informe o produto/serviço e a oferta do anúncio.');
      return;
    }
    // Inclui dados reais de campanhas se houver
    const contextoMeta = campaigns.length > 0 ? { total_campanhas: campaigns.length, resumo: campaigns.slice(0, 3) } : undefined;
    const data = await triggerGeneration('anuncio', {
      ...adForm,
      contexto_meta_ads: contextoMeta,
    });
    if (data) {
      setGeneratedAd(data);
    }
  };

  // 6. Submit Criar Variações
  const handleGenerateVariations = async () => {
    let conteudoOriginal = { titulo: '', hook: '', roteiro: '', legenda: '', cta: '' };
    if (variationForm.selectedPostId) {
      const p = posts.find((item) => item.id === variationForm.selectedPostId);
      if (p) {
        conteudoOriginal = {
          titulo: p.titulo,
          hook: p.gancho || '',
          roteiro: p.roteiro_desenvolvimento || '',
          legenda: p.legenda || '',
          cta: p.cta || '',
        };
      }
    } else if (variationForm.conteudo_personalizado) {
      conteudoOriginal.roteiro = variationForm.conteudo_personalizado;
      conteudoOriginal.titulo = 'Conteúdo Informado';
    } else {
      setErrorMsg('Selecione um conteúdo existente ou digite o texto base.');
      return;
    }

    const data = await triggerGeneration('variacoes', {
      conteudo_original: conteudoOriginal,
      quantidade_variacoes: variationForm.quantidade_variacoes,
      foco: variationForm.foco,
    });
    if (data && Array.isArray(data)) {
      setGeneratedVariations(data);
    }
  };

  // 7. Submit Melhorar Conteúdo
  const handleImproveContent = async () => {
    let textToImprove = improveForm.conteudo_atual;
    if (improveForm.selectedItemId) {
      const p = posts.find((item) => item.id === improveForm.selectedItemId);
      if (p) {
        textToImprove = `Título: ${p.titulo}\nGancho: ${p.gancho || ''}\nRoteiro: ${p.roteiro_desenvolvimento || ''}\nLegenda: ${p.legenda || ''}\nCTA: ${p.cta || ''}`;
      } else {
        const idItem = ideas.find((item) => item.id === improveForm.selectedItemId);
        if (idItem) {
          textToImprove = `Título: ${idItem.titulo}\nConceito: ${idItem.ideia}\nGancho: ${idItem.gancho || ''}\nCTA: ${idItem.cta || ''}`;
        }
      }
    }

    if (!textToImprove.trim()) {
      setErrorMsg('Informe o conteúdo atual ou selecione um item existente para melhorar.');
      return;
    }

    const data = await triggerGeneration('melhorar', {
      tipo_conteudo: improveForm.tipo_conteudo,
      conteudo_atual: textToImprove,
      objetivo_melhoria: improveForm.objetivo_melhoria,
      detalhes_adicionais: improveForm.detalhes_adicionais,
    });
    if (data) {
      setImprovedAnalysis(data);
    }
  };

  // 8. Submit Analisar Performance com DADOS REAIS
  const handleAnalyzePerformance = async () => {
    // Coleta dados reais do sistema
    const temAds = ads.length > 0;
    const temPixel = pixelConfig && pixelConfig.events && pixelConfig.events.length > 0;
    const topPosts = posts.filter((p) => p.organico_alcance || p.anuncio_cliques);

    const dadosReais = {
      tem_meta_ads: temAds,
      tem_pixel: temPixel,
      tem_instagram: posts.some((p) => p.plataforma === 'instagram'),
      tem_ga4: false,
      resumo_metricas: {
        total_anuncios: ads.length,
        total_campanhas: campaigns.length,
        total_conteudos: posts.length,
        anuncios_ativos: ads.filter((a) => a.status === 'ACTIVE').map((a) => ({
          nome: a.name,
          gasto: a.spend,
          impressoes: a.impressions,
          cliques: a.clicks,
          ctr: a.ctr,
          cpc: a.cpc,
          cpl: a.cpl,
          leads: a.leads,
          conversoes: a.conversions,
          cpa: a.cpa,
          roas: a.roas,
        })),
        pixel_eventos: pixelConfig.events.map((e) => ({
          evento: e.event_name,
          contagem: e.event_count,
        })),
      },
      top_conteudos: topPosts.slice(0, 5).map((p) => ({
        titulo: p.titulo,
        plataforma: p.plataforma,
        alcance: p.organico_alcance || 0,
        ctr: p.anuncio_ctr || 0,
        leads: p.anuncio_leads || 0,
      })),
    };

    const data = await triggerGeneration('performance', {
      dados_disponiveis: dadosReais,
      periodo_analise: performanceForm.periodo,
      pergunta_especifica: performanceForm.pergunta_especifica,
    });
    if (data) {
      setPerformanceAnalysis(data);
    }
  };

  // 9. Submit Gerar Estratégia
  const handleGenerateStrategy = async () => {
    if (!strategyForm.objetivo) {
      setErrorMsg('Informe o objetivo principal da estratégia.');
      return;
    }
    const data = await triggerGeneration('estrategia', strategyForm);
    if (data) {
      setGeneratedStrategy(data);
    }
  };

  // Transformar Estratégia em Planejamento (Batch Save)
  const handleTransformStrategyToPlan = async (strategy: MarketingStrategyPlan) => {
    if (!strategy.conteudos_planejados || strategy.conteudos_planejados.length === 0) return;
    for (const item of strategy.conteudos_planejados) {
      await saveAIIdeaToIdeas({
        titulo: item.titulo,
        hook: `Focado no pilar: ${item.pilar}`,
        conceito: `Tema: ${item.tema} | Estratégia: ${strategy.objetivo_geral}`,
        objetivo: strategy.objetivo_geral,
        formato: item.formato,
        etapa_funil: item.etapa_funil,
        cta: item.cta,
        justificativa_estrategica: `Planejamento ${strategy.periodo} - Pilar ${item.pilar}`,
      });
    }
    setSavedSuccessId('strategy-all');
    setTimeout(() => setSavedSuccessId(null), 3000);
  };

  // 10. Chat com Assistente Livre
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    const newMsgList = [
      ...chatMessages,
      {
        role: 'user' as const,
        content: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setChatMessages(newMsgList);
    setChatInput('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgList.map((m) => ({ role: m.role, content: m.content })),
          brandContext,
          previousInteractionId: lastInteractionId,
          userId: currentUser?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro no chat do Assistente.');
      }

      setLastInteractionId(json.interactionId);
      setChatMessages([
        ...newMsgList,
        {
          role: 'assistant',
          content: json.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comunicar com o Assistente Livre.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Brand Context Drawer
  const handleSaveBrand = async () => {
    await updateBrandContext(editableBrand);
    setIsBrandDrawerOpen(false);
  };

  // Action Tools configuration metadata
  const TOOL_LIST: {
    id: AIToolType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
    badge?: string;
  }[] = [
    { id: 'ideias', label: 'Gerar ideias', icon: Lightbulb, desc: 'Ideias validadas com gancho, objetivo e justificativa', badge: 'Estratégico' },
    { id: 'roteiro', label: 'Criar roteiro', icon: Video, desc: 'Estrutura completa em 4 atos, cenas, cortes e falas', badge: 'Produção' },
    { id: 'legenda', label: 'Criar legenda', icon: FileText, desc: '3 versões persuasivas com ganchos e hashtags' },
    { id: 'carrossel', label: 'Criar carrossel', icon: Layers, desc: 'Slides didáticos de alta retenção com orientação visual' },
    { id: 'anuncio', label: 'Criar anúncio', icon: Megaphone, desc: 'Foco Meta Ads com Headlines, Primary Text e variações', badge: 'Tráfego' },
    { id: 'variacoes', label: 'Criar variações', icon: Repeat, desc: 'Novos ângulos, hooks e abordagens do mesmo conteúdo' },
    { id: 'melhorar', label: 'Melhorar conteúdo', icon: BrainCircuit, desc: 'Auditoria clínica: pontos fortes, fracos e versão 2.0' },
    { id: 'performance', label: 'Analisar performance', icon: BarChart3, desc: 'Diagnóstico com dados reais de Meta Ads e redes', badge: 'Dados Reais' },
    { id: 'estrategia', label: 'Gerar estratégia', icon: Rocket, desc: 'Pilares, calendário e distribuição tática de funil' },
    { id: 'chat', label: 'Assistente livre', icon: MessageSquare, desc: 'Conversação contínua com contexto total da marca' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#090d16] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Assistente de IA
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                  Google Gemini
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Crie, planeje e otimize seus conteúdos com inteligência artificial.
              </p>
            </div>
          </div>
        </div>

        {/* Action Header: Brand Context Button & Status Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBrandDrawerOpen(!isBrandDrawerOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          >
            <Settings2 className="w-4 h-4 text-blue-400" />
            <span>Contexto da Marca</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Gemini API Status Banner (Friendly Alert if Key is missing) */}
      {!checkingApi && apiStatus && !apiStatus.configured && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-amber-100">
                Chave da API Gemini não detectada no servidor
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                Para utilizar os modelos de IA da Meta Máxima Digital em produção, defina a variável{' '}
                <code className="px-1.5 py-0.5 rounded bg-amber-900/60 font-mono text-amber-200">
                  GEMINI_API_KEY
                </code>{' '}
                no seu arquivo <code className="font-mono text-amber-200">.env.local</code> ou no painel da Vercel.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black transition-colors"
            >
              Obter Chave no Google AI Studio
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Brand Context Quick Drawer / Collapsible Box */}
      {isBrandDrawerOpen && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-4 shadow-xl relative animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-base font-bold text-white">Diretrizes da Marca & Contexto Operacional</h2>
                <p className="text-xs text-slate-400">
                  Estas informações são injetadas automaticamente em todas as 10 ferramentas de IA, garantindo tom de voz e alinhamento estratégico permanente.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBrandDrawerOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={editableBrand.nome_empresa}
                onChange={(e) => setEditableBrand({ ...editableBrand, nome_empresa: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nicho de Atuação</label>
              <input
                type="text"
                value={editableBrand.nicho}
                onChange={(e) => setEditableBrand({ ...editableBrand, nicho: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Público-Alvo</label>
              <input
                type="text"
                value={editableBrand.publico_alvo}
                onChange={(e) => setEditableBrand({ ...editableBrand, publico_alvo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Produtos & Serviços</label>
              <input
                type="text"
                value={editableBrand.produtos}
                onChange={(e) => setEditableBrand({ ...editableBrand, produtos: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tom de Voz</label>
              <input
                type="text"
                value={editableBrand.tom_de_voz}
                onChange={(e) => setEditableBrand({ ...editableBrand, tom_de_voz: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">CTA Padrão</label>
              <input
                type="text"
                value={editableBrand.cta_padrao || ''}
                onChange={(e) => setEditableBrand({ ...editableBrand, cta_padrao: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-emerald-400 font-semibold mb-1">Palavras / Termos que DEVEM ser usados</label>
                <input
                  type="text"
                  placeholder="Ex: escala, autoridade, ROI, conversão previsível"
                  value={editableBrand.palavras_obrigatorias || ''}
                  onChange={(e) => setEditableBrand({ ...editableBrand, palavras_obrigatorias: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-rose-400 font-semibold mb-1">Palavras PROIBIDAS (A IA nunca usará)</label>
                <input
                  type="text"
                  placeholder="Ex: enriquecer rápido, segredo infalível, hack milagroso"
                  value={editableBrand.palavras_proibidas || ''}
                  onChange={(e) => setEditableBrand({ ...editableBrand, palavras_proibidas: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditableBrand(brandContext)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Restaurar
            </button>
            <button
              onClick={handleSaveBrand}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Salvar Diretrizes da Marca
            </button>
          </div>
        </div>
      )}

      {/* Grid of the 10 Action Cards (One Single Unified Area) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Ferramentas Operacionais de IA ({TOOL_LIST.length})
          </h2>
          <span className="text-xs text-slate-400">
            Selecione uma ação para alternar dinamicamente a área de trabalho
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {TOOL_LIST.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isActive
                    ? 'bg-slate-800/95 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:text-blue-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {tool.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Main Workspace Container */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Workspace Sub-header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            {React.createElement(
              TOOL_LIST.find((t) => t.id === activeTool)?.icon || Sparkles,
              { className: 'w-5 h-5 text-blue-400' }
            )}
            <h2 className="text-base font-bold text-white">
              {TOOL_LIST.find((t) => t.id === activeTool)?.label}
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              — {TOOL_LIST.find((t) => t.id === activeTool)?.desc}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            <span>Modelo ativo: {apiStatus?.model || 'gemini-3.6-flash'}</span>
          </div>
        </div>

        {/* Dynamic Tool Content Panels */}
        <div className="p-6">
          {/* ========================================================================= */}
          {/* 1. GERAR IDEIAS                                                           */}
          {/* ========================================================================= */}
          {activeTool === 'ideias' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Config Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Target className="w-4 h-4 text-blue-400" />
                    Parâmetros da Geração
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Tema / Assunto Central</label>
                    <input
                      type="text"
                      placeholder="Ex: Como reduzir o CPL em campanhas de Meta Ads"
                      value={ideaForm.tema}
                      onChange={(e) => setIdeaForm({ ...ideaForm, tema: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Etapa do Funil</label>
                      <select
                        value={ideaForm.etapa_funil}
                        onChange={(e) => setIdeaForm({ ...ideaForm, etapa_funil: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="topo">Topo (Atração)</option>
                        <option value="meio">Meio (Educação)</option>
                        <option value="fundo">Fundo (Conversão)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Formato</label>
                      <select
                        value={ideaForm.formato}
                        onChange={(e) => setIdeaForm({ ...ideaForm, formato: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Reels / Vídeo curto">Reels / Vídeo curto</option>
                        <option value="Carrossel">Carrossel Didático</option>
                        <option value="Post Estático">Post Estático</option>
                        <option value="Anúncio Direto">Anúncio Direto</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Plataforma</label>
                      <select
                        value={ideaForm.plataforma}
                        onChange={(e) => setIdeaForm({ ...ideaForm, plataforma: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                        <option value="LinkedIn">LinkedIn</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Quantidade</label>
                      <select
                        value={ideaForm.quantidade}
                        onChange={(e) => setIdeaForm({ ...ideaForm, quantidade: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value={3}>3 ideias</option>
                        <option value={5}>5 ideias</option>
                        <option value={10}>10 ideias</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Objetivo Estratégico</label>
                    <input
                      type="text"
                      value={ideaForm.objetivo}
                      onChange={(e) => setIdeaForm({ ...ideaForm, objetivo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Informações Adicionais / Foco</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Incluir menção ao case de 4.2x de ROAS"
                      value={ideaForm.informacoes_adicionais}
                      onChange={(e) => setIdeaForm({ ...ideaForm, informacoes_adicionais: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateIdeas}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>O Gemini está pensando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>✨ Gerar ideias</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Results Panel */}
              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Estruturando ideias estratégicas com Gemini Interactions API...
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Cruzando diretrizes da marca, ganchos de alta retenção e gatilhos de conversão.
                    </p>
                  </div>
                )}

                {!isLoading && generatedIdeas.length === 0 && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Lightbulb className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhuma ideia gerada ainda</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Preencha o tema e os parâmetros ao lado e clique em "Gerar ideias". As ideias retornadas podem ser salvas diretamente no Banco de Ideias ou convertidas em roteiro com 1 clique.
                    </p>
                  </div>
                )}

                {!isLoading && generatedIdeas.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        {generatedIdeas.length} Ideias Estruturadas Geradas:
                      </span>
                      <button
                        onClick={handleGenerateIdeas}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Gerar novamente
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {generatedIdeas.map((idea, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                                #{idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-white">{idea.titulo}</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {idea.formato}
                              </span>
                              <span
                                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                                  idea.etapa_funil === 'topo'
                                    ? 'bg-blue-950 text-blue-400'
                                    : idea.etapa_funil === 'meio'
                                    ? 'bg-amber-950 text-amber-400'
                                    : 'bg-emerald-950 text-emerald-400'
                                }`}
                              >
                                Funil: {idea.etapa_funil}
                              </span>
                            </div>
                          </div>

                          {/* Hook */}
                          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                              🔥 Hook (Gancho de Retenção):
                            </span>
                            <p className="text-xs text-slate-200 italic font-medium">"{idea.hook}"</p>
                          </div>

                          {/* Concept & Objective */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 font-semibold block">Conceito do Conteúdo:</span>
                              <p className="text-slate-300 mt-0.5">{idea.conceito}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold block">Objetivo:</span>
                              <p className="text-slate-300 mt-0.5">{idea.objetivo}</p>
                            </div>
                          </div>

                          {/* CTA & Justification */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-800/60 pt-2">
                            <div>
                              <span className="text-emerald-400 font-semibold block">CTA Sugerido:</span>
                              <p className="text-slate-300 mt-0.5">{idea.cta}</p>
                            </div>
                            <div>
                              <span className="text-indigo-400 font-semibold block">Justificativa Estratégica:</span>
                              <p className="text-slate-400 mt-0.5">{idea.justificativa_estrategica}</p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() =>
                                handleCopy(
                                  `Título: ${idea.titulo}\nHook: ${idea.hook}\nConceito: ${idea.conceito}\nCTA: ${idea.cta}`,
                                  `idea-${idx}`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                            >
                              {copiedId === `idea-${idx}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setScriptForm({
                                  ...scriptForm,
                                  tema: `${idea.titulo}: ${idea.conceito}`,
                                  funil: idea.etapa_funil,
                                });
                                setActiveTool('roteiro');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors border border-slate-700"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Criar roteiro</span>
                            </button>

                            <button
                              onClick={async () => {
                                await saveAIIdeaToIdeas(idea);
                                setSavedSuccessId(`idea-saved-${idx}`);
                                setTimeout(() => setSavedSuccessId(null), 2500);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              {savedSuccessId === `idea-saved-${idx}` ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Ideia Salva no Banco!</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5" />
                                  <span>Salvar ideia</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CRIAR ROTEIRO                                                          */}
          {/* ========================================================================= */}
          {activeTool === 'roteiro' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Video className="w-4 h-4 text-blue-400" />
                    Configuração do Roteiro
                  </h3>

                  {/* Seleção de ideia existente ou manual */}
                  <div>
                    <label className="block text-slate-400 mb-1">Selecionar Ideia Existente (Opcional)</label>
                    <select
                      value={scriptForm.selectedIdeaId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        setScriptForm({
                          ...scriptForm,
                          selectedIdeaId: selId,
                          tema: selId ? ideas.find((i) => i.id === selId)?.titulo || '' : '',
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="">-- Ou informe o tema manualmente abaixo --</option>
                      {ideas.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.titulo} ({i.formato})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tema do Roteiro *</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 3 erros que todo empresário comete ao criar anúncios"
                      value={scriptForm.tema}
                      onChange={(e) => setScriptForm({ ...scriptForm, tema: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Duração Alvo</label>
                      <select
                        value={scriptForm.duracao}
                        onChange={(e) => setScriptForm({ ...scriptForm, duracao: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="15 segundos">15 segundos</option>
                        <option value="30 segundos">30 segundos</option>
                        <option value="45 segundos">45 segundos</option>
                        <option value="60 segundos">60 segundos</option>
                        <option value="90 segundos">90 segundos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Plataforma</label>
                      <select
                        value={scriptForm.plataforma}
                        onChange={(e) => setScriptForm({ ...scriptForm, plataforma: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Instagram Reels">Instagram Reels</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube Shorts">YouTube Shorts</option>
                        <option value="Meta Ads Vídeo">Meta Ads Vídeo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Funil</label>
                      <select
                        value={scriptForm.funil}
                        onChange={(e) => setScriptForm({ ...scriptForm, funil: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="topo">Topo</option>
                        <option value="meio">Meio</option>
                        <option value="fundo">Fundo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tom de Voz</label>
                      <input
                        type="text"
                        value={scriptForm.tom_de_voz}
                        onChange={(e) => setScriptForm({ ...scriptForm, tom_de_voz: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Oferta / Chamada</label>
                    <input
                      type="text"
                      placeholder="Ex: Diagnóstico gratuito ou comente 'QUERO'"
                      value={scriptForm.oferta}
                      onChange={(e) => setScriptForm({ ...scriptForm, oferta: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateScript}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Roteirizando com Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🎬 Criar roteiro</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Montando roteiro em 4 atos, falas e cortes de cena...
                    </p>
                  </div>
                )}

                {!isLoading && !generatedScript && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Video className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhum roteiro gerado ainda</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Defina o tema ou selecione uma ideia do seu banco para gerar o roteiro estruturado com Hook, Desenvolvimento, Prova, CTA e detalhamento de cortes de câmera.
                    </p>
                  </div>
                )}

                {!isLoading && generatedScript && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{generatedScript.titulo}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-semibold border border-blue-800/60">
                            ⏱️ {generatedScript.duracao}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(JSON.stringify(generatedScript, null, 2), 'script-all')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                        >
                          {copiedId === 'script-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copiar</span>
                        </button>

                        <button
                          onClick={async () => {
                            await saveAIScriptToPost(generatedScript, 'a_gravar');
                            setSavedSuccessId('script-post');
                            setTimeout(() => setSavedSuccessId(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          {savedSuccessId === 'script-post' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Salvo no Kanban!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Salvar como conteúdo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 4 Acts Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/20">
                        <span className="text-amber-400 font-bold uppercase tracking-wider block mb-1">
                          1. HOOK (Primeiros 3s):
                        </span>
                        <p className="text-slate-200">{generatedScript.hook}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-blue-500/20">
                        <span className="text-blue-400 font-bold uppercase tracking-wider block mb-1">
                          2. DESENVOLVIMENTO:
                        </span>
                        <p className="text-slate-200">{generatedScript.desenvolvimento}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-indigo-500/20">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                          3. PROVA / ARGUMENTAÇÃO:
                        </span>
                        <p className="text-slate-200">{generatedScript.prova}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-emerald-500/20">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                          4. CTA FINAL:
                        </span>
                        <p className="text-slate-200">{generatedScript.cta || generatedScript.cta_final}</p>
                      </div>
                    </div>

                    {/* Detailed Scenes */}
                    {generatedScript.cenas && generatedScript.cenas.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Detalhamento de Cenas & Cortes ({generatedScript.cenas.length} Cenas):
                        </h5>
                        <div className="space-y-2">
                          {generatedScript.cenas.map((cena) => (
                            <div
                              key={cena.cena_numero}
                              className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-12 gap-2"
                            >
                              <div className="md:col-span-2 flex items-center gap-2">
                                <span className="px-2 py-1 rounded bg-slate-800 font-bold text-blue-400">
                                  Cena {cena.cena_numero}
                                </span>
                              </div>
                              <div className="md:col-span-4">
                                <span className="text-slate-400 block font-semibold">Visual / Enquadramento:</span>
                                <p className="text-slate-300 mt-0.5">{cena.indicacao_visual}</p>
                                {cena.b_roll && (
                                  <p className="text-[11px] text-indigo-400 mt-1">B-Roll: {cena.b_roll}</p>
                                )}
                              </div>
                              <div className="md:col-span-6">
                                <span className="text-slate-400 block font-semibold">Texto Falado:</span>
                                <p className="text-white font-medium italic mt-0.5">"{cena.texto_falado}"</p>
                                {cena.texto_na_tela && (
                                  <p className="text-[11px] text-amber-400 mt-1">
                                    Texto na Tela: "{cena.texto_na_tela}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. CRIAR LEGENDA                                                          */}
          {/* ========================================================================= */}
          {activeTool === 'legenda' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Parâmetros da Legenda
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Selecionar Post Existente (Opcional)</label>
                    <select
                      value={captionForm.selectedPostId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const p = posts.find((item) => item.id === selId);
                        setCaptionForm({
                          ...captionForm,
                          selectedPostId: selId,
                          tema_ou_conteudo: p ? p.titulo : '',
                          roteiro_base: p ? p.gancho || '' : '',
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="">-- Ou informe manualmente abaixo --</option>
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titulo} ({p.plataforma})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tema ou Conteúdo Base *</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Como estruturamos funis de Meta Ads que geram leads qualificados diariamente."
                      value={captionForm.tema_ou_conteudo}
                      onChange={(e) => setCaptionForm({ ...captionForm, tema_ou_conteudo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Plataforma</label>
                      <select
                        value={captionForm.plataforma}
                        onChange={(e) => setCaptionForm({ ...captionForm, plataforma: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tom de Voz</label>
                      <input
                        type="text"
                        value={captionForm.tom}
                        onChange={(e) => setCaptionForm({ ...captionForm, tom: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Chamada para Ação (CTA)</label>
                    <input
                      type="text"
                      placeholder="Ex: Comente 'FUNIL' para receber o modelo no direct."
                      value={captionForm.cta}
                      onChange={(e) => setCaptionForm({ ...captionForm, cta: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateCaption}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Escrevendo legendas...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>✍️ Criar legenda (3 versões)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      O Gemini está desenvolvendo 3 abordagens de copy com hashtags...
                    </p>
                  </div>
                )}

                {!isLoading && generatedCaptions.length === 0 && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhuma legenda gerada</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Selecione um post ou digite o tema para receber 3 versões completas de legendas prontas para postagem.
                    </p>
                  </div>
                )}

                {!isLoading && generatedCaptions.length > 0 && (
                  <div className="space-y-4">
                    {generatedCaptions.map((cap) => (
                      <div
                        key={cap.versao}
                        className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                              Versão {cap.versao}
                            </span>
                            <span className="text-xs font-semibold text-slate-300">
                              {cap.titulo_chamada}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleCopy(
                                `${cap.legenda}\n\n${cap.cta}\n\n${cap.hashtags.join(' ')}`,
                                `caption-${cap.versao}`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                          >
                            {copiedId === `caption-${cap.versao}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Legenda</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {cap.legenda}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/60">
                          <div>
                            <span className="text-emerald-400 font-semibold">CTA: </span>
                            <span className="text-slate-300">{cap.cta}</span>
                          </div>
                          <div className="text-blue-400 font-mono text-[11px] truncate max-w-sm">
                            {cap.hashtags.join(' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. CRIAR CARROSSEL                                                        */}
          {/* ========================================================================= */}
          {activeTool === 'carrossel' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Parâmetros do Carrossel
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Tema Principal *</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 5 Métricas que todo Gestor de Tráfego precisa monitorar diariamente"
                      value={carouselForm.tema}
                      onChange={(e) => setCarouselForm({ ...carouselForm, tema: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Quantidade de Slides</label>
                      <select
                        value={carouselForm.quantidade_slides}
                        onChange={(e) => setCarouselForm({ ...carouselForm, quantidade_slides: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value={4}>4 slides</option>
                        <option value={6}>6 slides</option>
                        <option value={8}>8 slides</option>
                        <option value={10}>10 slides</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Funil</label>
                      <select
                        value={carouselForm.funil}
                        onChange={(e) => setCarouselForm({ ...carouselForm, funil: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="topo">Topo</option>
                        <option value="meio">Meio</option>
                        <option value="fundo">Fundo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Chamada Final (CTA)</label>
                    <input
                      type="text"
                      value={carouselForm.cta}
                      onChange={(e) => setCarouselForm({ ...carouselForm, cta: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateCarousel}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Desenhando narrativa...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🎠 Criar carrossel</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Criando capa magnética, slides didáticos e orientações visuais...
                    </p>
                  </div>
                )}

                {!isLoading && !generatedCarousel && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhum carrossel gerado ainda</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Defina o tema para receber slide a slide: títulos, textos concisos e sugestões de design.
                    </p>
                  </div>
                )}

                {!isLoading && generatedCarousel && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{generatedCarousel.tema}</h4>
                        <span className="text-xs text-slate-400">
                          Total de {generatedCarousel.slides.length} slides prontos para produção
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(JSON.stringify(generatedCarousel, null, 2), 'carousel-all')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                        >
                          {copiedId === 'carousel-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copiar</span>
                        </button>
                        <button
                          onClick={async () => {
                            await saveAICarouselToPost(generatedCarousel);
                            setSavedSuccessId('carousel-saved');
                            setTimeout(() => setSavedSuccessId(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          {savedSuccessId === 'carousel-saved' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Salvo no Kanban!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Salvar como conteúdo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {generatedCarousel.slides.map((slide) => (
                        <div
                          key={slide.slide_numero}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-bold">
                              Slide {slide.slide_numero} ({slide.tipo.toUpperCase()})
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-sm">{slide.titulo}</h5>
                          <p className="text-slate-300 leading-relaxed">{slide.texto}</p>
                          <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-[11px] text-indigo-300">
                            <span className="font-semibold text-slate-400">Sugestão Visual: </span>
                            {slide.sugestao_visual}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. CRIAR ANÚNCIO (META ADS)                                               */}
          {/* ========================================================================= */}
          {activeTool === 'anuncio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Megaphone className="w-4 h-4 text-blue-400" />
                    Parâmetros Meta Ads
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Produto / Serviço *</label>
                    <input
                      type="text"
                      value={adForm.produto_servico}
                      onChange={(e) => setAdForm({ ...adForm, produto_servico: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Oferta Principal / Gancho *</label>
                    <input
                      type="text"
                      placeholder="Ex: Diagnóstico Estratégico Gratuito + Auditoria de Contas"
                      value={adForm.oferta}
                      onChange={(e) => setAdForm({ ...adForm, oferta: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Objetivo da Campanha</label>
                      <select
                        value={adForm.objetivo_campanha}
                        onChange={(e) => setAdForm({ ...adForm, objetivo_campanha: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Leads / Formulário Instantâneo">Leads / Formulário</option>
                        <option value="Conversões Diretas / Vendas">Conversões / Vendas</option>
                        <option value="Mensagens no WhatsApp / Direct">WhatsApp / Direct</option>
                        <option value="Tráfego Qualificado">Tráfego Qualificado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Formato do Criativo</label>
                      <select
                        value={adForm.formato}
                        onChange={(e) => setAdForm({ ...adForm, formato: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value="Vídeo 9:16 (Reels & Stories)">Vídeo 9:16 (Reels)</option>
                        <option value="Imagem 1:1 Feed">Imagem 1:1 Feed</option>
                        <option value="Carrossel de Anúncio">Carrossel de Anúncio</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Região / Localização</label>
                    <input
                      type="text"
                      value={adForm.regiao}
                      onChange={(e) => setAdForm({ ...adForm, regiao: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAd}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Criando anúncios de alta conversão...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>📢 Criar anúncio Meta Ads</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Gerando Primary Text, Headline, Roteiro e Variações A/B...
                    </p>
                  </div>
                )}

                {!isLoading && !generatedAd && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Megaphone className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhum anúncio gerado ainda</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Defina a oferta e o objetivo para receber uma estrutura completa com Primary Text, Headlines de impacto e variações prontas para subir no Gerenciador de Anúncios.
                    </p>
                  </div>
                )}

                {!isLoading && generatedAd && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                          {generatedAd.campanha_sugerida}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{generatedAd.headline_principal}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            await saveAIAdToCreative(generatedAd);
                            setSavedSuccessId('ad-creative');
                            setTimeout(() => setSavedSuccessId(null), 2500);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          {savedSuccessId === 'ad-creative' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Salvo como Criativo!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Salvar como criativo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Primary Text & Creative Concept */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider block">
                          Texto Principal (Primary Text):
                        </span>
                        <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                          {generatedAd.texto_principal}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider block">
                            Conceito Criativo & Visual:
                          </span>
                          <p className="text-slate-300 mt-1">{generatedAd.conceito_criativo}</p>
                        </div>
                        {generatedAd.roteiro_video && (
                          <div className="border-t border-slate-800 pt-2">
                            <span className="text-amber-400 font-bold block">Roteiro do Vídeo (30s):</span>
                            <p className="text-slate-300 italic mt-0.5">{generatedAd.roteiro_video}</p>
                          </div>
                        )}
                        <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Botão de Ação:</span>
                          <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold">
                            {generatedAd.cta}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* A/B Variations */}
                    {generatedAd.variacoes && generatedAd.variacoes.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Variações para Testes A/B ({generatedAd.variacoes.length} ângulos):
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {generatedAd.variacoes.map((v, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-400">{v.nome_versao}</span>
                                <button
                                  onClick={() => handleCopy(`${v.headline}\n\n${v.texto_principal}`, `ad-v-${idx}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedId === `ad-v-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <p className="text-amber-400 font-semibold">Hook: "{v.hook}"</p>
                              <p className="text-white font-medium">Headline: {v.headline}</p>
                              <p className="text-slate-300 text-[11px] line-clamp-3">{v.texto_principal}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. CRIAR VARIAÇÕES                                                        */}
          {/* ========================================================================= */}
          {activeTool === 'variacoes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Repeat className="w-4 h-4 text-blue-400" />
                    Parâmetros das Variações
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Selecionar Conteúdo Existente</label>
                    <select
                      value={variationForm.selectedPostId}
                      onChange={(e) => setVariationForm({ ...variationForm, selectedPostId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="">-- Selecione ou digite o texto abaixo --</option>
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Ou Digite o Conteúdo Base</label>
                    <textarea
                      rows={3}
                      placeholder="Cole aqui o texto, hook ou roteiro que você quer multiplicar em novas versões..."
                      value={variationForm.conteudo_personalizado}
                      onChange={(e) => setVariationForm({ ...variationForm, conteudo_personalizado: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Quantidade</label>
                      <select
                        value={variationForm.quantidade_variacoes}
                        onChange={(e) => setVariationForm({ ...variationForm, quantidade_variacoes: Number(e.target.value) as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value={3}>3 variações</option>
                        <option value={5}>5 variações</option>
                        <option value={10}>10 variações</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Foco</label>
                      <input
                        type="text"
                        value={variationForm.foco}
                        onChange={(e) => setVariationForm({ ...variationForm, foco: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateVariations}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gerando ângulos com Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🔄 Criar variações</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Analisando o conteúdo original e gerando novos ganchos e narrativas...
                    </p>
                  </div>
                )}

                {!isLoading && generatedVariations.length === 0 && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Repeat className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhuma variação criada</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Selecione um conteúdo para que o Gemini explore novas abordagens estratégicas (curiosidade, dor oculta, quebra de mito, autoridade).
                    </p>
                  </div>
                )}

                {!isLoading && generatedVariations.length > 0 && (
                  <div className="space-y-3">
                    {generatedVariations.map((v) => (
                      <div
                        key={v.id_versao}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-bold">
                              Versão {v.id_versao}
                            </span>
                            <span className="font-bold text-white">{v.tipo_variacao}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(`Hook: ${v.hook}\n\nRoteiro: ${v.roteiro_resumo || ''}\nCTA: ${v.cta}`, `var-${v.id_versao}`)}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                          >
                            {copiedId === `var-${v.id_versao}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                        </div>

                        <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                            Novo Hook:
                          </span>
                          <p className="text-white font-medium italic mt-0.5">"{v.hook}"</p>
                        </div>

                        {v.roteiro_resumo && (
                          <div>
                            <span className="text-slate-400 font-semibold block">Nova Abordagem:</span>
                            <p className="text-slate-300 mt-0.5">{v.roteiro_resumo}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-emerald-400 font-semibold">CTA:</span> {v.cta}
                          </div>
                          <div>
                            <span className="text-indigo-400 font-semibold">Conceito:</span> {v.conceito}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. MELHORAR CONTEÚDO                                                      */}
          {/* ========================================================================= */}
          {activeTool === 'melhorar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <BrainCircuit className="w-4 h-4 text-blue-400" />
                    Auditoria & Otimização
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Selecionar Item para Melhorar</label>
                    <select
                      value={improveForm.selectedItemId}
                      onChange={(e) => setImproveForm({ ...improveForm, selectedItemId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="">-- Ou cole o texto diretamente abaixo --</option>
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          Post: {p.titulo}
                        </option>
                      ))}
                      {ideas.map((i) => (
                        <option key={i.id} value={i.id}>
                          Ideia: {i.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Conteúdo Atual</label>
                    <textarea
                      rows={4}
                      placeholder="Cole aqui o roteiro, legenda, post ou ideia para ser otimizado..."
                      value={improveForm.conteudo_atual}
                      onChange={(e) => setImproveForm({ ...improveForm, conteudo_atual: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Objetivo da Melhoria</label>
                    <select
                      value={improveForm.objetivo_melhoria}
                      onChange={(e) => setImproveForm({ ...improveForm, objetivo_melhoria: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="Mais persuasivo">Mais persuasivo</option>
                      <option value="Mais comercial">Mais comercial</option>
                      <option value="Mais educativo">Mais educativo</option>
                      <option value="Mais curto">Mais curto</option>
                      <option value="Mais viral">Mais viral</option>
                      <option value="Mais profissional">Mais profissional</option>
                      <option value="Mais direto">Mais direto</option>
                      <option value="Mais emocional">Mais emocional</option>
                    </select>
                  </div>

                  <button
                    onClick={handleImproveContent}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditando com Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🧠 Melhorar conteúdo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Identificando pontos fortes, fracos, oportunidades e reescrevendo a versão otimizada...
                    </p>
                  </div>
                )}

                {!isLoading && !improvedAnalysis && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhuma análise realizada</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Envie um conteúdo para receber uma auditoria detalhada com pontos fortes, fracos e a versão 2.0 pronta para postar.
                    </p>
                  </div>
                )}

                {!isLoading && improvedAnalysis && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 text-xs">
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                        <span className="font-bold text-emerald-400 block">✓ Pontos Fortes:</span>
                        <ul className="space-y-1 text-slate-300">
                          {improvedAnalysis.pontos_fortes.map((pf, i) => (
                            <li key={i}>• {pf}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-1.5">
                        <span className="font-bold text-rose-400 block">⚠ Pontos Fracos & Gargalos:</span>
                        <ul className="space-y-1 text-slate-300">
                          {improvedAnalysis.pontos_fracos.map((pf, i) => (
                            <li key={i}>• {pf}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Opportunities */}
                    {improvedAnalysis.oportunidades && improvedAnalysis.oportunidades.length > 0 && (
                      <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 space-y-1">
                        <span className="font-bold text-indigo-400 block">💡 Oportunidades Identificadas:</span>
                        <ul className="space-y-0.5 text-slate-300">
                          {improvedAnalysis.oportunidades.map((op, i) => (
                            <li key={i}>• {op}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improved Version */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-blue-400 text-sm">
                          ✨ Versão Melhorada ({improveForm.objetivo_melhoria}):
                        </span>
                        <button
                          onClick={() => handleCopy(improvedAnalysis.versao_melhorada.corpo_conteudo, 'improved-copy')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          {copiedId === 'improved-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copiar</span>
                        </button>
                      </div>

                      {improvedAnalysis.versao_melhorada.hook && (
                        <div className="p-2 rounded bg-slate-950 text-amber-300 font-medium">
                          Hook: {improvedAnalysis.versao_melhorada.hook}
                        </div>
                      )}

                      <div className="whitespace-pre-line text-slate-200 leading-relaxed">
                        {improvedAnalysis.versao_melhorada.corpo_conteudo}
                      </div>

                      {improvedAnalysis.versao_melhorada.cta && (
                        <div className="pt-2 border-t border-slate-800 text-emerald-400 font-semibold">
                          CTA: {improvedAnalysis.versao_melhorada.cta}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. ANALISAR PERFORMANCE COM DADOS REAIS                                   */}
          {/* ========================================================================= */}
          {activeTool === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Inteligência de Performance
                  </h3>

                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 space-y-1 text-slate-300 text-[11px]">
                    <span className="font-bold text-blue-400 block">Conexão com Dados Reais:</span>
                    <p>
                      O Gemini analisa os dados concretos do seu Meta Ads ({ads.length} anúncios ativos), Meta Pixel e histórico de publicações. Nenhuma métrica é inventada.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Período de Análise</label>
                    <select
                      value={performanceForm.periodo}
                      onChange={(e) => setPerformanceForm({ ...performanceForm, periodo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    >
                      <option value="Últimos 7 dias">Últimos 7 dias</option>
                      <option value="Últimos 30 dias">Últimos 30 dias</option>
                      <option value="Mês Atual">Mês Atual</option>
                      <option value="Todo o histórico disponível">Todo o histórico disponível</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Pergunta Específica para a IA</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Qual formato teve melhor conversão e quais conteúdos abaixo da média devemos pausar?"
                      value={performanceForm.pergunta_especifica}
                      onChange={(e) => setPerformanceForm({ ...performanceForm, pergunta_especifica: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzePerformance}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditando métricas reais...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>📊 Analisar performance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Cruzando dados de Meta Ads, cliques, CTR, CPL e engajamento real...
                    </p>
                  </div>
                )}

                {!isLoading && !performanceAnalysis && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhum diagnóstico gerado</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Clique no botão para que a inteligência artificial audite seus anúncios e publicações com recomendações táticas de otimização.
                    </p>
                  </div>
                )}

                {!isLoading && performanceAnalysis && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 text-xs">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            performanceAnalysis.status_dados === 'dados_reais'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {performanceAnalysis.status_dados === 'dados_reais'
                            ? '✓ Diagnóstico Baseado em Dados Reais'
                            : '⚠ Dados Insuficientes'}
                        </span>
                      </div>
                      <span className="text-slate-400">Auditoria Gemini 3.6 Flash</span>
                    </div>

                    {/* Resumo */}
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed">
                      {performanceAnalysis.resumo}
                    </div>

                    {/* Top Winners & Underperforming */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                        <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[11px]">
                          🏆 Conteúdos Vencedores:
                        </span>
                        {performanceAnalysis.conteudos_vencedores.length > 0 ? (
                          performanceAnalysis.conteudos_vencedores.map((cv, i) => (
                            <div key={i} className="p-2 rounded bg-slate-900/90 border border-slate-800">
                              <span className="font-bold text-white block">{cv.titulo}</span>
                              <span className="text-emerald-400 font-semibold text-[11px]">{cv.metrica_chave}</span>
                              <p className="text-slate-400 mt-1">{cv.por_que_funcionou}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">Nenhum criativo campeão destacado no período.</p>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                        <span className="font-bold text-rose-400 block uppercase tracking-wider text-[11px]">
                          📉 Conteúdos Abaixo da Média:
                        </span>
                        {performanceAnalysis.conteudos_abaixo_media.length > 0 ? (
                          performanceAnalysis.conteudos_abaixo_media.map((ca, i) => (
                            <div key={i} className="p-2 rounded bg-slate-900/90 border border-slate-800">
                              <span className="font-bold text-white block">{ca.titulo}</span>
                              <span className="text-rose-400 font-semibold text-[11px]">{ca.metrica_problema}</span>
                              <p className="text-slate-400 mt-1">{ca.o_que_corrigir}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">Sem conteúdos críticos identificados.</p>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px] block">
                        🎯 Recomendações Estratégicas Imediatas:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {performanceAnalysis.recomendacoes.map((rec, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. GERAR ESTRATÉGIA                                                       */}
          {/* ========================================================================= */}
          {activeTool === 'estrategia' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 text-xs">
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                    <Rocket className="w-4 h-4 text-blue-400" />
                    Parâmetros do Planejamento
                  </h3>

                  <div>
                    <label className="block text-slate-400 mb-1">Período</label>
                    <input
                      type="text"
                      value={strategyForm.periodo}
                      onChange={(e) => setStrategyForm({ ...strategyForm, periodo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Objetivo Estratégico *</label>
                    <textarea
                      rows={2}
                      value={strategyForm.objetivo}
                      onChange={(e) => setStrategyForm({ ...strategyForm, objetivo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Orçamento Previsto</label>
                      <input
                        type="text"
                        value={strategyForm.orcamento}
                        onChange={(e) => setStrategyForm({ ...strategyForm, orcamento: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Qtd. Conteúdos</label>
                      <select
                        value={strategyForm.quantidade_conteudos}
                        onChange={(e) => setStrategyForm({ ...strategyForm, quantidade_conteudos: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                      >
                        <option value={4}>4 conteúdos</option>
                        <option value={8}>8 conteúdos</option>
                        <option value={12}>12 conteúdos</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateStrategy}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Desenhando plano tático...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🚀 Gerar estratégia</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {isLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Montando pilares, distribuição de funil, temas e conteúdos planejados...
                    </p>
                  </div>
                )}

                {!isLoading && !generatedStrategy && (
                  <div className="p-12 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center space-y-3">
                    <Rocket className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">Nenhum planejamento gerado</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Gere uma estratégia completa de 30 dias com pilares e transforme todos os conteúdos gerados diretamente em ideias do sistema com 1 clique.
                    </p>
                  </div>
                )}

                {!isLoading && generatedStrategy && (
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400">
                          {generatedStrategy.periodo} • {generatedStrategy.frequencia_sugerida}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{generatedStrategy.objetivo_geral}</h4>
                      </div>

                      <button
                        onClick={() => handleTransformStrategyToPlan(generatedStrategy)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        {savedSuccessId === 'strategy-all' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Transformado em Ideias!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-4 h-4" />
                            <span>Transformar em planejamento</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pillars & Formats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px] block">
                          Pilares Estratégicos:
                        </span>
                        <ul className="space-y-0.5 text-slate-300">
                          {generatedStrategy.pilares_estrategicos.map((p, i) => (
                            <li key={i}>• {p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] block">
                          Distribuição de Formatos:
                        </span>
                        <ul className="space-y-0.5 text-slate-300">
                          {generatedStrategy.distribuicao_formatos.map((f, i) => (
                            <li key={i}>• {f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Funnel Strategy */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800/40">
                        <span className="text-blue-300 font-bold block">Topo do Funil:</span>
                        <p className="text-slate-300 mt-1">{generatedStrategy.estrategia_funil.topo}</p>
                      </div>
                      <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/40">
                        <span className="text-amber-300 font-bold block">Meio do Funil:</span>
                        <p className="text-slate-300 mt-1">{generatedStrategy.estrategia_funil.meio}</p>
                      </div>
                      <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                        <span className="text-emerald-300 font-bold block">Fundo do Funil:</span>
                        <p className="text-slate-300 mt-1">{generatedStrategy.estrategia_funil.fundo}</p>
                      </div>
                    </div>

                    {/* Planned Posts */}
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                        Conteúdos Recomendados ({generatedStrategy.conteudos_planejados.length}):
                      </span>
                      <div className="space-y-2">
                        {generatedStrategy.conteudos_planejados.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{item.titulo}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {item.formato}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400">
                                  {item.etapa_funil}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Pilar: {item.pilar} • CTA: {item.cta}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                await saveAIIdeaToIdeas({
                                  titulo: item.titulo,
                                  hook: `Pilar: ${item.pilar}`,
                                  conceito: item.tema,
                                  objetivo: generatedStrategy.objetivo_geral,
                                  formato: item.formato,
                                  etapa_funil: item.etapa_funil,
                                  cta: item.cta,
                                  justificativa_estrategica: `Gerado na estratégia ${generatedStrategy.periodo}`,
                                });
                                setSavedSuccessId(`strategy-item-${idx}`);
                                setTimeout(() => setSavedSuccessId(null), 2500);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 shrink-0"
                            >
                              {savedSuccessId === `strategy-item-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <PlusCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Salvar ideia</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. ASSISTENTE LIVRE (CHAT CONVERSACIONAL)                                 */}
          {/* ========================================================================= */}
          {activeTool === 'chat' && (
            <div className="flex flex-col h-[650px] bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden">
              {/* Chat Header Bar */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Chat com Assistente de IA</span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (Memória ativa com contexto das diretrizes da marca)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setChatMessages([
                        {
                          role: 'assistant',
                          content: 'Nova conversa iniciada. Como posso te auxiliar no seu marketing e conteúdo agora?',
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ]);
                      setLastInteractionId(undefined);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Nova conversa</span>
                  </button>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-3xl ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-indigo-600 text-white shadow-sm border border-indigo-500/40'
                      }`}
                    >
                      {msg.role === 'user' ? 'Eu' : 'IA'}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 relative shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-400">
                          {msg.role === 'user' ? currentUser.nome : 'Assistente Gemini'}
                        </span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="prose prose-invert max-w-none text-xs">
                        {msg.content}
                      </div>

                      {msg.role === 'assistant' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleCopy(msg.content, `chat-${idx}`)}
                            className="text-slate-400 hover:text-white p-1"
                            title="Copiar mensagem"
                          >
                            {copiedId === `chat-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 max-w-xl">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm border border-indigo-500/40">
                      IA
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>O Gemini está formulando a resposta...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escreva sua solicitação para o Assistente de IA... (Ex: 'Escreva um anúncio para captação de clientes')"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
