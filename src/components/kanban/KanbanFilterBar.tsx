'use client';

import React from 'react';
import { useContent } from '@/lib/context/ContentContext';
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';

export default function KanbanFilterBar() {
  const {
    filters,
    setFilters,
    resetFilters,
    profiles,
    openNewPostModal,
    openNewIdeaModal,
    posts,
    isOverdue,
  } = useContent();

  const overdueCount = posts.filter(isOverdue).length;

  const isFilterActive =
    Boolean(filters.search) ||
    filters.periodo !== 'todos' ||
    filters.tipo !== 'todos' ||
    filters.funil !== 'todos' ||
    filters.responsavel !== 'todos' ||
    filters.prioridade !== 'todos' ||
    filters.plataforma !== 'todos';

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
      
      {/* Top Row: Search & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Buscar conteúdos por título, gancho, tag..."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Overdue Quick Filter Button */}
          {overdueCount > 0 && (
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  periodo: prev.periodo === 'atrasados' ? 'todos' : 'atrasados',
                }))
              }
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                filters.periodo === 'atrasados'
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{overdueCount} Atrasados</span>
            </button>
          )}

          <button
            onClick={openNewIdeaModal}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-all active:scale-95"
          >
            <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
            <span>+ Nova Ideia</span>
          </button>

          <button
            onClick={() => openNewPostModal('a_gravar')}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Novo Conteúdo</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
          <Filter className="h-3 w-3" />
          Filtros:
        </div>

        {/* Período */}
        <select
          value={filters.periodo}
          onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
          className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="todos">Período: Todos</option>
          <option value="7dias">Próximos 7 dias</option>
          <option value="mes_atual">Mês Atual</option>
          <option value="atrasados">Somente Atrasados</option>
        </select>

        {/* Tipo */}
        <select
          value={filters.tipo}
          onChange={(e) => setFilters((prev) => ({ ...prev, tipo: e.target.value }))}
          className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="todos">Tipo: Todos</option>
          <option value="reels_video">Reels / Vídeo</option>
          <option value="carrossel">Carrossel</option>
          <option value="post_estatico">Post Estático</option>
          <option value="stories">Stories</option>
          <option value="resultado">Resultado / Case</option>
          <option value="anuncio">Anúncio</option>
        </select>

        {/* Funil */}
        <select
          value={filters.funil}
          onChange={(e) => setFilters((prev) => ({ ...prev, funil: e.target.value }))}
          className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 uppercase"
        >
          <option value="todos">Funil: Todos</option>
          <option value="topo">Topo</option>
          <option value="meio">Meio</option>
          <option value="fundo">Fundo</option>
        </select>

        {/* Responsável */}
        <select
          value={filters.responsavel}
          onChange={(e) => setFilters((prev) => ({ ...prev, responsavel: e.target.value }))}
          className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="todos">Responsável: Todos</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.nome}>
              {p.nome}
            </option>
          ))}
        </select>

        {/* Prioridade */}
        <select
          value={filters.prioridade}
          onChange={(e) => setFilters((prev) => ({ ...prev, prioridade: e.target.value }))}
          className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 uppercase"
        >
          <option value="todos">Prioridade: Todas</option>
          <option value="baixa">Baixa</option>
          <option value="normal">Normal</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        {/* Limpar filtros */}
        {isFilterActive && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-md bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
