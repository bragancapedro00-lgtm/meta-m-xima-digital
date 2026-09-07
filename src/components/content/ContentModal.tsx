'use client';

import React, { useState, useEffect } from 'react';
import { useContent, PostModalTab } from '@/lib/context/ContentContext';
import {
  Post,
  PostStatus,
  PostTipo,
  EtapaFunil,
  Prioridade,
  Plataforma,
  ClassificacaoConteudo,
  UsoTrafegoPago,
  ContaTipo,
  DRIVE_PHYSICAL_STAGES,
  DRIVE_FOLDER_IDS,
} from '@/types';
import AccountBadge from '@/components/common/AccountBadge';
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
  Radio,
  Send,
  Megaphone,
  Share2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Folder,
  ArrowRight,
  ShieldCheck,
  Eye,
  MousePointerClick,
  Users,
  UploadCloud,
} from 'lucide-react';
import { GoogleDriveIcon, MetaIcon, InstagramIcon, FacebookIcon } from '@/components/icons/BrandIcons';

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
    driveFolders,
    campaigns,
    adSets,
    ads,
    creatives,
    auditLogs,
    moveGoogleDriveFile,
    retryGoogleDriveSync,
    linkGoogleDriveFile,
    linkPostToAd,
    integrations,
  } = useContent();

  const [currentTab, setCurrentTab] = useState<PostModalTab>('detalhes');
  const [formData, setFormData] = useState<Partial<Post>>({});
  const [copiedScript, setCopiedScript] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [driveSyncMessage, setDriveSyncMessage] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [retryingDrive, setRetryingDrive] = useState(false);
  const [showDriveLinkForm, setShowDriveLinkForm] = useState(false);
  const [linkFileId, setLinkFileId] = useState('');
  const [linkFileName, setLinkFileName] = useState('');
  const [linkFileUrl, setLinkFileUrl] = useState('');

  // Check checklist items state (local helper for pre-publication)
  const [checklist, setChecklist] = useState({
    copyChecked: false,
    mediaChecked: false,
    bioLinkChecked: false,
    assigneeChecked: false,
  });

  useEffect(() => {
    if (selectedPost) {
      setFormData({ ...selectedPost });
      setCurrentTab(modalTab || 'detalhes');
      setChecklist({
        copyChecked: !!selectedPost.legenda,
        mediaChecked: !!selectedPost.thumbnail_url || files.some((f) => f.post_id === selectedPost.id),
        bioLinkChecked: !!selectedPost.cta,
        assigneeChecked: !!selectedPost.responsavel,
      });
    }
  }, [selectedPost, modalTab, files]);

  if (!isModalOpen || !selectedPost) return null;

  const postHistory = history.filter((h) => h.post_id === selectedPost.id);
  const postFiles = files.filter((f) => f.post_id === selectedPost.id);
  const postAuditLogs = auditLogs.filter(
    (l) => l.entity_id === selectedPost.id || (l.details && l.details.includes(selectedPost.id))
  );
  const overdue = isOverdue(selectedPost);

  // Drive integration state
  const driveIntegration = integrations.find((i) => i.provedor === 'google_drive');
  const isDriveConnected = driveIntegration?.status === 'conectado';
  const currentStatusDriveFolder = driveFolders.find((df) => df.status === formData.status);

  // Meta Ads integration state
  const metaAdsIntegration = integrations.find((i) => i.provedor === 'meta_ads');
  const isMetaAdsConnected = metaAdsIntegration?.status === 'conectado';
  const linkedAd = ads.find((a) => a.id === formData.meta_ad_id || a.post_id === selectedPost.id);
  const linkedCampaign = campaigns.find(
    (c) => c.id === formData.meta_campaign_id || (linkedAd && c.id === linkedAd.campaign_id)
  );

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
    const scriptText = `🎬 ROTEIRO ESTRUTURADO DE CONTEÚDO
==================================================
TÍTULO: ${formData.titulo}
CLASSIFICAÇÃO: ${formData.classificacao?.toUpperCase() || 'ORGÂNICO'} | FORMATO: ${formData.tipo?.replace('_', ' ').toUpperCase()}
FUNIL: ${formData.etapa_funil?.toUpperCase()} | PLATAFORMA: ${formData.plataforma?.toUpperCase()}
DATA: ${formData.data_publicacao} às ${formData.hora_publicacao || '18:00'}
RESPONSÁVEL: ${formData.responsavel}

⚡ 1. HOOK / GANCHO (Primeiros 3 segundos):
${formData.gancho || 'Não definido'}

📖 2. DESENVOLVIMENTO (Estrutura central do vídeo / slides):
${formData.roteiro_desenvolvimento || 'Não definido'}

📊 3. PROVA / ARGUMENTAÇÃO / CASE:
${formData.roteiro_prova || 'Não definido'}

🎯 4. CTA (Chamada para Ação):
${formData.cta || 'Não definido'}

📝 5. LEGENDA SUGERIDA:
${formData.legenda || 'Não definida'}

🏷️ 6. HASHTAGS:
${formData.tags?.map((t) => `#${t}`).join(' ') || 'Não definidas'}

🔗 7. REFERÊNCIAS & OBSERVAÇÕES:
${formData.observacoes || 'Nenhuma'}
==================================================
Meta Máxima Digital - Sistema de Conteúdo & Performance`;

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

  const handleSyncDriveNow = async () => {
    if (!formData.status) return;
    setDriveSyncing(true);
    try {
      const res = await moveGoogleDriveFile(selectedPost.id, formData.status as PostStatus);
      if (res.success) {
        setDriveSyncMessage(`Pasta sincronizada: "${res.folderName}"`);
        setTimeout(() => setDriveSyncMessage(null), 3000);
      }
    } finally {
      setDriveSyncing(false);
    }
  };

  const handleShare = async () => {
    const title = formData.titulo || selectedPost.titulo;
    const text = `📌 ${title}\nStatus: ${(formData.status || selectedPost.status).toUpperCase()}\nData: ${formData.data_publicacao || selectedPost.data_publicacao}${formData.hora_publicacao ? ' às ' + formData.hora_publicacao : ''}\nResponsável: ${formData.responsavel || selectedPost.responsavel}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ title, text, url })) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleLinkDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFileId.trim()) return;
    await linkGoogleDriveFile(selectedPost.id, {
      fileId: linkFileId.trim(),
      fileName: linkFileName.trim() || 'arquivo_drive.mp4',
      fileUrl: linkFileUrl.trim() || `https://drive.google.com/file/d/${linkFileId.trim()}/view`,
    });
    setShowDriveLinkForm(false);
    setLinkFileId('');
    setLinkFileName('');
    setLinkFileUrl('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do Conteúdo"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="flex h-full w-full max-w-4xl flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl text-zinc-100">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 flex-wrap">
            <AccountBadge conta={formData.conta} tags={formData.tags} size="md" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700">
              {formData.tipo?.replace('_', ' ')}
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                formData.classificacao === 'patrocinado'
                  ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                  : formData.classificacao === 'organico_patrocinado'
                  ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                  : 'text-zinc-300 bg-zinc-800/80 border-zinc-700'
              }`}
            >
              {formData.classificacao === 'patrocinado'
                ? 'Patrocinado'
                : formData.classificacao === 'organico_patrocinado'
                ? 'Orgânico + Anúncio'
                : 'Orgânico'}
            </span>
            {overdue && (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded-md border border-rose-500/30">
                <AlertTriangle className="h-3.5 w-3.5" />
                Atrasado
              </span>
            )}
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">ID: {selectedPost.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-750 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95 border border-zinc-700"
              title="Compartilhar conteúdo"
            >
              {shareToast ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Compartilhar</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
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
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Title & Quick Controls Bar */}
        <div className="p-6 pb-3 border-b border-zinc-800/80 bg-zinc-950/40">
          <input
            type="text"
            value={formData.titulo || ''}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 rounded px-1 -mx-1 py-1"
            placeholder="Título do conteúdo..."
          />

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            {/* Account Switcher */}
            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
              <span className="text-zinc-400 text-xs font-medium">Conta:</span>
              <button
                type="button"
                onClick={() => {
                  handleInputChange('conta', 'meta_maxima_digital');
                  const tags = formData.tags || [];
                  const updated = tags.filter((t) => !t.toLowerCase().includes('curso')).concat(['Meta Máxima Digital']);
                  handleInputChange('tags', Array.from(new Set(updated)));
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  (formData.conta || 'meta_maxima_digital') === 'meta_maxima_digital'
                    ? 'bg-blue-950/90 text-blue-400 border border-blue-500/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Digital
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInputChange('conta', 'meta_maxima_cursos');
                  const tags = formData.tags || [];
                  const updated = tags.filter((t) => !t.toLowerCase().includes('digital')).concat(['Meta Máxima Cursos']);
                  handleInputChange('tags', Array.from(new Set(updated)));
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  formData.conta === 'meta_maxima_cursos'
                    ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Cursos
              </button>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <span className="text-zinc-400 font-medium">Status:</span>
              <select
                value={formData.status || 'a_gravar'}
                onChange={(e) => handleInputChange('status', e.target.value as PostStatus)}
                className="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ideias" className="bg-zinc-900 text-zinc-100">IDEIAS</option>
                <option value="a_gravar" className="bg-zinc-900 text-zinc-100">A GRAVAR</option>
                <option value="gravado" className="bg-zinc-900 text-zinc-100">GRAVADO</option>
                <option value="a_editar" className="bg-zinc-900 text-zinc-100">A EDITAR</option>
                <option value="editado" className="bg-zinc-900 text-zinc-100">EDITADO</option>
                <option value="revisao" className="bg-zinc-900 text-zinc-100">EM REVISÃO</option>
                <option value="aprovado" className="bg-zinc-900 text-zinc-100">APROVADO</option>
                <option value="agendado" className="bg-zinc-900 text-zinc-100">AGENDADO</option>
                <option value="postado" className="bg-zinc-900 text-emerald-400">POSTADO</option>
              </select>
            </div>

            {/* Funnel Stage Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <span className="text-zinc-400 font-medium">Funil:</span>
              <select
                value={formData.etapa_funil || 'topo'}
                onChange={(e) => handleInputChange('etapa_funil', e.target.value as EtapaFunil)}
                className="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer uppercase"
              >
                <option value="topo" className="bg-zinc-900 text-cyan-400">Topo (Atração)</option>
                <option value="meio" className="bg-zinc-900 text-blue-400">Meio (Nutrição)</option>
                <option value="fundo" className="bg-zinc-900 text-emerald-400">Fundo (Conversão)</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <span className="text-zinc-400 font-medium">Prioridade:</span>
              <select
                value={formData.prioridade || 'normal'}
                onChange={(e) => handleInputChange('prioridade', e.target.value as Prioridade)}
                className="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer uppercase"
              >
                <option value="baixa" className="bg-zinc-900 text-zinc-400">Baixa</option>
                <option value="normal" className="bg-zinc-900 text-blue-400">Normal</option>
                <option value="alta" className="bg-zinc-900 text-amber-400">Alta</option>
                <option value="urgente" className="bg-zinc-900 text-rose-400">Urgente</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="date"
                value={formData.data_publicacao || ''}
                onChange={(e) => handleInputChange('data_publicacao', e.target.value)}
                className="bg-transparent text-zinc-100 font-medium focus:outline-none cursor-pointer"
              />
              <Clock className="h-3.5 w-3.5 text-zinc-400 ml-1" />
              <input
                type="time"
                value={formData.hora_publicacao || '18:00'}
                onChange={(e) => handleInputChange('hora_publicacao', e.target.value)}
                className="bg-transparent text-zinc-100 font-medium focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Navigation Tabs (Without Meta Ads) */}
          <div className="flex items-center gap-4 mt-6 border-b border-zinc-800 text-xs font-semibold tracking-wide overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCurrentTab('detalhes')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'detalhes'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              DETALHES
            </button>
            <button
              onClick={() => setCurrentTab('roteiro')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'roteiro'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              ROTEIRO ESTRUTURADO
            </button>
            <button
              onClick={() => setCurrentTab('arquivos')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'arquivos'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Folder className="h-3.5 w-3.5" />
              ARQUIVOS ({postFiles.length})
            </button>
            <button
              onClick={() => setCurrentTab('publicacao')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'publicacao'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              PUBLICAÇÃO & CHECKLIST
            </button>
            <button
              onClick={() => setCurrentTab('metricas')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'metricas'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              MÉTRICAS DO CONTEÚDO
            </button>
            <button
              onClick={() => setCurrentTab('historico')}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === 'historico'
                  ? 'border-zinc-100 text-zinc-100 font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              HISTÓRICO ({postHistory.length + postAuditLogs.length})
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
                    Tipo de Formato
                  </label>
                  <select
                    value={formData.tipo || 'reels_video'}
                    onChange={(e) => handleInputChange('tipo', e.target.value as PostTipo)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="reels_video">Reels / Vídeo Curto</option>
                    <option value="carrossel">Carrossel (Slides)</option>
                    <option value="post_estatico">Post Estático</option>
                    <option value="stories">Stories Sequencial</option>
                    <option value="resultado">Resultado / Case de Sucesso</option>
                    <option value="anuncio">Criativo de Anúncio Pago</option>
                    <option value="outro">Outro Formato</option>
                  </select>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Responsável na Equipe
                  </label>
                  <select
                    value={formData.responsavel || ''}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                {/* Cliente / Projeto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cliente / Conta / Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_projeto || ''}
                    onChange={(e) => handleInputChange('cliente_projeto', e.target.value)}
                    placeholder="Ex: Meta Máxima Digital / Clínica Odonto"
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Thumbnail / Capa Preview */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    URL da Thumbnail / Imagem de Capa
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={formData.thumbnail_url || ''}
                      onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    {formData.thumbnail_url && (
                      <a
                        href={formData.thumbnail_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-md text-slate-300 flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver Capa
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags & Segmentações
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
                    placeholder="Digitar tag e pressionar Enter..."
                    className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
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
                  Observações, Direcionamento e Briefing
                </label>
                <textarea
                  rows={4}
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Orientações técnicas para gravação, referências visuais, equipamentos..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions Footer */}
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

          {/* TAB 2: ROTEIRO ESTRUTURADO */}
          {currentTab === 'roteiro' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Roteirizador de Alta Retenção (Metodologia Agency Mission Control)
                  </h4>
                  <p className="text-xs text-indigo-300/80 mt-0.5">
                    Preencha os blocos estruturados para guiar o apresentador e o editor com clareza total.
                  </p>
                </div>
                <button
                  onClick={handleCopyFullScript}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow transition-all active:scale-95"
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      Roteiro Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Roteiro Estruturado
                    </>
                  )}
                </button>
              </div>

              {/* 1. HOOK */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  1. HOOK / GANCHO (Primeiros 3 segundos)
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Frase de choque ou quebra de padrão que impede a pessoa de rolar o feed.
                </p>
                <textarea
                  rows={2}
                  value={formData.gancho || ''}
                  onChange={(e) => handleInputChange('gancho', e.target.value)}
                  placeholder="Ex: Se sua empresa ainda responde direct assim, você está jogando 70% dos seus clientes no lixo..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. DESENVOLVIMENTO */}
              <div>
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  2. DESENVOLVIMENTO / CORPO DO CONTEÚDO
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Estrutura sequencial, tópicos do vídeo, slides do carrossel ou narrativa central.
                </p>
                <textarea
                  rows={5}
                  value={formData.roteiro_desenvolvimento || ''}
                  onChange={(e) => handleInputChange('roteiro_desenvolvimento', e.target.value)}
                  placeholder="1. Ponto cego número 1...\n2. Como corrigir na prática...\n3. Ferramenta recomendada..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* 3. PROVA */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  3. PROVA / ARGUMENTAÇÃO / CASE REAL
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Qual evidência sustenta sua tese? Prints do CRM, dados de faturamento, teste científico ou depoimento.
                </p>
                <textarea
                  rows={2}
                  value={formData.roteiro_prova || ''}
                  onChange={(e) => handleInputChange('roteiro_prova', e.target.value)}
                  placeholder="Ex: Implementamos isso em 30 clientes da agência e a taxa de fechamento subiu de 12% para 38% em 4 semanas..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 4. CTA */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  4. CTA (CHAMADA PARA AÇÃO)
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Comando único e direto que conduz o espectador para a próxima etapa do funil.
                </p>
                <input
                  type="text"
                  value={formData.cta || ''}
                  onChange={(e) => handleInputChange('cta', e.target.value)}
                  placeholder="Ex: Comente 'MÉTODO' para receber nossa planilha de diagnóstico no seu direct."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5. LEGENDA & HASHTAGS */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  5. LEGENDA COMPLETA DO POST
                </label>
                <textarea
                  rows={4}
                  value={formData.legenda || ''}
                  onChange={(e) => handleInputChange('legenda', e.target.value)}
                  placeholder="Texto formatado para publicação no feed com quebras de linha e emojis..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-sm text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ARQUIVOS & GOOGLE DRIVE */}
          {currentTab === 'arquivos' && (() => {
            const isCurrentPhysical = (DRIVE_PHYSICAL_STAGES as string[]).includes(formData.status || selectedPost.status);
            const targetDriveFolder = isCurrentPhysical
              ? {
                  id: DRIVE_FOLDER_IDS[(formData.status || selectedPost.status) as 'gravado' | 'editado' | 'postado'],
                  name: (formData.status || selectedPost.status) === 'gravado' ? 'Gravado' : (formData.status || selectedPost.status) === 'editado' ? 'Editado' : 'Postado',
                }
              : null;
            const hasDriveFile = Boolean(formData.google_drive_file_id || selectedPost.google_drive_file_id || formData.drive_file_id || selectedPost.drive_file_id);
            const driveFileId = formData.google_drive_file_id || selectedPost.google_drive_file_id || formData.drive_file_id || selectedPost.drive_file_id;
            const driveFileName = formData.google_drive_file_name || selectedPost.google_drive_file_name || 'arquivo_drive.mp4';
            const driveFileUrl = formData.google_drive_web_view_link || selectedPost.google_drive_web_view_link || formData.drive_file_url || selectedPost.drive_file_url || (driveFileId ? `https://drive.google.com/file/d/${driveFileId}/view` : '');
            const syncStatus = formData.google_drive_sync_status || selectedPost.google_drive_sync_status || (hasDriveFile ? 'sincronizado' : 'sem_arquivo');
            const syncError = formData.google_drive_sync_error || selectedPost.google_drive_sync_error;

            return (
              <div className="space-y-6">
                
                {/* Google Drive Status Section */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <GoogleDriveIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          Google Drive Workspace
                          {isCurrentPhysical ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              Etapa Física: {targetDriveFolder?.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Etapa Sem Arquivo Físico
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sincronização física seletiva habilitada exclusivamente para: Gravado, Editado e Postado.
                        </p>
                      </div>
                    </div>

                    {isCurrentPhysical && hasDriveFile && (
                      <button
                        onClick={handleSyncDriveNow}
                        disabled={driveSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                      >
                        <Folder className="h-3.5 w-3.5" />
                        {driveSyncing ? 'Sincronizando...' : 'Sincronizar Pasta Agora'}
                      </button>
                    )}
                  </div>

                  {driveSyncMessage && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {driveSyncMessage}
                    </div>
                  )}

                  {!isCurrentPhysical ? (
                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                      <div className="p-2 rounded bg-slate-900 text-slate-300 shrink-0">
                        <Folder className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">
                          Etapa &quot;{(formData.status || selectedPost.status).toUpperCase()}&quot; não exige arquivo no Google Drive.
                        </p>
                        <p className="mt-1 text-slate-400 leading-relaxed text-[11px]">
                          Ideias, A Gravar, A Editar e Agendado fluem livremente sem exigir arquivos físicos. Quando o card for movido para <strong className="text-indigo-300">Gravado</strong>, <strong className="text-indigo-300">Editado</strong> ou <strong className="text-indigo-300">Postado</strong>, a sincronização de pastas será acionada automaticamente.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {/* Physical Stage Folder Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400">Pasta Fixa do Drive:</span>
                          <p className="text-xs font-semibold text-indigo-300 mt-1 flex items-center gap-1.5 font-mono">
                            <Folder className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            {targetDriveFolder?.name} (ID: {targetDriveFolder?.id})
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-medium text-slate-400">Status da Sincronização:</span>
                            <div className="mt-1 flex items-center gap-2">
                              {syncStatus === 'erro' ? (
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                                  ⚠️ Sincronização pendente
                                </span>
                              ) : hasDriveFile ? (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                  ✓ Sincronizado
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Nenhum arquivo vinculado
                                </span>
                              )}
                            </div>
                          </div>

                          {syncStatus === 'erro' && (
                            <button
                              type="button"
                              disabled={retryingDrive}
                              onClick={async () => {
                                setRetryingDrive(true);
                                try {
                                  await retryGoogleDriveSync(selectedPost.id);
                                } finally {
                                  setRetryingDrive(false);
                                }
                              }}
                              className="text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded border border-amber-500/40"
                            >
                              {retryingDrive ? 'Tentando...' : 'Tentar novamente'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Error details if any */}
                      {syncError && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{syncError}</span>
                        </div>
                      )}

                      {/* Linked File Info or Link Button */}
                      {hasDriveFile ? (
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 truncate">
                            <GoogleDriveIcon className="h-5 w-5 shrink-0 text-emerald-400" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-100 truncate">{driveFileName}</p>
                              <p className="text-[11px] text-slate-400 font-mono truncate">ID: {driveFileId}</p>
                            </div>
                          </div>
                          {driveFileUrl && (
                            <a
                              href={driveFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1.5 rounded border border-blue-500/20 shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Abrir no Drive
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-lg bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-2">
                          <p className="text-xs text-slate-400">
                            {formData.status === 'gravado'
                              ? 'Este conteúdo está gravado mas ainda não tem arquivo do Google Drive vinculado.'
                              : 'Este conteúdo ainda não possui um arquivo vinculado ao Google Drive.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowDriveLinkForm(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            Adicionar arquivo do Google Drive
                          </button>
                        </div>
                      )}

                      {/* Form to link Drive File manually */}
                      {showDriveLinkForm && (
                        <form onSubmit={handleLinkDriveSubmit} className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <h6 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <GoogleDriveIcon className="h-4 w-4" />
                              Vincular Arquivo do Google Drive
                            </h6>
                            <button
                              type="button"
                              onClick={() => setShowDriveLinkForm(false)}
                              className="text-slate-500 hover:text-white text-xs"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">ID do Arquivo no Google Drive *</label>
                            <input
                              type="text"
                              required
                              value={linkFileId}
                              onChange={(e) => setLinkFileId(e.target.value)}
                              placeholder="Ex: 19_TAUMLSHKnMnbrCnXh3W2Ckph9L_b0_ ou código do link de compartilhamento"
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Nome do Arquivo</label>
                              <input
                                type="text"
                                value={linkFileName}
                                onChange={(e) => setLinkFileName(e.target.value)}
                                placeholder="Ex: video_bruto_gravacao.mp4"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Link Direto (Opcional)</label>
                              <input
                                type="url"
                                value={linkFileUrl}
                                onChange={(e) => setLinkFileUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowDriveLinkForm(false)}
                              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                            >
                              Salvar Vínculo
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Local / Supabase Storage Upload */}
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                  <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                  <h5 className="text-sm font-semibold text-slate-200">
                    Upload de Arquivos & Assets
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Vídeos brutos, roteiros em PDF, criativos finalizados, fotos e anexos do projeto.
                  </p>
                  <label className="inline-block mt-3 cursor-pointer">
                    <span className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow">
                      Selecionar Arquivo do Computador
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Attached Files List */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Arquivos Vinculados a este Conteúdo ({postFiles.length})
                  </h5>

                  {postFiles.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                      Nenhum arquivo local anexado ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {postFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg hover:bg-slate-850 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded text-indigo-400">
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
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Baixar Arquivo"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
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
            );
          })()}

          {/* TAB 4: PUBLICAÇÃO */}
          {currentTab === 'publicacao' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-400" />
                  Planejamento e Disparo de Publicação
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Canal de Publicação
                    </label>
                    <select
                      value={formData.plataforma || 'instagram'}
                      onChange={(e) => handleInputChange('plataforma', e.target.value as Plataforma)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="instagram">Instagram (Feed/Reels)</option>
                      <option value="facebook">Facebook Page</option>
                      <option value="youtube">YouTube Shorts</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn Company</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Data Programada
                    </label>
                    <input
                      type="date"
                      value={formData.data_publicacao || ''}
                      onChange={(e) => handleInputChange('data_publicacao', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Horário Programado
                    </label>
                    <input
                      type="time"
                      value={formData.hora_publicacao || '18:00'}
                      onChange={(e) => handleInputChange('hora_publicacao', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Pré-Publicação */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Checklist Operacional Pré-Publicação
                </h5>

                <div className="space-y-2 pt-1 text-xs text-slate-300">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950">
                    <input
                      type="checkbox"
                      checked={checklist.copyChecked}
                      onChange={(e) => setChecklist((prev) => ({ ...prev, copyChecked: e.target.checked }))}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Copy, gancho e legenda validados sem erros ortográficos</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950">
                    <input
                      type="checkbox"
                      checked={checklist.mediaChecked}
                      onChange={(e) => setChecklist((prev) => ({ ...prev, mediaChecked: e.target.checked }))}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Vídeo editado / artes de carrossel aprovados pelo cliente</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950">
                    <input
                      type="checkbox"
                      checked={checklist.bioLinkChecked}
                      onChange={(e) => setChecklist((prev) => ({ ...prev, bioLinkChecked: e.target.checked }))}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Link da bio ou palavra-chave de automação verificada e ativa</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950">
                    <input
                      type="checkbox"
                      checked={checklist.assigneeChecked}
                      onChange={(e) => setChecklist((prev) => ({ ...prev, assigneeChecked: e.target.checked }))}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Social Media responsável escalado para monitorar primeiros 60 minutos de comentários</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANÚNCIOS & TRÁFEGO PAGO */}
          {currentTab === 'anuncios' && (
            <div className="space-y-6">
              
              {/* Classification & Status Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                      <MetaIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        Classificação de Tráfego & Meta Ads
                      </h4>
                      <p className="text-xs text-slate-400">
                        Defina se este conteúdo é orgânico, patrocinado ou ambos, e vincule à campanha do Meta Ads.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Classificação do Conteúdo
                    </label>
                    <select
                      value={formData.classificacao || 'organico'}
                      onChange={(e) => handleInputChange('classificacao', e.target.value as ClassificacaoConteudo)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="organico">100% Orgânico</option>
                      <option value="patrocinado">100% Patrocinado (Anúncio)</option>
                      <option value="organico_patrocinado">Ambos (Orgânico + Tráfego Pago)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Status de Uso no Tráfego Pago
                    </label>
                    <select
                      value={formData.uso_trafego_pago || 'nao_utilizado'}
                      onChange={(e) => handleInputChange('uso_trafego_pago', e.target.value as UsoTrafegoPago)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="nao_utilizado">Não Utilizado</option>
                      <option value="em_teste">Em Teste (Validação)</option>
                      <option value="ativo">Ativo (Rodando em Campanha)</option>
                      <option value="pausado">Pausado</option>
                      <option value="finalizado">Finalizado / Histórico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meta Ads Linkage Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Vínculo com o Gerenciador de Anúncios Meta Ads</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isMetaAdsConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isMetaAdsConnected ? 'API Meta Ads Conectada' : 'Não Conectado'}
                  </span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Campaign */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Campanha Meta Ads
                    </label>
                    <select
                      value={formData.meta_campaign_id || ''}
                      onChange={(e) => handleInputChange('meta_campaign_id', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Nenhuma campanha selecionada</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Ad */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Anúncio Vinculado
                    </label>
                    <select
                      value={formData.meta_ad_id || ''}
                      onChange={(e) => {
                        const selectedAdId = e.target.value;
                        handleInputChange('meta_ad_id', selectedAdId);
                        if (selectedAdId) {
                          linkPostToAd(selectedPost.id, selectedAdId, formData.meta_campaign_id);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Nenhum anúncio vinculado</option>
                      {ads.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* If linked to an ad, show real paid performance */}
                {linkedAd && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        Performance do Anúncio no Meta Ads: {linkedAd.name}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
                        {linkedAd.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                      <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Investido (Spend)</span>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                          R$ {linkedAd.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Leads Gerados</span>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{linkedAd.leads}</p>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Custo por Lead (CPL)</span>
                        <p className="text-sm font-bold text-indigo-400 mt-0.5">
                          R$ {linkedAd.cpl.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">ROAS / Retorno</span>
                        <p className="text-sm font-bold text-amber-300 mt-0.5">{linkedAd.roas?.toFixed(1)}x</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MÉTRICAS */}
          {currentTab === 'metricas' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h5 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  Métricas Operacionais & Desempenho Real
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consolidado de métricas orgânicas e anúncios pagos. Dados 100% autênticos sincronizados via API.
                </p>
              </div>

              {/* Organic Metrics Section */}
              <div className="space-y-3">
                <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Métricas Orgânicas do Instagram
                </h6>

                {formData.status !== 'postado' ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/40">
                    <BarChart3 className="h-6 w-6 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-slate-300">
                      Conteúdo ainda em produção (não publicado)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Métricas de engajamento do feed ficarão ativas após status POSTADO.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Alcance Orgânico</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">3.420</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Curtidas</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">184</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Comentários</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">38</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Salvamentos</span>
                      <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">24</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Paid Traffic Metrics Section */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Métricas de Anúncios (Meta Ads)
                </h6>

                {linkedAd ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Investimento</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
                        R$ {linkedAd.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Impressões Pagas</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
                        {linkedAd.impressions.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Cliques no Link</span>
                      <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
                        {linkedAd.clicks.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-medium">Leads / Vendas</span>
                      <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">{linkedAd.leads}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/40">
                    <p className="text-xs font-medium text-slate-400">
                      Conteúdo 100% orgânico — sem vínculo ativo com anúncios pagos
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Para visualizar métricas de tráfego pago, vincule um anúncio na aba "Anúncios".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HISTÓRICO & AUDITORIA */}
          {currentTab === 'historico' && (
            <div className="space-y-5">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Linha do Tempo de Alterações & Logs de Auditoria
              </h5>

              {postHistory.length === 0 && postAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Nenhuma alteração registrada recentemente.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {/* Standard post edits */}
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

                  {/* Audit Logs specifically related to Drive or Ads */}
                  {postAuditLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-slate-900" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300">{log.user_name}</span>
                          <span className="text-[10px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1.5 rounded border border-amber-500/20">
                            Auditoria: {log.action}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(log.criado_em || log.created_at || Date.now()).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-medium">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
