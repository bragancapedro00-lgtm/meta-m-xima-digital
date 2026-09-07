'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { UsoTrafegoPago, Post } from '@/types';
import {
  Sparkles,
  DollarSign,
  Users,
  Target,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Megaphone,
  Layers,
  Calendar,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { MetaIcon } from '@/components/icons/BrandIcons';

export default function PatrocinadosPage() {
  const { posts, ads, campaigns, openPostModal } = useContent();

  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [funnelFilter, setFunnelFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts that are classified as paid or hybrid
  const paidPosts = useMemo(() => {
    return posts.filter((p) => {
      const isPaid = p.classificacao === 'patrocinado' || p.classificacao === 'organico_patrocinado' || !!p.meta_ad_id;
      if (!isPaid) return false;
      if (statusFilter !== 'todos' && p.uso_trafego_pago !== statusFilter) return false;
      if (funnelFilter !== 'todos' && p.etapa_funil !== funnelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.titulo.toLowerCase().includes(q);
        const matchHook = p.gancho?.toLowerCase().includes(q);
        if (!matchTitle && !matchHook) return false;
      }
      return true;
    });
  }, [posts, statusFilter, funnelFilter, searchQuery]);

  // Aggregate stats
  const totalPaidPosts = paidPosts.length;
  const activePaidPosts = paidPosts.filter((p) => p.uso_trafego_pago === 'ativo').length;
  const inTestPaidPosts = paidPosts.filter((p) => p.uso_trafego_pago === 'em_teste').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Tráfego Pago & Criativos
          </span>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Conteúdos Patrocinados & Criativos de Anúncio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cards de conteúdo do Kanban validados e impulsionados como anúncios de conversão e captação de leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Ativos em Anúncios:</span>
            <strong className="text-emerald-400 font-bold">{activePaidPosts}</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Em Teste:</span>
            <strong className="text-amber-400 font-bold">{inTestPaidPosts}</strong>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
            <span className="text-slate-400">Status Tráfego:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-slate-900">Todos</option>
              <option value="ativo" className="bg-slate-900">Ativo</option>
              <option value="em_teste" className="bg-slate-900">Em Teste</option>
              <option value="pausado" className="bg-slate-900">Pausado</option>
              <option value="finalizado" className="bg-slate-900">Finalizado</option>
            </select>
          </div>

          {/* Funnel filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
            <span className="text-slate-400">Etapa Funil:</span>
            <select
              value={funnelFilter}
              onChange={(e) => setFunnelFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer uppercase"
            >
              <option value="todos" className="bg-slate-900">Todas</option>
              <option value="topo" className="bg-slate-900">Topo (Atração)</option>
              <option value="meio" className="bg-slate-900">Meio (Nutrição)</option>
              <option value="fundo" className="bg-slate-900">Fundo (Conversão)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou gancho..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {paidPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
            <Sparkles className="h-10 w-10 text-slate-600 mb-3" />
            <h4 className="text-base font-semibold text-slate-200">Nenhum conteúdo patrocinado encontrado</h4>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Abra qualquer card de conteúdo no Kanban e selecione a classificação &ldquo;Patrocinado&rdquo; ou vincule a um anúncio na aba &ldquo;Anúncios&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paidPosts.map((post) => {
              const linkedAd = ads.find((a) => a.id === post.meta_ad_id || a.post_id === post.id);
              const linkedCamp = campaigns.find(
                (c) => c.id === post.meta_campaign_id || (linkedAd && c.id === linkedAd.campaign_id)
              );

              return (
                <div
                  key={post.id}
                  className="flex flex-col rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl overflow-hidden transition-all group"
                >
                  {/* Thumbnail / Header Area */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.titulo}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-700">
                        <Sparkles className="h-12 w-12" />
                      </div>
                    )}

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                        {post.tipo.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md ${
                          post.uso_trafego_pago === 'ativo'
                            ? 'bg-emerald-500/80 text-white'
                            : post.uso_trafego_pago === 'em_teste'
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-slate-700/80 text-slate-200'
                        }`}
                      >
                        {post.uso_trafego_pago?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-md">
                      <span className="font-semibold uppercase text-[10px] bg-slate-900/80 px-2 py-0.5 rounded">
                        Funil: {post.etapa_funil}
                      </span>
                      <span className="text-[10px] font-medium bg-slate-900/80 px-2 py-0.5 rounded">
                        Resp: {post.responsavel.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                        {post.titulo}
                      </h3>

                      {post.gancho && (
                        <div className="mt-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 text-xs italic text-slate-300 line-clamp-2">
                          &ldquo;{post.gancho}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Linked Ad Info & Metrics */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <MetaIcon className="h-3.5 w-3.5 text-indigo-400" />
                          {linkedAd ? linkedAd.name : 'Vínculo pendente'}
                        </span>
                        {linkedCamp && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {linkedCamp.name}
                          </span>
                        )}
                      </div>

                      {linkedAd ? (
                        <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 uppercase">Investido</span>
                            <p className="text-xs font-bold text-slate-100 mt-0.5">
                              R$ {linkedAd.spend.toFixed(0)}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 uppercase">Leads</span>
                            <p className="text-xs font-bold text-emerald-400 mt-0.5">
                              {linkedAd.leads}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-400 uppercase">ROAS</span>
                            <p className="text-xs font-bold text-amber-300 mt-0.5">
                              {linkedAd.roas?.toFixed(1)}x
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Aguardando veiculação ativa no Gerenciador Meta.
                        </p>
                      )}
                    </div>

                    {/* Footer Button */}
                    <button
                      onClick={() => openPostModal(post, 'anuncios')}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors"
                    >
                      <span>Gerenciar Vínculo & Anúncio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
