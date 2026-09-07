'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { AuditLog } from '@/types';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  FileText,
  Megaphone,
  Paperclip,
  CheckCircle2,
  FolderSync,
} from 'lucide-react';

export default function HistoricoPage() {
  const { auditLogs } = useContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('TODOS');
  const [actionFilter, setActionFilter] = useState<string>('TODAS');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (entityFilter !== 'TODOS' && log.entity_type !== entityFilter) return false;
      if (actionFilter !== 'TODAS' && log.action !== actionFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.entity_title?.toLowerCase().includes(q) || false;
        const matchDetails = log.details?.toLowerCase().includes(q) || false;
        const matchUser = log.user_name.toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchUser) return false;
      }
      return true;
    });
  }, [auditLogs, entityFilter, actionFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Governança & Rastreabilidade
          </span>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2.5">
            <History className="h-5 w-5 text-indigo-400" />
            Histórico & Auditoria Operacional
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trilha de auditoria completa de alterações de status, movimentações no Google Drive e vinculação com Meta Ads.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Logs Imutáveis Registrados:</span>
          <strong className="text-slate-100 font-bold">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Entity filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
            <span className="text-slate-400">Entidade:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900">Todas</option>
              <option value="POST" className="bg-slate-900">Post (Conteúdo)</option>
              <option value="IDEA" className="bg-slate-900">Ideia</option>
              <option value="AD" className="bg-slate-900">Anúncio Meta</option>
              <option value="FILE" className="bg-slate-900">Arquivo / Drive</option>
              <option value="INTEGRATION" className="bg-slate-900">Integração</option>
            </select>
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
            <span className="text-slate-400">Ação:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-slate-900">Todas as Ações</option>
              <option value="MOVE_STATUS" className="bg-slate-900">Mudança de Status & Drive</option>
              <option value="CONVERT_IDEA" className="bg-slate-900">Conversão de Ideia</option>
              <option value="LINK_AD" className="bg-slate-900">Vínculo com Meta Ads</option>
              <option value="UPLOAD_FILE" className="bg-slate-900">Upload de Arquivo</option>
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
            placeholder="Buscar por usuário, título ou detalhe..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-3">Ação</th>
                <th className="py-3 px-3">Entidade</th>
                <th className="py-3 px-4">Alvo</th>
                <th className="py-3 px-6">Detalhes Operacionais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.criado_em || log.created_at || Date.now()).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {log.user_name}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.action === 'MOVE_STATUS'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : log.action === 'CONVERT_IDEA'
                          ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                          : log.action === 'LINK_AD'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs truncate">
                    {log.entity_title || log.entity_id || '-'}
                  </td>
                  <td className="py-3.5 px-6 text-slate-300 max-w-md text-xs leading-relaxed">
                    {log.details || '-'}
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
