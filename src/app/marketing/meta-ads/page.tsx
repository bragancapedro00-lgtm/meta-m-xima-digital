'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { MetaCampaign, MetaAdSet, MetaAd } from '@/types';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  MousePointerClick,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { MetaIcon } from '@/components/icons/BrandIcons';

export default function MetaAdsPage() {
  const {
    campaigns,
    adSets,
    ads,
    posts,
    integrations,
    openPostModal,
  } = useContent();

  const [activeTab, setActiveTab] = useState<'campanhas' | 'conjuntos' | 'anuncios'>('campanhas');
  const [selectedAccountId, setSelectedAccountId] = useState('act_904812395');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  const metaAdsIntegration = integrations.find(
    (i) => i.provedor === 'meta_ads' || i.provedor === 'meta_business'
  );
  const isConnected = metaAdsIntegration?.status === 'conectado';

  // Overall KPIs computation
  const totalSpend = useMemo(() => campaigns.reduce((acc, c) => acc + (c.spend || 0), 0), [campaigns]);
  const totalLeads = useMemo(() => campaigns.reduce((acc, c) => acc + (c.leads || 0), 0), [campaigns]);
  const totalImpressions = useMemo(() => campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0), [campaigns]);
  const totalClicks = useMemo(() => campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0), [campaigns]);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // Filtered Ads
  const filteredAds = useMemo(() => {
    return ads.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [ads, statusFilter, searchQuery]);

  if (!isConnected) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700 mb-4 text-slate-400">
          <MetaIcon className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Meta Ads Não Conectado</h3>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          Conecte sua conta do Meta Business Suite e ID da Conta de Anúncios para sincronizar dados reais de campanhas, gastos, CPL e criativos.
        </p>
        <a
          href="/configuracoes?tab=integracoes"
          className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Megaphone className="h-4 w-4" />
          Conectar Meta Ads na Central de Integrações
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Tráfego Pago & Performance
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              API Live
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2.5">
            <MetaIcon className="h-5 w-5 text-indigo-400" />
            Meta Ads Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão operacional de campanhas, conjuntos de anúncios e criativos vinculados aos conteúdos do Kanban.
          </p>
        </div>

        {/* Account Selector & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Conta:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-transparent font-semibold text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="act_904812395" className="bg-slate-900">
                Meta Máxima Digital (act_904812395)
              </option>
              <option value="act_client_02" className="bg-slate-900">
                Clínica Odonto Prime (act_58291048)
              </option>
            </select>
          </div>

          <a
            href="https://adsmanager.facebook.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir no Meta
          </a>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-6 pb-2 shrink-0">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Investimento</span>
            <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
            R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Últimos 30 dias</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Leads Gerados</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">{totalLeads}</p>
          <span className="text-[10px] text-emerald-500/80">Contatos validados</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Custo por Lead</span>
            <Target className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-amber-300 mt-1 tabular-nums">
            R$ {avgCpl.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Média das campanhas</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Impressões</span>
            <Megaphone className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
            {totalImpressions.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500">Total de exibições</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cliques no Link</span>
            <MousePointerClick className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1 tabular-nums">
            {totalClicks.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500">CTR {avgCtr.toFixed(2)}%</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Criativos Ativos</span>
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <p className="text-lg font-bold text-violet-300 mt-1 tabular-nums">{ads.length}</p>
          <span className="text-[10px] text-slate-500">Vínculos com Kanban</span>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('campanhas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'campanhas'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Campanhas ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('conjuntos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'conjuntos'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Conjuntos de Anúncios ({adSets.length})
          </button>
          <button
            onClick={() => setActiveTab('anuncios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'anuncios'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Anúncios & Criativos ({ads.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Apenas Ativos</option>
            <option value="PAUSED">Apenas Pausados</option>
          </select>

          {/* Search box */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pelo nome..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: CAMPANHAS */}
        {activeTab === 'campanhas' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Campanha</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Objetivo</th>
                  <th className="py-3 px-3 text-right">Orçamento / Dia</th>
                  <th className="py-3 px-3 text-right">Gasto</th>
                  <th className="py-3 px-3 text-right">Leads</th>
                  <th className="py-3 px-3 text-right">CPL Médio</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs">
                      <div className="truncate">{camp.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {camp.id}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {camp.status === 'ACTIVE' ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-medium uppercase">
                        {camp.objective.replace('OUTCOME_', '')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 font-medium tabular-nums">
                      R$ {camp.daily_budget ? camp.daily_budget.toFixed(2) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-100 tabular-nums">
                      R$ {camp.spend?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {camp.leads || 0}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-indigo-300 tabular-nums">
                      {camp.cpl ? `R$ ${camp.cpl.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                      {camp.ctr ? `${camp.ctr.toFixed(2)}%` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveTab('anuncios')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Ver Anúncios &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CONJUNTOS DE ANÚNCIOS */}
        {activeTab === 'conjuntos' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Conjunto</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Segmentação / Público</th>
                  <th className="py-3 px-3 text-right">Orçamento / Dia</th>
                  <th className="py-3 px-3 text-right">Gasto</th>
                  <th className="py-3 px-3 text-right">Leads</th>
                  <th className="py-3 px-3 text-right">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {adSets.map((adset) => (
                  <tr key={adset.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {adset.name}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {adset.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs max-w-md">
                      {adset.targeting_summary || 'Público aberto'}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                      R$ {adset.daily_budget ? adset.daily_budget.toFixed(2) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-100 tabular-nums">
                      R$ {adset.spend ? adset.spend.toFixed(2) : '0,00'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {adset.leads || 0}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-indigo-300 tabular-nums">
                      {adset.cpl ? `R$ ${adset.cpl.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: ANÚNCIOS & CRIATIVOS (COM LINK PARA O POST) */}
        {activeTab === 'anuncios' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Anúncio</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Conteúdo do Kanban (Vínculo)</th>
                  <th className="py-3 px-3 text-right">Investido</th>
                  <th className="py-3 px-3 text-right">Impressões</th>
                  <th className="py-3 px-3 text-right">Cliques</th>
                  <th className="py-3 px-3 text-right">Leads</th>
                  <th className="py-3 px-3 text-right">CPL</th>
                  <th className="py-3 px-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAds.map((ad) => {
                  const linkedPost = posts.find((p) => p.id === ad.post_id || p.meta_ad_id === ad.id);

                  return (
                    <tr key={ad.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs">
                        <div className="truncate">{ad.name}</div>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {ad.id}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {ad.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {linkedPost ? (
                          <button
                            onClick={() => openPostModal(linkedPost, 'anuncios')}
                            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                          >
                            {linkedPost.thumbnail_url && (
                              <img
                                src={linkedPost.thumbnail_url}
                                alt={linkedPost.titulo}
                                className="h-8 w-8 rounded object-cover border border-slate-700 shrink-0"
                              />
                            )}
                            <div className="max-w-[180px]">
                              <p className="text-xs font-bold text-indigo-300 truncate">{linkedPost.titulo}</p>
                              <span className="text-[10px] text-slate-400 uppercase">
                                Status: {linkedPost.status.replace('_', ' ')}
                              </span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Sem conteúdo vinculado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-100 tabular-nums">
                        R$ {ad.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                        {ad.impressions.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                        {ad.clicks.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {ad.leads}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-indigo-300 tabular-nums">
                        R$ {ad.cpl.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-300 tabular-nums">
                        {ad.roas?.toFixed(1)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
