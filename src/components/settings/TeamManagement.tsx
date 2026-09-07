'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Perfil, StatusMembro, PerfilRole } from '@/types';
import MemberModal from './MemberModal';
import SwitchProfileModal from '@/components/auth/SwitchProfileModal';
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
  X,
  Copy,
  Sparkles,
} from 'lucide-react';

export default function TeamManagement() {
  const {
    profiles,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    inviteTeamMember,
    currentUser,
    setCurrentUser,
    canPerform,
  } = useContent();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | StatusMembro>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Perfil | null>(null);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [switchTarget, setSwitchTarget] = useState<Perfil | null>(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCargo, setInviteCargo] = useState('Editor de Vídeo');
  const [inviteRole, setInviteRole] = useState<PerfilRole>('editor');
  const [inviteSenha, setInviteSenha] = useState('123456');
  const [generatedInvite, setGeneratedInvite] = useState<{ member: Perfil; inviteUrl: string } | null>(null);
  const [copiedUniversalLink, setCopiedUniversalLink] = useState(false);
  const [copiedInviteText, setCopiedInviteText] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleConfirmSwitch = (target: Perfil) => {
    setCurrentUser(target);
    try {
      localStorage.setItem('mmd_crm_session_v1', JSON.stringify(target));
      localStorage.removeItem('mmd_crm_logged_out_v1');
    } catch {}
  };

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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setGeneratedInvite(null);
              setIsInviteModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 min-h-[44px]"
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            Convidar Participante
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Novo Membro da Equipe
          </button>
        </div>
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
          <label className="text-xs text-slate-400 whitespace-nowrap">Trocar usuário (exige senha):</label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const targetId = e.target.value;
              if (targetId === currentUser.id) return;
              const found = profiles.find((p) => p.id === targetId);
              if (found) {
                setSwitchTarget(found);
                setIsSwitchModalOpen(true);
              }
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

      {/* Switch Profile Modal with Password Protection */}
      <SwitchProfileModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        currentUser={currentUser}
        targetUser={switchTarget}
        onConfirmSwitch={handleConfirmSwitch}
      />

      {/* Universal Invite Modal */}
      {isInviteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 text-slate-100 my-8">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Convidar Participante</h3>
                <p className="text-xs text-slate-400">Convite por link universal ou cadastro direto com credenciais</p>
              </div>
            </div>

            {/* Universal Access Link Section */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-indigo-400" />
                  Link de Acesso Universal
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                  Direto para Login
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Qualquer membro cadastrado pode acessar o sistema através deste link universal:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://metamaximadigital.com/login'}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    navigator.clipboard.writeText(`${origin}/login`);
                    setCopiedUniversalLink(true);
                    setTimeout(() => setCopiedUniversalLink(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
                >
                  {copiedUniversalLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUniversalLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Create Participant & Generate Personalized Invite */}
            {!generatedInvite ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inviteEmail.trim() || !inviteNome.trim()) return;
                  setIsInviting(true);
                  try {
                    const res = await inviteTeamMember({
                      nome: inviteNome.trim(),
                      email: inviteEmail.trim(),
                      cargo: inviteCargo.trim() || 'Colaborador',
                      role: inviteRole,
                      senha: inviteSenha.trim() || '123456',
                    });
                    setGeneratedInvite(res);
                  } finally {
                    setIsInviting(false);
                  }
                }}
                className="space-y-3.5 border-t border-slate-800/80 pt-4"
              >
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Enviar Convite Personalizado
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={inviteNome}
                      onChange={(e) => setInviteNome(e.target.value)}
                      placeholder="Ex: João Vitor"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">E-mail de Acesso *</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="joao@metamaxima.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cargo</label>
                    <input
                      type="text"
                      value={inviteCargo}
                      onChange={(e) => setInviteCargo(e.target.value)}
                      placeholder="Ex: Editor de Vídeo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nível de Permissão</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as PerfilRole)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="gestor">Gestor de Tráfego / Marketing</option>
                      <option value="editor">Editor de Vídeo / Criativos</option>
                      <option value="social_media">Social Media</option>
                      <option value="visualizador">Visualizador (Somente Leitura)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Senha Inicial de Acesso</label>
                  <input
                    type="text"
                    value={inviteSenha}
                    onChange={(e) => setInviteSenha(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    O participante poderá alterar esta senha no seu perfil após o primeiro acesso.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isInviting ? 'Gerando Convite...' : 'Gerar Convite de Acesso'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Convite gerado com sucesso para <strong>{generatedInvite.member.nome}</strong>!</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Mensagem de Convite Pronta:
                  </span>
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/90 p-3 rounded border border-slate-800 leading-relaxed">
{`🚀 Convite para a Plataforma Meta Máxima Digital

Olá ${generatedInvite.member.nome}! Você foi convidado para a nossa plataforma de Gestão de Conteúdo e Performance.

🔗 Link de Acesso: ${generatedInvite.inviteUrl}
✉️ E-mail: ${generatedInvite.member.email}
🔑 Senha Inicial: ${generatedInvite.member.senha || '123456'}
Cargo: ${generatedInvite.member.cargo}

Faça login para iniciar sua colaboração!`}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedInvite(null);
                      setInviteNome('');
                      setInviteEmail('');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    + Convidar outro participante
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🚀 Convite para a Plataforma Meta Máxima Digital\n\nOlá ${generatedInvite.member.nome}! Você foi convidado para a nossa plataforma de Gestão de Conteúdo e Performance.\n\n🔗 Link de Acesso: ${generatedInvite.inviteUrl}\n✉️ E-mail: ${generatedInvite.member.email}\n🔑 Senha Inicial: ${generatedInvite.member.senha || '123456'}\nCargo: ${generatedInvite.member.cargo}\n\nFaça login para iniciar sua colaboração!`;
                        navigator.clipboard.writeText(msg);
                        setCopiedInviteText(true);
                        setTimeout(() => setCopiedInviteText(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                    >
                      {copiedInviteText ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedInviteText ? 'Mensagem Copiada!' : 'Copiar Mensagem'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
