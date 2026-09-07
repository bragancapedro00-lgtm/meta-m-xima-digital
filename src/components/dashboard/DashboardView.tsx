'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useContent } from '@/lib/context/ContentContext';
import { AccountBadge } from '@/components/common/AccountBadge';
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
  Sparkles,
  Plus,
  BarChart3,
} from 'lucide-react';

export default function DashboardView() {
  const { posts, ideas, openPostModal, openNewPostModal, isOverdue } = useContent();

  const currentMonthStr = new Date().toISOString().substring(0, 7);

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
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8 space-y-8 text-zinc-100">
      
      {/* Welcome & Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Painel Executivo
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Central de Comando</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visão em tempo real de produção, contas e cronograma da Meta Máxima.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/kanban"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Abrir Kanban
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => openNewPostModal('a_gravar')}
            className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Conteúdo
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Conteúdos Deste Mês */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Neste Mês</span>
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-100 mt-2 tabular-nums">
            {stats.thisMonthCount}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Metas planejadas</span>
        </div>

        {/* Publicados */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Publicados</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 tabular-nums">
            {stats.publishedCount}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Postados no feed</span>
        </div>

        {/* Atrasados */}
        <div
          className={`rounded-xl border p-4 shadow-sm transition-colors ${
            stats.overdueCount > 0
              ? 'bg-rose-950/30 border-rose-900/60'
              : 'bg-zinc-900 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium text-rose-300">Atrasados</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2 tabular-nums">
            {stats.overdueCount}
          </p>
          <span className="text-[11px] text-rose-300/80 mt-1 block">Ação imediata</span>
        </div>

        {/* Em Produção */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Em Produção</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2 tabular-nums">
            {stats.inProductionCount}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Gravação & Edição</span>
        </div>

        {/* Agendados */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Agendados</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-100 mt-2 tabular-nums">
            {stats.scheduledCount}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Prontos para postar</span>
        </div>

        {/* Ideias Pendentes */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Banco de Ideias</span>
            <Lightbulb className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-100 mt-2 tabular-nums">
            {stats.pendingIdeasCount}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Para aprovar</span>
        </div>
      </div>

      {/* Main Row: Upcoming Contents & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Próximos Conteúdos */}
        <div className="lg:col-span-2 rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Próximas Entregas (Cronograma)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Conteúdos ordenados pela data mais próxima de publicação
              </p>
            </div>

            <Link
              href="/calendario"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver Calendário
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Nenhum conteúdo pendente agendado.</p>
            ) : (
              upcomingPosts.map((post) => {
                const overdue = isOverdue(post);

                return (
                  <div
                    key={post.id}
                    onClick={() => openPostModal(post, 'detalhes')}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all hover:bg-zinc-950"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-md bg-zinc-800 text-zinc-300 shrink-0">
                        {post.tipo?.includes('video') ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Layers className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-200 truncate">
                            {post.titulo}
                          </h4>
                          <AccountBadge conta={post.conta} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span className="capitalize text-zinc-300 font-medium">
                            {post.status.replace('_', ' ')}
                          </span>
                          <span>•</span>
                          <span>{post.responsavel}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                            {post.etapa_funil}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      {overdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <AlertTriangle className="h-3 w-3" /> Atrasado ({post.data_publicacao})
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-300 tabular-nums block">
                          {post.data_publicacao} às {post.hora_publicacao}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Pipeline Overview */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-1">
              Pipeline Operacional
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Distribuição dos conteúdos pelas 7 etapas de produção
            </p>

            <div className="space-y-4">
              {pipelineDistribution.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">{item.label}</span>
                    <span className="font-bold text-zinc-200 tabular-nums">
                      {item.count}{' '}
                      <span className="text-zinc-500 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 mt-6">
            <Link
              href="/kanban"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Operar Pipeline no Kanban
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Summary: Desempenho dos Conteúdos */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Desempenho dos Conteúdos
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Métricas consolidadas de produção, engajamento e alcance orgânico
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/relatorios"
              className="text-xs text-zinc-200 hover:text-white font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              Ver Relatório Completo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-zinc-950/70 border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Total de Conteúdos</span>
            <p className="text-xl font-bold text-zinc-100 mt-1 tabular-nums">{posts.length}</p>
            <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">Cadastrados no sistema</span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-950/70 border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Taxa de Conclusão</span>
            <p className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
              {posts.length > 0 ? Math.round((posts.filter(p => p.status === 'postado').length / posts.length) * 100) : 0}%
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Conteúdos finalizados</span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-950/70 border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Contas Ativas</span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" title="Digital" />
              <span className="text-xs text-zinc-300 font-medium">Digital: {posts.filter(p => p.conta !== 'meta_maxima_cursos').length}</span>
              <span className="text-zinc-600">|</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Cursos" />
              <span className="text-xs text-zinc-300 font-medium">Cursos: {posts.filter(p => p.conta === 'meta_maxima_cursos').length}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">Distribuição por marca</span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-950/70 border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Ideias em Banco</span>
            <p className="text-xl font-bold text-blue-400 mt-1 tabular-nums">{ideas.length}</p>
            <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">Alimentadas pela IA e equipe</span>
          </div>
        </div>
      </div>

    </div>
  );
}
