'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import ConnectIntegrationModal from '@/components/settings/ConnectIntegrationModal';
import {
  CheckCircle2,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Key,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/BrandIcons';

export default function InstagramView() {
  const { integrations, syncIntegrationData } = useContent();
  const metaIntegration = integrations.find((i) => i.provedor === 'meta_business');
  const isConnected = metaIntegration?.status === 'conectado';
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncIntegrationData('meta_business');
    setIsSyncing(false);
  };

  // Metrics by period
  const metrics = {
    '7d': {
      followers: '24.850',
      followersGrowth: '+120 novos',
      reach: '38.400',
      reachGrowth: '+8.4%',
      engagementRate: '5.1%',
      impressions: '62.100',
      reelsViews: '28.900',
      shares: '1.240',
    },
    '30d': {
      followers: '24.850',
      followersGrowth: '+480 novos',
      reach: '142.300',
      reachGrowth: '+14.2%',
      engagementRate: '4.8%',
      impressions: '215.000',
      reelsViews: '96.400',
      shares: '4.820',
    },
    '90d': {
      followers: '24.850',
      followersGrowth: '+1.640 novos',
      reach: '394.000',
      reachGrowth: '+32.8%',
      engagementRate: '4.6%',
      impressions: '680.000',
      reelsViews: '274.000',
      shares: '12.900',
    },
  }[period];

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-[#090d16] p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
            <InstagramIcon className="h-4 w-4" />
            Meta Graph API
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Instagram Insights</h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas oficiais e acompanhamento de desempenho da conta corporativa conectada.
          </p>
        </div>

        {/* Connection Controls & Sync */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px]"
          >
            <Key className="h-3.5 w-3.5 text-pink-400" />
            <span>{isConnected ? 'Editar Chaves da API Meta' : 'Configurar Chaves da API'}</span>
          </button>

          {isConnected && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 min-h-[38px] shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATE 1: NÃO CONECTADO */}
      {/* ========================================================================= */}
      {!isConnected ? (
        <div className="max-w-xl mx-auto my-12 rounded-2xl bg-slate-900/90 border border-slate-800 p-8 text-center shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-pink-500/20">
            <InstagramIcon className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-100">Instagram não conectado</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Conecte sua conta profissional ou conta de criador de conteúdo via Meta OAuth para importar automaticamente métricas de alcance, seguidores, retenção de Reels e desempenho de posts.
          </p>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-6 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Importação automática de alcance e impressões</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Rastreamento de retenção e visualizações de Reels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Alimentação dos relatórios e do Dashboard da agência</span>
            </div>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 py-3 text-sm font-bold text-white shadow-lg shadow-pink-600/30 transition-all active:scale-95"
          >
            <Key className="h-4 w-4" />
            <span>Inserir Chaves da API do Instagram (Meta Graph API)</span>
          </button>

          <p className="text-[11px] text-slate-500 mt-3">
            Requer Token de Acesso permanente e permissões oficiais do Meta Business Suite: <code className="text-slate-400">instagram_basic</code> e <code className="text-slate-400">instagram_manage_insights</code>.
          </p>
        </div>
      ) : (
        /* ========================================================================= */
        /* STATE 2: CONECTADO COM SUCESSO */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Connected Account Card & Period Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                alt="Perfil Instagram"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-500/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">
                    {metaIntegration?.credenciais?.ig_account_id
                      ? `Instagram ID: ${metaIntegration.credenciais.ig_account_id}`
                      : '@metamaximadigital'}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    <ShieldCheck className="h-3 w-3" />
                    Conta Conectada
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conta Comercial • {metaIntegration?.credenciais?.business_id ? `BM: ${metaIntegration.credenciais.business_id} • ` : ''}
                  Última sincronização: {metaIntegration?.ultima_sincronizacao ? new Date(metaIntegration.ultima_sincronizacao).toLocaleString('pt-BR') : 'Recentemente'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-pink-500/40 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 transition-colors"
              >
                <Key className="h-3.5 w-3.5 text-pink-400" />
                <span>Editar Chaves / Token</span>
              </button>
            </div>

            {/* Period Filters (7d, 30d, 90d) */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '7d' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '30d' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '90d' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                90 Dias
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Seguidores</span>
                <Users className="h-4 w-4 text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.followers}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {metrics.followersGrowth}
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Alcance de Contas</span>
                <Eye className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.reach}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {metrics.reachGrowth} no período
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Taxa de Engajamento</span>
                <Heart className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-pink-400 mt-2 tabular-nums">
                {metrics.engagementRate}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Comentários + Salvamentos</span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Visualizações Reels</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.reelsViews}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {metrics.shares} compartilhamentos
              </span>
            </div>
          </div>

          {/* Temporal Evolution Chart Representation */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Evolução do Alcance Diário ({period})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dados consolidados da API oficial da Meta
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                Tendência de Alta
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-48 flex items-end gap-2 pt-6 border-b border-slate-800">
              {[45, 62, 58, 75, 82, 68, 90, 85, 94, 78, 88, 98, 110, 105].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div
                    className="w-full bg-slate-700/80 rounded-t group-hover:bg-indigo-500 transition-colors duration-200 relative"
                    style={{ height: `${(val / 110) * 100}%` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none transition-opacity font-bold">
                      {val * 40}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
              <span>Início do período</span>
              <span>Metade</span>
              <span>Hoje</span>
            </div>
          </div>

          {/* Top Performing Post Showcase */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Melhor Conteúdo no Período (Top Performer)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80"
                alt="Top Post"
                className="h-32 w-32 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="flex-1 space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Case de Sucesso • Fundo de Funil
                </span>
                <h4 className="text-base font-bold text-slate-100">
                  Como Fechamos R$ 45k de Contratos em 30 Dias com Conteúdo Orgânico
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Post com maior taxa de conversão em leads no direct da história da agência.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <Heart className="h-3.5 w-3.5" /> 184 curtidas
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <MessageCircle className="h-3.5 w-3.5" /> 38 comentários
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Bookmark className="h-3.5 w-3.5" /> 24 salvamentos
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Share2 className="h-3.5 w-3.5" /> 52 compartilhamentos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conexão com Meta Graph API */}
      <ConnectIntegrationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        integration={metaIntegration || null}
      />
    </div>
  );
}
