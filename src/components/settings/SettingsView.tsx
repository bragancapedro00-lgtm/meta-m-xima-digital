'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import TeamManagement from './TeamManagement';
import AccountBadge from '@/components/common/AccountBadge';
import { BRAND_PRESETS } from '@/lib/ai/gemini';
import {
  Settings,
  Users,
  ShieldCheck,
  Database,
  Sparkles,
  Check,
  Server,
  FileCode,
  Tag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from 'lucide-react';

const SQL_SCHEMA_SNIPPET = `-- TABELA DE PERFIS & PERMISSÕES (META MÁXIMA DIGITAL)
create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  avatar_url text,
  cargo text,
  role text not null default 'editor',
  status text not null default 'ativo',
  permissoes jsonb not null default '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": false, "canPublishContent": false, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb,
  senha text default '123456',
  criado_em timestamptz not null default now()
);

-- Garantir colunas essenciais
alter table public.perfis add column if not exists status text not null default 'ativo';
alter table public.perfis add column if not exists permissoes jsonb default '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": false, "canPublishContent": false, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb;
alter table public.perfis add column if not exists senha text default '123456';
alter table public.perfis add column if not exists role text default 'editor';

-- Habilitar RLS e permitir leitura/escrita para colaboradores
alter table public.perfis enable row level security;
drop policy if exists "Permitir acesso completo a perfis" on public.perfis;
create policy "Permitir acesso completo a perfis"
  on public.perfis for all
  to authenticated, anon
  using (true)
  with check (true);`;

export default function SettingsView() {
  const { isSupabaseLive, profiles } = useContent();

  const [activeTab, setActiveTab] = useState<'equipe' | 'marcas' | 'sistema'>('sistema');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusData, setStatusData] = useState<{
    isConfigured: boolean;
    url: string;
    maskedKey: string;
    connectionOk: boolean;
    hasPerfisTable: boolean;
    connectionError?: string;
    localProfilesCount: number;
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Previne memory leaks limpando timeouts ao desmontar
  const timeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = React.useRef(true);

  const registerTimeout = React.useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      if (isMountedRef.current) fn();
    }, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Carrega status atual do Supabase da API
  const fetchSupabaseStatus = React.useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/settings/supabase', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current && data.success) {
          setStatusData(data);
          if (data.url) {
            setSupabaseUrl(data.url);
          }
        }
      }
    } catch {
      // Falha silenciosa
    } finally {
      if (isMountedRef.current) setLoadingStatus(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSupabaseStatus();
  }, [fetchSupabaseStatus]);

  const handleSaveEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || (!supabaseKey.trim() && !statusData?.isConfigured)) {
      setFeedback({
        type: 'error',
        message: 'Preencha a URL e a Anon Key do Supabase antes de conectar.',
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: supabaseUrl.trim(),
          anonKey: supabaseKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const finalUrl = data.url || supabaseUrl.trim();
        setSupabaseUrl(finalUrl);
        // Salva tambem no localStorage para acesso imediato no cliente
        try {
          localStorage.setItem('mmd_supabase_url', finalUrl);
          if (supabaseKey.trim()) {
            localStorage.setItem('mmd_supabase_anon_key', supabaseKey.trim());
          }
        } catch {}

        setFeedback({
          type: data.hasPerfisTable ? 'success' : 'info',
          message: data.message || 'Supabase conectado e sincronizado com sucesso!',
        });
        await fetchSupabaseStatus();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Não foi possível conectar ao Supabase. Verifique a URL e a Anon Key.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro de conexão com o servidor.',
      });
    } finally {
      if (isMountedRef.current) setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || `Sincronização concluída com sucesso!`,
        });
        await fetchSupabaseStatus();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Falha ao sincronizar com o banco de dados.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Erro ao comunicar com o serviço de sincronização.',
      });
    } finally {
      if (isMountedRef.current) setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    registerTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-zinc-300" />
          Administração da Plataforma
        </span>
        <h1 className="text-2xl font-bold text-white mt-0.5">Configurações do Sistema</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie membros da equipe, treinamento da IA por conta e infraestrutura operacional.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('marcas')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'marcas'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4 text-zinc-300" />
          Contas & Treinamento da IA
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equipe')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'equipe'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipe & Permissões
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sistema')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'sistema'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="h-4 w-4" />
          Banco de Dados & Storage
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTAS & TREINAMENTO DA IA */}
      {/* ========================================================================= */}
      {activeTab === 'marcas' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">
              ✨ Treinamento Minucioso da IA do Gemini (Interactions API):
            </span>
            A inteligência artificial foi calibrada para atuar em duas frentes distintas com parâmetros exclusivos de linguagem, psicologia de conversão e regras de compliance. Use as tags para categorizar conteúdos e direcionar a geração.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meta Máxima Digital (Azul) */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <AccountBadge conta="meta_maxima_digital" size="md" />
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-500/30">
                  Tag: Azul
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Nicho & Posicionamento:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.nicho}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Público-Alvo:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.publico_alvo}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Tom de Voz da IA:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.tom_de_voz}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Termos Obrigatórios Injetados:</span>
                  <p className="text-blue-300 font-mono text-[11px] bg-zinc-950 p-2 rounded border border-zinc-800">
                    {BRAND_PRESETS.meta_maxima_digital.palavras_obrigatorias}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">CTA Padrão de Conversão:</span>
                  <p className="text-zinc-300 italic bg-zinc-950 p-2 rounded border border-zinc-800">
                    &quot;{BRAND_PRESETS.meta_maxima_digital.cta_padrao}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Máxima Cursos (Verde) */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <AccountBadge conta="meta_maxima_cursos" size="md" />
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                  Tag: Verde
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Nicho & Posicionamento:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.nicho}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Público-Alvo:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.publico_alvo}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Tom de Voz da IA:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.tom_de_voz}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Termos Obrigatórios Injetados:</span>
                  <p className="text-emerald-300 font-mono text-[11px] bg-zinc-950 p-2 rounded border border-zinc-800">
                    {BRAND_PRESETS.meta_maxima_cursos.palavras_obrigatorias}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">CTA Padrão de Conversão:</span>
                  <p className="text-zinc-300 italic bg-zinc-950 p-2 rounded border border-zinc-800">
                    &quot;{BRAND_PRESETS.meta_maxima_cursos.cta_padrao}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EQUIPE & PERMISSÕES */}
      {/* ========================================================================= */}
      {activeTab === 'equipe' && <TeamManagement />}

      {/* ========================================================================= */}
      {/* TAB 3: BANCO DE DADOS & STORAGE */}
      {/* ========================================================================= */}
      {activeTab === 'sistema' && (
        <div className="space-y-6 max-w-3xl">
          {/* Card Principal de Conexao */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    Banco de Dados em Nuvem (Supabase)
                    {statusData?.isConfigured && statusData?.connectionOk ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Conectado & Sincronizado
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Modo Local (Pendente Nuvem)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Sincronização automática em nuvem para que perfis e conteúdos sejam acessados de qualquer dispositivo.
                  </p>
                </div>
              </div>

              {statusData?.isConfigured && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto shrink-0 min-h-[40px]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-zinc-400'}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Perfis Agora'}
                </button>
              )}
            </div>

            {/* Banner de Feedback Interativo */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : feedback.type === 'info'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : feedback.type === 'info' ? (
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed">{feedback.message}</div>
              </div>
            )}

            {/* Status Operacional Detalhado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Status da Conexão
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusData?.isConfigured && statusData?.connectionOk
                        ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                        : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    }`}
                  />
                  <span className="text-xs font-semibold text-zinc-200">
                    {statusData?.isConfigured && statusData?.connectionOk
                      ? 'Nuvem Conectada'
                      : 'Aguardando Credenciais'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Tabela de Perfis
                </span>
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  {statusData?.hasPerfisTable ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Ativa no PostgreSQL
                    </>
                  ) : statusData?.isConfigured ? (
                    <span className="text-amber-400">Pendente de criação SQL</span>
                  ) : (
                    <span className="text-zinc-500">Não verificada</span>
                  )}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Colaboradores Cadastrados
                </span>
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  {profiles.length} membro(s) no sistema
                </span>
              </div>
            </div>

            {/* Formulario de Credenciais */}
            <form onSubmit={handleSaveEnv} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  URL do Projeto Supabase (Project URL)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://seu-projeto.supabase.co"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500/80 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Encontrado em <em>Project Settings &gt; API &gt; Project URL</em> no painel do Supabase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Chave Pública Anônima (anon public key)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder={
                      statusData?.maskedKey
                        ? `Chave atual: ${statusData.maskedKey} (digite para alterar)`
                        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 pr-11 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500/80 transition-all placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-200 p-1"
                    title={showKey ? 'Ocultar chave' : 'Exibir chave'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Encontrado em <em>Project Settings &gt; API &gt; Project API Keys &gt; anon public</em>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir Painel do Supabase
                </a>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-900" />
                      Validando & Conectando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Salvar & Conectar ao Supabase
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card: Script SQL da Tabela de Perfis */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">
                    Script SQL para o Banco do Supabase (Tabela de Perfis)
                  </h5>
                  <p className="text-[11px] text-zinc-400">
                    Copie e execute no <strong>SQL Editor</strong> do Supabase caso ainda não tenha rodado o schema.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all active:scale-95 shrink-0 self-start sm:self-auto min-h-[38px]"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-300" />
                    Copiar Código SQL
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-36 leading-relaxed select-all">
              {SQL_SCHEMA_SNIPPET}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
