'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useContent } from '@/lib/context/ContentContext';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Video,
  Layers,
  FileImage,
  Sparkles,
  Plus,
  PlayCircle,
  Eye,
} from 'lucide-react';

export default function DashboardView() {
  const { posts, ideas, openPostModal, openNewPostModal, isOverdue } = useContent();

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated metrics
  const stats = useMemo(() => {
    const activePosts = posts.filter((p) => !p.arquivado);
    const thisMonthPosts = activePosts.filter((p) => p.data_publicacao.startsWith(currentMonthStr));
    const publishedPosts = activePosts.filter((p) => p.status === 'postado');
    const overduePosts = activePosts.filter(isOverdue);
    const inProductionPosts = activePosts.filter((p) =>
      ['a_gravar', 'gravado', 'a_editar', 'editado'].includes(p.status)
    );
    const scheduledPosts = activePosts.filter((p) => p.status === 'agendado');
    const pendingIdeas = ideas.filter((i) => !i.arquivado && !i.post_id);

    return {
      thisMonthCount: thisMonthPosts.length,
      publishedCount: publishedPosts.length,
      overdueCount: overduePosts.length,
      inProductionCount: inProductionPosts.length,
      scheduledCount: scheduledPosts.length,
      pendingIdeasCount: pendingIdeas.length,
    };
  }, [posts, ideas, currentMonthStr, isOverdue]);

  // Next upcoming contents
  const upcomingPosts = useMemo(() => {
    return posts
      .filter((p) => !p.arquivado && p.status !== 'postado')
      .sort((a, b) => a.data_publicacao.localeCompare(b.data_publicacao))
      .slice(0, 5);
  }, [posts]);

  // Pipeline stages distribution
  const pipelineDistribution = useMemo(() => {
    const stages = [
      { key: 'ideias', label: 'Ideias', color: 'bg-violet-500' },
      { key: 'a_gravar', label: 'A Gravar', color: 'bg-amber-500' },
      { key: 'gravado', label: 'Gravado', color: 'bg-yellow-400' },
      { key: 'a_editar', label: 'A Editar', color: 'bg-cyan-400' },
      { key: 'editado', label: 'Editado', color: 'bg-blue-500' },
      { key: 'agendado', label: 'Agendado', color: 'bg-indigo-500' },
      { key: 'postado', label: 'Postado', color: 'bg-emerald-500' },
    ];

    const total = posts.length || 1;

    return stages.map((st) => {
      const count = posts.filter((p) => p.status === st.key).length;
      const percentage = Math.round((count / total) * 100);
      return { ...st, count, percentage };
    });
  }, [posts]);

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-[#090d16] p-6 lg:p-8 space-y-8">
      
      {/* Welcome & Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Painel Executivo
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Central de Comando</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visão em tempo real de produção, gargalos operacionais e calendário da agência.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/kanban"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors"
          >
            Abrir Kanban
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => openNewPostModal('a_gravar')}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Conteúdo
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Conteúdos Deste Mês */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Neste Mês</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {stats.thisMonthCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Metas planejadas</span>
        </div>

        {/* Publicados */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Publicados</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 tabular-nums">
            {stats.publishedCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Postados no feed</span>
        </div>

        {/* Atrasados */}
        <div
          className={`rounded-xl border p-4 shadow-sm transition-colors ${
            stats.overdueCount > 0
              ? 'bg-rose-950/30 border-rose-900/60'
              : 'bg-slate-900/90 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-rose-300">Atrasados</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2 tabular-nums">
            {stats.overdueCount}
          </p>
          <span className="text-[11px] text-rose-300/80 mt-1 block">Ação imediata</span>
        </div>

        {/* Em Produção */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Em Produção</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2 tabular-nums">
            {stats.inProductionCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Gravação & Edição</span>
        </div>

        {/* Agendados */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Agendados</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {stats.scheduledCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Prontos para postar</span>
        </div>

        {/* Ideias Pendentes */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Banco de Ideias</span>
            <Lightbulb className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {stats.pendingIdeasCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Para aprovar</span>
        </div>
      </div>

      {/* Main Row: Upcoming Contents & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Próximos Conteúdos */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Próximas Entregas (Cronograma)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Conteúdos ordenados pela data mais próxima de publicação
              </p>
            </div>

            <Link
              href="/calendario"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Ver Calendário
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingPosts.map((post) => {
              const overdue = isOverdue(post);

              return (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post, 'detalhes')}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-950"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0">
                      {post.tipo?.includes('video') ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-200 truncate">
                        {post.titulo}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="capitalize text-slate-300 font-medium">
                          {post.status.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>{post.responsavel}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">
                          {post.etapa_funil}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    {overdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        <AlertTriangle className="h-3 w-3" /> Atrasado ({post.data_publicacao})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-300 tabular-nums block">
                        {post.data_publicacao} às {post.hora_publicacao}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Pipeline Overview */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">
              Pipeline Operacional
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribuição dos conteúdos pelas 7 etapas de produção
            </p>

            <div className="space-y-4">
              {pipelineDistribution.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-200 tabular-nums">
                      {item.count}{' '}
                      <span className="text-slate-500 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6">
            <Link
              href="/kanban"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 py-2.5 text-xs font-semibold text-indigo-300 transition-colors"
            >
              Operar Pipeline no Kanban
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Summary: Desempenho & Analytics Overview */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Desempenho Geral Consolidado
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Integração com Meta Graph API & Google Analytics 4
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/instagram"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
            >
              Ver Instagram
            </Link>
            <Link
              href="/analytics"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20"
            >
              Ver Analytics
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Seguidores no Instagram</span>
            <p className="text-xl font-bold text-slate-100 mt-1 tabular-nums">24.850</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+14.2% em 30 dias</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Alcance Total (30d)</span>
            <p className="text-xl font-bold text-slate-100 mt-1 tabular-nums">142.300</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Orgânico + Pago</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Taxa de Engajamento</span>
            <p className="text-xl font-bold text-indigo-400 mt-1 tabular-nums">4.8%</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Acima da média do nicho</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Sessões Google Analytics</span>
            <p className="text-xl font-bold text-cyan-400 mt-1 tabular-nums">18.420</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+22% de tráfego social</span>
          </div>
        </div>
      </div>

    </div>
  );
}
