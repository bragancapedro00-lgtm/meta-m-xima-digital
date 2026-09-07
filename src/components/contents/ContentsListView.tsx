'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Post } from '@/types';
import {
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Plus,
  Video,
  Layers,
  FileImage,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export default function ContentsListView() {
  const { filteredPosts, openPostModal, openNewPostModal, isOverdue } = useContent();
  const [sortField, setSortField] = useState<'data' | 'titulo' | 'status'>('data');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortField === 'data') {
      return sortAsc
        ? a.data_publicacao.localeCompare(b.data_publicacao)
        : b.data_publicacao.localeCompare(a.data_publicacao);
    }
    if (sortField === 'titulo') {
      return sortAsc ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo);
    }
    return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
  });

  const toggleSort = (field: 'data' | 'titulo' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#090d16]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Base de Produção
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Lista de Conteúdos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualização de alta densidade em formato de tabela com filtros e status operacional.
          </p>
        </div>

        <button
          onClick={() => openNewPostModal('a_gravar')}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Novo Conteúdo</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort('titulo')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Conteúdo
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Funil</th>
                <th
                  onClick={() => toggleSort('status')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('data')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Data / Hora
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sortedPosts.map((post) => {
                const overdue = isOverdue(post);

                return (
                  <tr
                    key={post.id}
                    onClick={() => openPostModal(post, 'detalhes')}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    {/* Título */}
                    <td className="px-4 py-3 max-w-xs truncate">
                      <p className="font-semibold text-slate-100 truncate hover:text-indigo-300">
                        {post.titulo}
                      </p>
                      {post.gancho && (
                        <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
                          {post.gancho}
                        </p>
                      )}
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {post.tipo?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Funil */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="uppercase text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {post.etapa_funil}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {post.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {overdue ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-400 text-xs">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {post.data_publicacao}
                        </span>
                      ) : (
                        <span className="text-slate-300 tabular-nums">
                          {post.data_publicacao} às {post.hora_publicacao}
                        </span>
                      )}
                    </td>

                    {/* Responsável */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-slate-300">{post.responsavel}</span>
                    </td>

                    {/* Prioridade */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          post.prioridade === 'urgente'
                            ? 'text-rose-400 bg-rose-500/15'
                            : post.prioridade === 'alta'
                            ? 'text-amber-400 bg-amber-500/15'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {post.prioridade}
                      </span>
                    </td>

                    {/* Ação */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPostModal(post, 'detalhes');
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
