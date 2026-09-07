'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Perfil, StatusMembro } from '@/types';
import MemberModal from './MemberModal';
import {
  Users,
  Plus,
  Shield,
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  UserCheck,
  Key,
  Share2,
  Check,
  Link as LinkIcon,
  Lock,
} from 'lucide-react';

export default function TeamManagement() {
  const {
    profiles,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    currentUser,
    setCurrentUser,
    canPerform,
  } = useContent();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | StatusMembro>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Perfil | null>(null);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const handleCopyAccessLink = (email: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/login?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 3000);
  };

  // Check if current user has team management permission
  const hasManageTeamPermission = canPerform ? canPerform('canManageTeam') : true;

  // Filter members
  const filteredMembers = profiles.filter((m) => {
    if (filterStatus !== 'todos' && m.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.nome.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchCargo = m.cargo.toLowerCase().includes(q);
      return matchName || matchEmail || matchCargo;
    }
    return true;
  });

  const handleOpenNew = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Perfil) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (
    memberData: Omit<Perfil, 'id' | 'criado_em'>,
    id?: string
  ) => {
    if (id) {
      await updateTeamMember(id, memberData);
    } else {
      await addTeamMember(memberData);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja remover ${nome} da equipe?`)) {
      await deleteTeamMember(id);
    }
  };

  const countActivePermissions = (member: Perfil): number => {
    if (!member.permissoes) return 0;
    return Object.values(member.permissoes).filter(Boolean).length;
  };

  const getStatusBadge = (status?: StatusMembro) => {
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </span>
        );
      case 'convidado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" />
            Convidado
          </span>
        );
      case 'inativo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" />
            Inativo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            Membros da Agência & Permissões ({profiles.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione colaboradores, defina seus cargos e controle com precisão o que cada um pode fazer no CRM.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Novo Membro da Equipe
        </button>
      </div>

      {/* Simulator: Current Active User Switcher */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Simulador de Sessão Operacional</h4>
            <p className="text-[11px] text-slate-400">
              Você está operando atualmente como: <strong className="text-indigo-300">{currentUser.nome}</strong> ({currentUser.cargo} - <span className="uppercase">{currentUser.role}</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Trocar usuário:</label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const found = profiles.find((p) => p.id === e.target.value);
              if (found) setCurrentUser(found);
            }}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[38px]"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="w-full rounded-lg bg-slate-900/80 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['todos', 'ativo', 'convidado', 'inativo'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors min-h-[44px] flex items-center ${
                filterStatus === st
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todos os Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member) => {
          const activePermsCount = countActivePermissions(member);
          const isMe = currentUser.id === member.id;

          return (
            <div
              key={member.id}
              className={`flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border transition-all ${
                isMe
                  ? 'border-indigo-500/60 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.avatar_url}
                      alt={member.nome}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{member.nome}</h4>
                        {isMe && (
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {member.cargo}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-950/80 border border-slate-800 px-1.5 py-0.5 rounded">
                          <Lock className="h-3 w-3 text-emerald-400" />
                          Senha ativa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(member.status)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Permissions Summary Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    Permissões Habilitadas:
                  </span>
                  <span className="font-bold text-slate-200">
                    <strong className="text-indigo-400">{activePermsCount}</strong> de 10 atividades
                  </span>
                </div>

                {/* Progress Bar of Permissions */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(activePermsCount / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                    Editar Permissões
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyAccessLink(member.email, member.id)}
                    title="Copiar link de acesso para enviar ao colaborador"
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all min-h-[44px] ${
                      copiedMap[member.id]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-indigo-300 hover:text-white bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/25'
                    }`}
                  >
                    {copiedMap[member.id] ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                        Copiar Link de Acesso
                      </>
                    )}
                  </button>
                </div>

                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id, member.nome)}
                    aria-label={`Remover ${member.nome}`}
                    className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={selectedMember}
      />
    </div>
  );
}
