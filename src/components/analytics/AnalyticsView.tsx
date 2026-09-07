'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import ConnectIntegrationModal from '@/components/settings/ConnectIntegrationModal';
import {
  TrendingUp,
  Users,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Globe,
  ArrowUpRight,
  Share2,
  MousePointerClick,
  Layers,
  Key,
} from 'lucide-react';

export default function AnalyticsView() {
  const { integrations, syncIntegrationData } = useContent();
  const gaIntegration = integrations.find((i) => i.provedor === 'google_analytics');
  const isConnected = gaIntegration?.status === 'conectado';
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncIntegrationData('google_analytics');
    setIsSyncing(false);
  };

  const metrics = {
    '7d': {
      users: '4.820',
      usersGrowth: '+18.4%',
      sessions: '6.140',
      views: '15.200',
      newUsers: '3.910',
      avgDuration: '2m 18s',
      conversionRate: '3.4%',
    },
    '30d': {
      users: '18.420',
      usersGrowth: '+24.6%',
      sessions: '24.900',
      views: '58.400',
      newUsers: '14.800',
      avgDuration: '2m 35s',
      conversionRate: '3.8%',
    },
    '90d': {
      users: '52.100',
      usersGrowth: '+42.1%',
      sessions: '69.400',
      views: '162.000',
      newUsers: '41.200',
      avgDuration: '2m 42s',
      conversionRate: '4.1%',
    },
  }[period];

  const topPages = [
    { path: '/diagnostico-estrategico', views: '14.240', users: '9.800', conversion: '6.2%' },
    { path: '/cases-de-sucesso', views: '11.890', users: '7.650', conversion: '5.4%' },
    { path: '/servicos/gestao-conteudo', views: '9.420', users: '6.120', conversion: '4.8%' },
    { path: '/blog/erros-instagram-2026', views: '8.340', users: '5.900', conversion: '2.9%' },
    { path: '/sobre-a-agencia', views: '4.210', users: '3.100', conversion: '2.1%' },
  ];

  const trafficSources = [
    { source: 'Instagram Orgânico (Bio / Stories)', percentage: 48, sessions: '11.952', color: 'bg-pink-500' },
    { source: 'Tráfego Pago (Meta Ads)', percentage: 26, sessions: '6.474', color: 'bg-indigo-500' },
    { source: 'Google Busca Orgânica (SEO)', percentage: 16, sessions: '3.984', color: 'bg-emerald-500' },
    { source: 'Direto / Outros', percentage: 10, sessions: '2.490', color: 'bg-slate-500' },
  ];

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-[#090d16] p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            Google Analytics 4 (GA4)
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Métricas de Tráfego e Conversão</h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o fluxo de visitantes, páginas de maior conversão e impacto do conteúdo no tráfego do site.
          </p>
        </div>

        {/* Connection Controls & Sync */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[38px]"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>{isConnected ? 'Editar Chaves do GA4' : 'Configurar Chaves do GA4'}</span>
          </button>

          {isConnected && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 min-h-[38px] shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Atualizando...' : 'Atualizar GA4'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATE 1: NÃO CONECTADO */}
      {/* ========================================================================= */}
      {!isConnected ? (
        <div className="max-w-xl mx-auto my-12 rounded-2xl bg-slate-900/90 border border-slate-800 p-8 text-center shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <TrendingUp className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-100">Google Analytics não conectado</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Conecte sua propriedade do Google Analytics 4 para acompanhar sessões, páginas mais acessadas, origem de visitantes e conversões originadas das redes sociais.
          </p>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-6 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Rastreamento em tempo real de visitantes e sessões</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Mapeamento da jornada de leads do Instagram ao site</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Taxa de conversão de páginas e eventos de diagnóstico</span>
            </div>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/30 transition-all active:scale-95"
          >
            <Key className="h-4 w-4" />
            <span>Inserir Chaves da API do Google Analytics 4</span>
          </button>

          <p className="text-[11px] text-slate-500 mt-3">
            Autenticação via ID da Propriedade GA4 e Conta de Serviço do Google Cloud com escopo seguro <code className="text-slate-400">analytics.readonly</code>.
          </p>
        </div>
      ) : (
        /* ========================================================================= */
        /* STATE 2: CONECTADO COM SUCESSO */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Property Info & Period Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">
                    {gaIntegration?.credenciais?.property_id
                      ? `Propriedade GA4: ${gaIntegration.credenciais.property_id}`
                      : 'metamaxima.com.br'}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    <ShieldCheck className="h-3 w-3" />
                    Propriedade GA4 Ativa
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stream ID: {gaIntegration?.credenciais?.measurement_id || 'G-XXXXXXXXXX'} • {gaIntegration?.credenciais?.client_email ? `Conta de Serviço: ${gaIntegration.credenciais.client_email} • ` : ''}
                  Última sincronização: {gaIntegration?.ultima_sincronizacao ? new Date(gaIntegration.ultima_sincronizacao).toLocaleString('pt-BR') : 'Recentemente'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 transition-colors"
              >
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Editar Chaves GA4</span>
              </button>
            </div>

            {/* Period Filters */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '7d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '30d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`px-3 py-1 rounded transition-colors ${
                  period === '90d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                90 Dias
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Usuários Ativos</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.users}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {metrics.usersGrowth} no período
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Sessões Totais</span>
                <MousePointerClick className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.sessions}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Duração média: {metrics.avgDuration}
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Visualizações de Página</span>
                <Eye className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
                {metrics.views}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {metrics.newUsers} novos usuários
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Taxa de Conversão</span>
                <ArrowUpRight className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2 tabular-nums">
                {metrics.conversionRate}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Formulário de diagnóstico</span>
            </div>
          </div>

          {/* Traffic Sources & Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Traffic Sources */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">
                Origem do Tráfego (Canais)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Como os visitantes chegam ao site da agência
              </p>

              <div className="space-y-4">
                {trafficSources.map((item) => (
                  <div key={item.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{item.source}</span>
                      <span className="font-bold text-slate-200 tabular-nums">
                        {item.percentage}% ({item.sessions})
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Visited Pages */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">
                Páginas Mais Acessadas
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Páginas de destino que mais geram interesse e cadastros
              </p>

              <div className="divide-y divide-slate-800/80">
                {topPages.map((page) => (
                  <div key={page.path} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate max-w-[220px]">
                      <p className="font-semibold text-slate-200 truncate">{page.path}</p>
                      <span className="text-[10px] text-slate-400">
                        {page.users} visitantes únicos
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-100 tabular-nums">{page.views} views</span>
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        {page.conversion} conv.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Conexão com Google Analytics 4 */}
      <ConnectIntegrationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        integration={gaIntegration || null}
      />
    </div>
  );
}
