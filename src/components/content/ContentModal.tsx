'use client';

import React, { useState, useEffect } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Post, PostStatus, PostTipo, EtapaFunil, Prioridade, Plataforma } from '@/types';
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Paperclip,
  History,
  BarChart3,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';

export default function ContentModal() {
  const {
    selectedPost,
    isModalOpen,
    modalTab,
    closePostModal,
    savePost,
    deletePost,
    duplicatePost,
    archivePost,
    isOverdue,
    profiles,
    history,
    files,
    addFile,
    deleteFile,
  } = useContent();

  const [currentTab, setCurrentTab] = useState<'detalhes' | 'roteiro' | 'arquivos' | 'historico' | 'metricas'>('detalhes');
  const [formData, setFormData] = useState<Partial<Post>>({});
  const [copiedScript, setCopiedScript] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedPost) {
      setFormData({ ...selectedPost });
      setCurrentTab(modalTab);
    }
  }, [selectedPost, modalTab]);

  if (!isModalOpen || !selectedPost) return null;

  const postHistory = history.filter((h) => h.post_id === selectedPost.id);
  const postFiles = files.filter((f) => f.post_id === selectedPost.id);
  const overdue = isOverdue(selectedPost);

  const handleInputChange = (field: keyof Post, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(newTagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...currentTags, newTagInput.trim()] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    setFormData((prev) => ({ ...prev, tags: currentTags.filter((t) => t !== tagToRemove) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePost({
        ...formData,
        id: selectedPost.id,
        titulo: formData.titulo || selectedPost.titulo,
        data_publicacao: formData.data_publicacao || selectedPost.data_publicacao,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyFullScript = () => {
    const scriptText = `🎬 ROTEIRO DE CONTEÚDO: ${formData.titulo}
==================================================
TIPO: ${formData.tipo} | FUNIL: ${formData.etapa_funil?.toUpperCase()} | PLATAFORMA: ${formData.plataforma?.toUpperCase()}
DATA: ${formData.data_publicacao} às ${formData.hora_publicacao || '18:00'}
RESPONSÁVEL: ${formData.responsavel}

⚡ GANCHO (Primeiros 3 segundos):
${formData.gancho || 'Não definido'}

📖 DESENVOLVIMENTO:
${formData.roteiro_desenvolvimento || 'Não definido'}

📊 PROVA / ARGUMENTAÇÃO:
${formData.roteiro_prova || 'Não definido'}

🎯 CTA (Chamada para Ação):
${formData.cta || 'Não definido'}

📝 LEGENDA SUGERIDA:
${formData.legenda || 'Não definida'}
==================================================
Meta Máxima Digital - Sistema de Conteúdo`;

    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Mock upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    let categoria: any = 'documento';
    if (uploaded.type.includes('video')) categoria = 'video_editado';
    else if (uploaded.type.includes('image')) categoria = 'imagem';

    addFile({
      post_id: selectedPost.id,
      post_titulo: selectedPost.titulo,
      nome: uploaded.name,
      url: URL.createObjectURL(uploaded),
      tamanho_bytes: uploaded.size,
      tipo_mime: uploaded.type,
      categoria_arquivo: categoria,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do Conteúdo"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="flex h-full w-full max-w-3xl flex-col bg-slate-900 border-l border-slate-800 shadow-2xl text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {formData.tipo?.replace('_', ' ')}
            </span>
            {overdue && (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded-md border border-rose-500/30">
                <AlertTriangle className="h-3.5 w-3.5" />
                Atrasado
              </span>
            )}
            <span className="text-xs text-slate-400">ID: {selectedPost.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  Salvo!
                </>
              ) : isSaving ? (
                'Salvando...'
              ) : (
                'Salvar Alterações'
              )}
            </button>
            <button
              onClick={closePostModal}
              aria-label="Fechar painel de detalhes"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Title & Quick Status Bar */}
        <div className="p-6 pb-2 border-b border-slate-800/80 bg-slate-950/40">
          <input
            type="text"
            value={formData.titulo || ''}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className="w-full bg-transparent text-xl font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 -mx-1 py-1"
            placeholder="Título do conteúdo..."
          />

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={formData.status || 'a_gravar'}
                onChange={(e) => handleInputChange('status', e.target.value as PostStatus)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ideias" className="bg-slate-900 text-slate-100">IDEIAS</option>
                <option value="a_gravar" className="bg-slate-900 text-slate-100">A GRAVAR</option>
                <option value="gravado" className="bg-slate-900 text-slate-100">GRAVADO</option>
                <option value="a_editar" className="bg-slate-900 text-slate-100">A EDITAR</option>
                <option value="editado" className="bg-slate-900 text-slate-100">EDITADO</option>
                <option value="agendado" className="bg-slate-900 text-slate-100">AGENDADO</option>
                <option value="postado" className="bg-slate-900 text-slate-100">POSTADO</option>
              </select>
            </div>

            {/* Funnel Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <span className="text-slate-400 font-medium">Funil:</span>
              <select
                value={formData.etapa_funil || 'topo'}
                onChange={(e) => handleInputChange('etapa_funil', e.target.value as EtapaFunil)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer uppercase"
              >
                <option value="topo" className="bg-slate-900 text-indigo-400">Topo (Atração)</option>
                <option value="meio" className="bg-slate-900 text-cyan-400">Meio (Nutrição)</option>
                <option value="fundo" className="bg-slate-900 text-violet-400">Fundo (Conversão)</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <span className="text-slate-400 font-medium">Prioridade:</span>
              <select
                value={formData.prioridade || 'normal'}
                onChange={(e) => handleInputChange('prioridade', e.target.value as Prioridade)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer uppercase"
              >
                <option value="baixa" className="bg-slate-900 text-slate-400">Baixa</option>
                <option value="normal" className="bg-slate-900 text-blue-400">Normal</option>
                <option value="alta" className="bg-slate-900 text-amber-400">Alta</option>
                <option value="urgente" className="bg-slate-900 text-rose-400">Urgente</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <input
                type="date"
                value={formData.data_publicacao || ''}
                onChange={(e) => handleInputChange('data_publicacao', e.target.value)}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
              />
              <Clock className="h-3.5 w-3.5 text-slate-400 ml-1" />
              <input
                type="time"
                value={formData.hora_publicacao || '18:00'}
                onChange={(e) => handleInputChange('hora_publicacao', e.target.value)}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-slate-800 text-xs font-semibold tracking-wide">
            <button
              onClick={() => setCurrentTab('detalhes')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                currentTab === 'detalhes'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              DETALHES
            </button>
            <button
              onClick={() => setCurrentTab('roteiro')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                currentTab === 'roteiro'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              ROTEIRO
            </button>
            <button
              onClick={() => setCurrentTab('arquivos')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                currentTab === 'arquivos'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Paperclip className="h-3.5 w-3.5" />
              ARQUIVOS ({postFiles.length})
            </button>
            <button
              onClick={() => setCurrentTab('historico')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                currentTab === 'historico'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              HISTÓRICO ({postHistory.length})
            </button>
            <button
              onClick={() => setCurrentTab('metricas')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                currentTab === 'metricas'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              MÉTRICAS
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: DETALHES */}
          {currentTab === 'detalhes' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Conteúdo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Tipo de Conteúdo
                  </label>
                  <select
                    value={formData.tipo || 'reels_video'}
                    onChange={(e) => handleInputChange('tipo', e.target.value as PostTipo)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="reels_video">Reels / Vídeo Curto</option>
                    <option value="carrossel">Carrossel (Slides)</option>
                    <option value="post_estatico">Post Estático</option>
                    <option value="stories">Stories Sequencial</option>
                    <option value="resultado">Resultado / Case de Sucesso</option>
                    <option value="anuncio">Criativo de Anúncio (Meta Ads)</option>
                    <option value="outro">Outro Formato</option>
                  </select>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Responsável
                  </label>
                  <select
                    value={formData.responsavel || ''}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.nome}>
                        {p.nome} ({p.cargo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plataforma */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Plataforma Principal
                  </label>
                  <select
                    value={formData.plataforma || 'instagram'}
                    onChange={(e) => handleInputChange('plataforma', e.target.value as Plataforma)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                {/* Thumbnail Preview / URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    URL da Thumbnail / Capa
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags & Categorias
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.tags?.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      #{t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-400 ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Adicionar tag e pressionar Enter..."
                    className="bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-700"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Observações / Briefing */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Observações & Orientações de Produção
                </label>
                <textarea
                  rows={4}
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Instruções para gravação, referências de iluminação, câmeras, links úteis..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Ações do Card */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => duplicatePost(selectedPost.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    Duplicar Conteúdo
                  </button>
                  <button
                    onClick={() => archivePost(selectedPost.id, true)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    Arquivar
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir permanentemente este conteúdo?')) {
                      deletePost(selectedPost.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir Post
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ROTEIRO */}
          {currentTab === 'roteiro' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Roteirizador Estruturado
                  </h4>
                  <p className="text-xs text-indigo-300/80 mt-0.5">
                    Preencha os blocos estratégicos para garantir retenção e conversão.
                  </p>
                </div>
                <button
                  onClick={handleCopyFullScript}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all active:scale-95"
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Roteiro Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Roteiro
                    </>
                  )}
                </button>
              </div>

              {/* 1. Gancho */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  1. Gancho / Hook (Primeiros 3 segundos)
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Frase de impacto que faz a pessoa parar o scroll imediatamente.
                </p>
                <textarea
                  rows={2}
                  value={formData.gancho || ''}
                  onChange={(e) => handleInputChange('gancho', e.target.value)}
                  placeholder="Ex: Se sua empresa faz isso no Instagram, você provavelmente está perdendo vendas..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. Desenvolvimento */}
              <div>
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  2. Desenvolvimento / Conteúdo Central
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Passo a passo, narrativa ou lista clara com ritmo dinâmico.
                </p>
                <textarea
                  rows={5}
                  value={formData.roteiro_desenvolvimento || ''}
                  onChange={(e) => handleInputChange('roteiro_desenvolvimento', e.target.value)}
                  placeholder="1. Ponto principal...\n2. Explicação prática...\n3. O que evitar..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* 3. Prova */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  3. Prova / Argumentação / Case
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Por que o espectador deve confiar em você? Dados, print, case ou analogia.
                </p>
                <textarea
                  rows={2}
                  value={formData.roteiro_prova || ''}
                  onChange={(e) => handleInputChange('roteiro_prova', e.target.value)}
                  placeholder="Ex: No cliente X, essa mudança aumentou em 40% a taxa de resposta dos directs..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 4. CTA */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  4. Chamada para Ação (CTA)
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Ação única e específica que você quer que a pessoa faça no final.
                </p>
                <input
                  type="text"
                  value={formData.cta || ''}
                  onChange={(e) => handleInputChange('cta', e.target.value)}
                  placeholder="Ex: Salve este post para aplicar na sua próxima gravação."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5. Legenda do Post */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  5. Legenda para Publicação & Hashtags
                </label>
                <textarea
                  rows={4}
                  value={formData.legenda || ''}
                  onChange={(e) => handleInputChange('legenda', e.target.value)}
                  placeholder="Texto completo para a legenda do Instagram com parágrafos e hashtags..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ARQUIVOS */}
          {currentTab === 'arquivos' && (
            <div className="space-y-6">
              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-lg p-6 text-center bg-slate-800/30 transition-colors">
                <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                <h5 className="text-sm font-semibold text-slate-200">
                  Fazer upload para Supabase Storage
                </h5>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Suporta vídeos brutos, cortes editados, arquivos do Canva, imagens e documentos.
                </p>
                <label className="inline-block mt-3 cursor-pointer">
                  <span className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
                    Selecionar Arquivo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Files Table */}
              <div>
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Arquivos Anexados ({postFiles.length})
                </h5>

                {postFiles.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Nenhum arquivo anexado a este conteúdo ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {postFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 p-3 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-700/60 rounded text-indigo-400">
                            <Paperclip className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{file.nome}</p>
                            <p className="text-xs text-slate-400">
                              <span className="uppercase text-indigo-300 font-semibold">{file.categoria_arquivo}</span> •{' '}
                              {(file.tamanho_bytes / 1024 / 1024).toFixed(2)} MB •{' '}
                              {new Date(file.criado_em).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition-colors"
                            title="Visualizar / Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/60 transition-colors"
                            title="Excluir Arquivo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HISTÓRICO */}
          {currentTab === 'historico' && (
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Linha do Tempo de Alterações
              </h5>

              {postHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Nenhuma alteração registrada recentemente.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {postHistory.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-indigo-500 border-2 border-slate-900" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{item.usuario}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.criado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-indigo-400 mt-0.5">{item.acao}</p>
                        {item.detalhe && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.detalhe}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MÉTRICAS */}
          {currentTab === 'metricas' && (
            <div className="space-y-5">
              <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  Métricas Pós-Publicação
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhe os resultados reais alcançados por este conteúdo após a postagem.
                </p>
              </div>

              {formData.status !== 'postado' ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg p-6">
                  <BarChart3 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">
                    Conteúdo ainda não publicado
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Métricas de alcance, impressões, curtidas e salvamentos ficam disponíveis assim que o status for atualizado para POSTADO.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 text-center">
                    <span className="text-xs text-slate-400 font-medium">Alcance</span>
                    <p className="text-xl font-bold text-slate-100 mt-1 tabular-nums">3.420</p>
                  </div>
                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 text-center">
                    <span className="text-xs text-slate-400 font-medium">Curtidas</span>
                    <p className="text-xl font-bold text-slate-100 mt-1 tabular-nums">184</p>
                  </div>
                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 text-center">
                    <span className="text-xs text-slate-400 font-medium">Comentários</span>
                    <p className="text-xl font-bold text-slate-100 mt-1 tabular-nums">38</p>
                  </div>
                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 text-center">
                    <span className="text-xs text-slate-400 font-medium">Salvamentos</span>
                    <p className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">24</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
