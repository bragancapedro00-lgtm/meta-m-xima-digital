'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { ContaTipo } from '@/types';
import AccountBadge from '@/components/common/AccountBadge';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function ReportsView() {
  const { posts, profiles } = useContent();

  const [filterAccount, setFilterAccount] = useState<'todos' | ContaTipo>('todos');
  const [filterPeriod, setFilterPeriod] = useState('30d');
  const [filterFunnel, setFilterFunnel] = useState('todos');
  const [filterResponsible, setFilterResponsible] = useState('todos');

  // Filtered posts for report
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterAccount !== 'todos') {
        const isCursos = p.conta === 'meta_maxima_cursos' || p.tags?.some(t => t.toLowerCase().includes('curso'));
        if (filterAccount === 'meta_maxima_cursos' && !isCursos) return false;
        if (filterAccount === 'meta_maxima_digital' && isCursos) return false;
      }
      if (filterFunnel !== 'todos' && p.etapa_funil !== filterFunnel) return false;
      if (filterResponsible !== 'todos' && p.responsavel !== filterResponsible) return false;
      return true;
    });
  }, [posts, filterAccount, filterFunnel, filterResponsible]);

  // Aggregate stats
  const publishedCount = filtered.filter((p) => p.status === 'postado').length;
  const inProductionCount = filtered.filter((p) =>
    ['a_gravar', 'gravado', 'a_editar', 'editado'].includes(p.status)
  ).length;

  // Account Breakdown counts
  const digitalCount = posts.filter(
    (p) => p.conta === 'meta_maxima_digital' || (!p.conta && !p.tags?.some(t => t.toLowerCase().includes('curso')))
  ).length;
  const cursosCount = posts.filter(
    (p) => p.conta === 'meta_maxima_cursos' || p.tags?.some(t => t.toLowerCase().includes('curso'))
  ).length;

  // Breakdown by Type
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((p) => {
      const t = p.tipo?.replace('_', ' ') || 'Outro';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / (filtered.length || 1)) * 100),
    }));
  }, [filtered]);

  // Breakdown by Funnel
  const funnelBreakdown = useMemo(() => {
    const topo = filtered.filter((p) => p.etapa_funil === 'topo').length;
    const meio = filtered.filter((p) => p.etapa_funil === 'meio').length;
    const fundo = filtered.filter((p) => p.etapa_funil === 'fundo').length;
    const total = filtered.length || 1;

    return [
      { label: 'Topo de Funil (Atração)', count: topo, percentage: Math.round((topo / total) * 100), color: 'bg-blue-500' },
      { label: 'Meio de Funil (Nutrição)', count: meio, percentage: Math.round((meio / total) * 100), color: 'bg-emerald-500' },
      { label: 'Fundo de Funil (Conversão)', count: fundo, percentage: Math.round((fundo / total) * 100), color: 'bg-zinc-300' },
    ];
  }, [filtered]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Título', 'Conta', 'Tipo', 'Funil', 'Status', 'Data Publicação', 'Hora', 'Responsável', 'Prioridade'];
    const rows = filtered.map((p) => {
      const contaNome = (p.conta === 'meta_maxima_cursos' || p.tags?.some(t => t.toLowerCase().includes('curso')))
        ? 'Meta Máxima Cursos'
        : 'Meta Máxima Digital';

      return [
        `"${p.titulo.replace(/"/g, '""')}"`,
        `"${contaNome}"`,
        p.tipo,
        p.etapa_funil,
        p.status,
        p.data_publicacao,
        p.hora_publicacao,
        `"${p.responsavel}"`,
        p.prioridade,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_conteudos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8 space-y-6 print:bg-white print:text-black">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-zinc-300" />
            Consolidação & Análise de Conteúdo
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Relatórios de Conteúdos</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Métricas de produção de conteúdo, distribuição por conta, funil e exportação executiva.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-3.5 py-2 text-xs font-bold text-zinc-950 shadow transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Account Overview Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Máxima Digital (Azul) */}
        <div
          onClick={() => setFilterAccount(filterAccount === 'meta_maxima_digital' ? 'todos' : 'meta_maxima_digital')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterAccount === 'meta_maxima_digital'
              ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <AccountBadge conta="meta_maxima_digital" size="md" />
            <span className="text-xs text-zinc-400 font-mono">Agência & Tráfego</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">{digitalCount}</span>
            <span className="text-xs text-zinc-400">conteúdos cadastrados</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Foco em alta conversão B2B, posicionamento de autoridade e tráfego pago.
          </p>
        </div>

        {/* Meta Máxima Cursos (Verde) */}
        <div
          onClick={() => setFilterAccount(filterAccount === 'meta_maxima_cursos' ? 'todos' : 'meta_maxima_cursos')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterAccount === 'meta_maxima_cursos'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <AccountBadge conta="meta_maxima_cursos" size="md" />
            <span className="text-xs text-zinc-400 font-mono">Cursos Profissionalizantes</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{cursosCount}</span>
            <span className="text-xs text-zinc-400">conteúdos cadastrados</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Foco em capacitação profissional, aceleração de carreira e matrículas.
          </p>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 print:hidden text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="h-3 w-3" />
          Filtrar:
        </div>

        {/* Quick Account Switcher in filter bar */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setFilterAccount('todos')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterAccount === 'todos'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas as Contas
          </button>
          <button
            onClick={() => setFilterAccount('meta_maxima_digital')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              filterAccount === 'meta_maxima_digital'
                ? 'bg-blue-950 text-blue-400 border border-blue-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Digital
          </button>
          <button
            onClick={() => setFilterAccount('meta_maxima_cursos')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              filterAccount === 'meta_maxima_cursos'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Cursos
          </button>
        </div>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-zinc-200"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>

        <select
          value={filterFunnel}
          onChange={(e) => setFilterFunnel(e.target.value)}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-zinc-200"
        >
          <option value="todos">Todos os Funis</option>
          <option value="topo">Topo (Atração)</option>
          <option value="meio">Meio (Nutrição)</option>
          <option value="fundo">Fundo (Conversão)</option>
        </select>

        <select
          value={filterResponsible}
          onChange={(e) => setFilterResponsible(e.target.value)}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-zinc-200"
        >
          <option value="todos">Todos os Responsáveis</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.nome}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Total Filtrado</span>
          <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">{filtered.length}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Considerando filtros ativos</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Publicados no Feed</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{publishedCount}</p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            {Math.round((publishedCount / (filtered.length || 1)) * 100)}% de conclusão
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Em Produção</span>
          <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">{inProductionCount}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Gravação e edição</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Frequência Semanal</span>
          <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">4.2 posts</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Consistência sustentável</span>
        </div>
      </div>

      {/* Funnel & Type Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Funnel Breakdown */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-1">
            Distribuição por Etapa do Funil
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Equilíbrio entre atração de novos seguidores e conversão em vendas
          </p>

          <div className="space-y-4">
            {funnelBreakdown.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{item.label}</span>
                  <span className="font-bold text-zinc-200 tabular-nums">
                    {item.count} posts ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-1">
            Distribuição por Formato
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Volume de formatos produzidos na esteira
          </p>

          <div className="space-y-4">
            {typeBreakdown.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 capitalize">{item.type}</span>
                  <span className="font-bold text-zinc-200 tabular-nums">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-zinc-200 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
