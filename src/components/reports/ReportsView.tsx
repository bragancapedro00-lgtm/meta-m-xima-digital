'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
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

  const [filterPeriod, setFilterPeriod] = useState('30d');
  const [filterFunnel, setFilterFunnel] = useState('todos');
  const [filterResponsible, setFilterResponsible] = useState('todos');

  // Filtered posts for report
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterFunnel !== 'todos' && p.etapa_funil !== filterFunnel) return false;
      if (filterResponsible !== 'todos' && p.responsavel !== filterResponsible) return false;
      return true;
    });
  }, [posts, filterFunnel, filterResponsible]);

  // Aggregate stats
  const publishedCount = filtered.filter((p) => p.status === 'postado').length;
  const inProductionCount = filtered.filter((p) =>
    ['a_gravar', 'gravado', 'a_editar', 'editado'].includes(p.status)
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
      { label: 'Topo de Funil (Atração)', count: topo, percentage: Math.round((topo / total) * 100), color: 'bg-indigo-500' },
      { label: 'Meio de Funil (Nutrição)', count: meio, percentage: Math.round((meio / total) * 100), color: 'bg-cyan-500' },
      { label: 'Fundo de Funil (Conversão)', count: fundo, percentage: Math.round((fundo / total) * 100), color: 'bg-violet-500' },
    ];
  }, [filtered]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Título', 'Tipo', 'Funil', 'Status', 'Data Publicação', 'Hora', 'Responsável', 'Prioridade'];
    const rows = filtered.map((p) => [
      `"${p.titulo.replace(/"/g, '""')}"`,
      p.tipo,
      p.etapa_funil,
      p.status,
      p.data_publicacao,
      p.hora_publicacao,
      `"${p.responsavel}"`,
      p.prioridade,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_conteudo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-[#090d16] p-6 lg:p-8 space-y-8 print:bg-white print:text-black">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            Consolidação & Análise
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Relatórios Operacionais</h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas de produção, frequência semanal, distribuição de funil e exportação para clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 print:hidden text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="h-3 w-3" />
          Filtrar Relatório:
        </div>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="rounded-md bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-200"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>

        <select
          value={filterFunnel}
          onChange={(e) => setFilterFunnel(e.target.value)}
          className="rounded-md bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-200"
        >
          <option value="todos">Todos os Funis</option>
          <option value="topo">Topo (Atração)</option>
          <option value="meio">Meio (Nutrição)</option>
          <option value="fundo">Fundo (Conversão)</option>
        </select>

        <select
          value={filterResponsible}
          onChange={(e) => setFilterResponsible(e.target.value)}
          className="rounded-md bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-200"
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
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total de Conteúdos</span>
          <p className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">{filtered.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Considerando filtros ativos</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Publicados no Feed</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{publishedCount}</p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            {Math.round((publishedCount / (filtered.length || 1)) * 100)}% de conclusão
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Em Andamento</span>
          <p className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">{inProductionCount}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Gravação e edição</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Frequência Semanal</span>
          <p className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">4.2 posts</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Consistência sustentável</span>
        </div>
      </div>

      {/* Funnel & Type Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Funnel Breakdown */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">
            Distribuição por Etapa do Funil
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Equilíbrio entre atração de novos seguidores e conversão em vendas
          </p>

          <div className="space-y-4">
            {funnelBreakdown.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{item.label}</span>
                  <span className="font-bold text-slate-200 tabular-nums">
                    {item.count} posts ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-1">
            Distribuição por Formato
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Volume de formatos produzidos na esteira
          </p>

          <div className="space-y-4">
            {typeBreakdown.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 capitalize">{item.type}</span>
                  <span className="font-bold text-slate-200 tabular-nums">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
