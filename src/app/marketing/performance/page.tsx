'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { CreativePerformanceItem, Post } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  DollarSign,
  Users,
  Target,
  Search,
  Filter,
  ArrowUpDown,
  Split,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MetaIcon } from '@/components/icons/BrandIcons';

export default function PerformancePage() {
  const { posts, ads, campaigns, openPostModal } = useContent();

  const [selectedCreativeAId, setSelectedCreativeAId] = useState<string>('post-3');
  const [selectedCreativeBId, setSelectedCreativeBId] = useState<string>('post-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingSortBy, setRankingSortBy] = useState<'leads' | 'cpl' | 'roas' | 'spend'>('leads');

  // Build performance items
  const performanceItems: CreativePerformanceItem[] = useMemo(() => {
    return posts
      .filter((p) => p.classificacao === 'patrocinado' || p.classificacao === 'organico_patrocinado' || !!p.meta_ad_id)
      .map((p) => {
        const ad = ads.find((a) => a.id === p.meta_ad_id || a.post_id === p.id);
        const camp = campaigns.find((c) => c.id === p.meta_campaign_id || (ad && c.id === ad.campaign_id));

        const spend = ad?.spend || 0;
        const leads = ad?.leads || 0;
        const cpl = ad?.cpl || (leads > 0 ? spend / leads : 0);
        const impressions = ad?.impressions || 0;
        const reach = ad?.reach || 0;
        const clicks = ad?.clicks || 0;
        const ctr = ad?.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const cpc = ad?.cpc || (clicks > 0 ? spend / clicks : 0);
        const cpm = ad?.cpm || (impressions > 0 ? (spend / impressions) * 1000 : 0);
        const conversoes = ad?.conversions || leads;
        const cpa = ad?.cpa || cpl;
        const receita = ad?.revenue || 0;
        const roas = ad?.roas || (spend > 0 ? receita / spend : 0);

        let rating: 'excelente' | 'bom' | 'regular' | 'atencao' | 'baixo' = 'regular';
        if (roas > 25 || (cpl > 0 && cpl < 12)) rating = 'excelente';
        else if (roas > 15 || (cpl > 0 && cpl < 18)) rating = 'bom';
        else if (roas > 5 || (cpl > 0 && cpl < 25)) rating = 'regular';
        else rating = 'atencao';

        return {
          post_id: p.id,
          post_titulo: p.titulo,
          thumbnail_url: p.thumbnail_url,
          campaign_name: camp?.name,
          ad_name: ad?.name,
          uso_trafego_pago: p.uso_trafego_pago || 'ativo',
          classificacao: p.classificacao || 'patrocinado',
          investido: spend,
          impressoes: impressions,
          alcance: reach,
          cliques: clicks,
          ctr: ctr,
          cpc: cpc,
          cpm: cpm,
          leads: leads,
          cpl: cpl,
          conversoes: conversoes,
          cpa: cpa,
          receita: receita,
          roas: roas,
          rating,
        };
      });
  }, [posts, ads, campaigns]);

  // Sorted items for ranking
  const sortedItems = useMemo(() => {
    return [...performanceItems].sort((a, b) => {
      if (rankingSortBy === 'leads') return b.leads - a.leads;
      if (rankingSortBy === 'cpl') return (a.cpl || 9999) - (b.cpl || 9999);
      if (rankingSortBy === 'roas') return b.roas - a.roas;
      if (rankingSortBy === 'spend') return b.investido - a.investido;
      return 0;
    });
  }, [performanceItems, rankingSortBy]);

  // Comparator selection
  const postA = posts.find((p) => p.id === selectedCreativeAId) || posts[0];
  const postB = posts.find((p) => p.id === selectedCreativeBId) || posts[1];
  const itemA = performanceItems.find((i) => i.post_id === selectedCreativeAId) || performanceItems[0];
  const itemB = performanceItems.find((i) => i.post_id === selectedCreativeBId) || performanceItems[1];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Inteligência de Conteúdo
          </span>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Performance de Conteúdo & Comparador de Criativos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Classificação por geração de receita, leads e teste comparativo A/B de ganchos e formatos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ordenar Ranking:</span>
          <select
            value={rankingSortBy}
            onChange={(e) => setRankingSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="leads">Mais Leads Gerados</option>
            <option value="cpl">Menor Custo por Lead (CPL)</option>
            <option value="roas">Maior Retorno (ROAS)</option>
            <option value="spend">Maior Investimento</option>
          </select>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Top 3 Podium Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            Top Criativos do Período
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedItems.slice(0, 3).map((item, idx) => (
              <div
                key={item.post_id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    #{idx + 1} em {rankingSortBy.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.rating === 'excelente'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-indigo-500/15 text-indigo-400'
                    }`}
                  >
                    {item.rating}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.post_titulo}
                      className="h-12 w-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-100 truncate">{item.post_titulo}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{item.campaign_name || 'Campanha Direta'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400">Investido</span>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      R$ {item.investido.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Leads</span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">{item.leads}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">ROAS</span>
                    <p className="text-xs font-bold text-amber-300 mt-0.5">{item.roas.toFixed(1)}x</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE-BY-SIDE CREATIVE COMPARATOR TOOL */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Split className="h-4 w-4" />
                Ferramenta de Comparação Lado a Lado (A/B)
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">
                Comparador Estratégico de Criativos
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione dois criativos para diagnosticar retenção do gancho, CPL, CTR e conversão.
              </p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-indigo-400 font-bold">Criativo A:</span>
                <select
                  value={selectedCreativeAId}
                  onChange={(e) => setSelectedCreativeAId(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  {posts.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-500 font-bold text-xs">VS</span>

              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-amber-400 font-bold">Criativo B:</span>
                <select
                  value={selectedCreativeBId}
                  onChange={(e) => setSelectedCreativeBId(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  {posts.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN A */}
            <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded">
                  Criativo A
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  {postA?.tipo.replace('_', ' ')}
                </span>
              </div>

              <div className="flex gap-3">
                {postA?.thumbnail_url && (
                  <img
                    src={postA.thumbnail_url}
                    alt={postA.titulo}
                    className="h-20 w-20 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{postA?.titulo}</h4>
                  <p className="text-xs text-slate-400 mt-1">Funil: {postA?.etapa_funil?.toUpperCase()}</p>
                </div>
              </div>

              {/* Hook */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="block font-bold text-indigo-300 text-[10px] uppercase mb-1">Gancho Utilizado:</span>
                <p className="italic text-slate-300">&ldquo;{postA?.gancho || 'Sem gancho registrado'}&rdquo;</p>
              </div>

              {/* Metrics Table */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Investido</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    R$ {itemA?.investido ? itemA.investido.toFixed(2) : '0,00'}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Leads Gerados</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {itemA?.leads || 0}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Custo por Lead</span>
                  <p className="text-sm font-bold text-indigo-300 mt-0.5">
                    {itemA?.cpl ? `R$ ${itemA.cpl.toFixed(2)}` : '-'}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">ROAS</span>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">
                    {itemA?.roas ? `${itemA.roas.toFixed(1)}x` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN B */}
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded">
                  Criativo B
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  {postB?.tipo.replace('_', ' ')}
                </span>
              </div>

              <div className="flex gap-3">
                {postB?.thumbnail_url && (
                  <img
                    src={postB.thumbnail_url}
                    alt={postB.titulo}
                    className="h-20 w-20 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{postB?.titulo}</h4>
                  <p className="text-xs text-slate-400 mt-1">Funil: {postB?.etapa_funil?.toUpperCase()}</p>
                </div>
              </div>

              {/* Hook */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="block font-bold text-amber-300 text-[10px] uppercase mb-1">Gancho Utilizado:</span>
                <p className="italic text-slate-300">&ldquo;{postB?.gancho || 'Sem gancho registrado'}&rdquo;</p>
              </div>

              {/* Metrics Table */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Investido</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    R$ {itemB?.investido ? itemB.investido.toFixed(2) : '0,00'}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Leads Gerados</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {itemB?.leads || 0}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Custo por Lead</span>
                  <p className="text-sm font-bold text-indigo-300 mt-0.5">
                    {itemB?.cpl ? `R$ ${itemB.cpl.toFixed(2)}` : '-'}
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">ROAS</span>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">
                    {itemB?.roas ? `${itemB.roas.toFixed(1)}x` : '-'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Diagnostic Takeaway */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Diagnóstico de Performance:</strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {(itemA?.cpl || 0) < (itemB?.cpl || 9999)
                  ? `O Criativo A ("${postA?.titulo}") obteve melhor eficiência de custo por lead (R$ ${itemA?.cpl.toFixed(2)} vs R$ ${itemB?.cpl.toFixed(2)}). Ganchos com promessa numérica e prova no início demonstraram 2.3x mais retenção nos primeiros 3 segundos.`
                  : `O Criativo B ("${postB?.titulo}") superou o Criativo A em taxa de conversão final e volume de contatos. Recomenda-se escalar o orçamento no Criativo B e testar variações de CTA no Criativo A.`}
              </p>
            </div>
          </div>
        </div>

        {/* Master Creative Performance Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <h4 className="text-sm font-bold text-slate-100">
              Tabela Completa de Desempenho de Criativos
            </h4>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Conteúdo</th>
                <th className="py-3 px-3">Classificação</th>
                <th className="py-3 px-3 text-right">Investimento</th>
                <th className="py-3 px-3 text-right">Impressões</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Leads</th>
                <th className="py-3 px-3 text-right">CPL</th>
                <th className="py-3 px-3 text-right">ROAS</th>
                <th className="py-3 px-4 text-center">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {performanceItems.map((item) => (
                <tr key={item.post_id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100 max-w-xs">
                    <div className="truncate">{item.post_titulo}</div>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {item.post_id}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-semibold uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {item.classificacao.replace('_', ' + ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-100 tabular-nums">
                    R$ {item.investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                    {item.impressoes.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                    {item.ctr.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                    {item.leads}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-indigo-300 tabular-nums">
                    R$ {item.cpl.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-amber-300 tabular-nums">
                    {item.roas.toFixed(1)}x
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.rating === 'excelente'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-indigo-500/15 text-indigo-400'
                      }`}
                    >
                      {item.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
