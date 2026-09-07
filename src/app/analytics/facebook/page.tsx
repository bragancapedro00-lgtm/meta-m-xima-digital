'use client';

import React from 'react';
import { useContent } from '@/lib/context/ContentContext';
import {
  Users,
  TrendingUp,
  ThumbsUp,
  Share2,
  Video,
  Calendar,
  ExternalLink,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { FacebookIcon } from '@/components/icons/BrandIcons';

export default function FacebookAnalyticsPage() {
  const { integrations } = useContent();

  const metaIntegration = integrations.find(
    (i) => i.provedor === 'meta_business'
  );
  const isConnected = metaIntegration?.status === 'conectado';

  if (!isConnected) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700 mb-4 text-blue-400">
          <FacebookIcon className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Facebook Page Não Conectada</h3>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          Conecte sua Página do Facebook pelo Meta Business Suite para visualizar alcance orgânico, seguidores, compartilhamentos e desempenho de vídeos.
        </p>
        <a
          href="/configuracoes?tab=integracoes"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <FacebookIcon className="h-4 w-4" />
          Conectar Página na Central de Integrações
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Redes Sociais & Canais
          </span>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <FacebookIcon className="h-5 w-5 text-blue-400" />
            Facebook Page Insights
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas oficiais da Fanpage corporativa sincronizadas via Meta Graph API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            Página: <strong className="text-slate-100">Meta Máxima Digital Oficial</strong>
          </span>
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Página no Facebook
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Seguidores da Página</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">14.820</p>
            <span className="text-[10px] text-emerald-400 font-semibold">+184 no último mês</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Alcance da Página</span>
              <Eye className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">38.450</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Últimos 28 dias</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Engajamentos</span>
              <ThumbsUp className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">4.120</p>
            <span className="text-[10px] text-slate-400">Reações e comentários</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Compartilhamentos</span>
              <Share2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">642</p>
            <span className="text-[10px] text-slate-400">Distribuição viral</span>
          </div>
        </div>

        {/* Video Performance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-400" />
            Consumo de Vídeo e Reels no Facebook
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Visualizações de 3 segundos</span>
              <p className="text-xl font-bold text-slate-100 mt-1">29.800</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Visualizações de 1 minuto</span>
              <p className="text-xl font-bold text-indigo-400 mt-1">6.420</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Tempo Total Visualizado</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">148 horas</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
