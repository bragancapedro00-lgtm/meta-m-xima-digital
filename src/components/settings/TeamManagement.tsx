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
  Radio,
  Wifi,
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
  const [inviteError, setInviteError] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<{ member: Perfil; inviteUrl: string; inviteToken?: string } | null>(null);
  const [copiedUniversalLink, setCopiedUniversalLink] = useState(false);
  const [copiedInviteText, setCopiedInviteText] = useState(false);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    currentOrigin: string;
    networkOrigin: string;
    isLocalhost: boolean;
    primaryIp: string;
    adapterName?: string;
  } | null>(null);
  const [urlMode, setUrlMode] = useState<'network' | 'localhost' | 'custom'>('network');
  const [customDomain, setCustomDomain] = useState('');

  // Previne vazamentos de memória (memory leaks) registrando e limpando todos os timers ao desmontar
  const timeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
  const registerTimeout = React.useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  React.useEffect(() => {
    fetch('/api/team/network-info')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNetworkInfo(d);
      })
      .catch(() => {});
  }, []);

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
    registerTimeout(() => {
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
    <div className="space-y-6 text-zinc-100">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            Membros da Agência & Permissões ({profiles.length})
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Adicione colaboradores, defina seus cargos e controle com precisão o que cada um pode fazer no CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setGeneratedInvite(null);
              setInviteError('');
              setIsInviteModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 min-h-[44px]"
          >
            <Share2 className="h-4 w-4 text-zinc-300" />
            Convidar Participante
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Novo Membro da Equipe
          </button>
        </div>
      </div>

      {/* Simulator: Current Active User Switcher */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-300">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Simulador de Sessão Operacional</h4>
            <p className="text-[11px] text-zinc-400">
              Você está operando atualmente como: <strong className="text-white">{currentUser.nome}</strong> ({currentUser.cargo} - <span className="uppercase">{currentUser.role}</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 whitespace-nowrap">Trocar usuário (exige senha):</label>
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
            className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 min-h-[38px]"
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 min-h-[44px]"
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
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
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
              className={`flex flex-col justify-between p-5 rounded-2xl bg-zinc-900 border transition-all ${
                isMe
                  ? 'border-blue-500/50 ring-1 ring-blue-500/20 shadow-lg'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.avatar_url}
                      alt={member.nome}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-zinc-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-100">{member.nome}</h4>
                        {isMe && (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded border border-blue-500/20">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                          {member.cargo}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                          <Lock className="h-3 w-3 text-emerald-400" />
                          Senha ativa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(member.status)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Permissions Summary Indicator */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                    Permissões Habilitadas:
                  </span>
                  <span className="font-bold text-zinc-200">
                    <strong className="text-white">{activePermsCount}</strong> de 10 atividades
                  </span>
                </div>

                {/* Progress Bar of Permissions */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(activePermsCount / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                    Editar Permissões
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyAccessLink(member.email, member.id)}
                    title="Copiar link de acesso para enviar ao colaborador"
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all min-h-[44px] ${
                      copiedMap[member.id]
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {copiedMap[member.id] ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Link Copiado!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 text-zinc-400" />
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
                    className="p-2.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100 my-8">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Convidar Colaborador</h3>
                <p className="text-xs text-zinc-400">Convite por link direto ou cadastro automático com credenciais</p>
              </div>
            </div>

            {/* Universal Access Link Section */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
                  Link de Acesso Universal
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                  Direto para Login
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Qualquer membro cadastrado pode acessar o sistema através deste link universal:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/login` : 'http://localhost:3000/login'}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    navigator.clipboard.writeText(`${origin}/login`);
                    setCopiedUniversalLink(true);
                    registerTimeout(() => setCopiedUniversalLink(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold shrink-0 border border-zinc-700"
                >
                  {copiedUniversalLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUniversalLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {inviteError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{inviteError}</span>
              </div>
            )}

            {/* Create Participant & Generate Personalized Invite */}
            {!generatedInvite ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inviteEmail.trim() || !inviteNome.trim()) {
                    setInviteError('Por favor, preencha o nome e o e-mail do colaborador.');
                    return;
                  }
                  if (!inviteEmail.includes('@') || !inviteEmail.includes('.')) {
                    setInviteError('Por favor, informe um endereço de e-mail válido.');
                    return;
                  }

                  setIsInviting(true);
                  setInviteError('');
                  try {
                    let effectiveBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    if (urlMode === 'network' && networkInfo?.networkOrigin) {
                      effectiveBaseUrl = networkInfo.networkOrigin;
                    } else if (urlMode === 'localhost') {
                      effectiveBaseUrl = 'http://localhost:3000';
                    } else if (urlMode === 'custom' && customDomain.trim()) {
                      effectiveBaseUrl = customDomain.trim().replace(/\/+$/, '');
                    }

                    const res = await inviteTeamMember({
                      nome: inviteNome.trim(),
                      email: inviteEmail.trim(),
                      cargo: inviteCargo.trim() || 'Colaborador',
                      role: inviteRole,
                      senha: inviteSenha.trim() || '123456',
                      customBaseUrl: effectiveBaseUrl,
                    });
                    setGeneratedInvite(res);
                  } catch (err: any) {
                    setInviteError(err?.message || 'Erro inesperado ao gerar convite do colaborador.');
                  } finally {
                    setIsInviting(false);
                  }
                }}
                className="space-y-3.5 border-t border-zinc-800 pt-4"
              >
                <div className="space-y-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-blue-400" />
                      Dispositivo de Destino do Convite
                    </span>
                    {networkInfo && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Rede: {networkInfo.primaryIp} ({networkInfo.adapterName})
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => setUrlMode('network')}
                      className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                        urlMode === 'network'
                          ? 'bg-blue-500/10 border-blue-500/40 text-white ring-1 ring-blue-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-xs flex items-center gap-1">
                        📱 Outro Aparelho (Wi-Fi / Celular)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                        {networkInfo?.networkOrigin || 'http://192.168.0.117:3000'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUrlMode('localhost')}
                      className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                        urlMode === 'localhost'
                          ? 'bg-blue-500/10 border-blue-500/40 text-white ring-1 ring-blue-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-xs flex items-center gap-1">
                        💻 Neste Computador (Local)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        http://localhost:3000
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={inviteNome}
                      onChange={(e) => setInviteNome(e.target.value)}
                      placeholder="Ex: João Vitor"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">E-mail de Acesso *</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="joao@metamaxima.com"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Cargo</label>
                    <input
                      type="text"
                      value={inviteCargo}
                      onChange={(e) => setInviteCargo(e.target.value)}
                      placeholder="Ex: Editor de Vídeo"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nível de Permissão</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as PerfilRole)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
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
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Senha Inicial de Acesso</label>
                  <input
                    type="text"
                    value={inviteSenha}
                    onChange={(e) => setInviteSenha(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    O colaborador poderá alterar esta senha no seu perfil após o primeiro acesso.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 text-xs font-bold px-5 py-2.5 rounded-lg shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isInviting ? 'Gerando Convite...' : 'Gerar Convite de Acesso'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Convite gerado com sucesso para <strong>{generatedInvite.member.nome}</strong>!</span>
                </div>

                {/* Direct Link Copier */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
                      Link de Convite Universal (Acesso em qualquer aparelho)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      Multi-dispositivo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInvite.inviteUrl}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInvite.inviteUrl);
                        setCopiedInviteUrl(true);
                        registerTimeout(() => setCopiedInviteUrl(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold shrink-0 border border-zinc-700"
                    >
                      {copiedInviteUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedInviteUrl ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Mensagem Completa Pronta para Envio:
                  </span>
                  <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap bg-zinc-900 p-3 rounded border border-zinc-800 leading-relaxed">
{`🚀 Convite para a Plataforma Meta Máxima

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
                      setInviteError('');
                      setInviteNome('');
                      setInviteEmail('');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Convidar outro participante
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🚀 Convite para a Plataforma Meta Máxima\n\nOlá ${generatedInvite.member.nome}! Você foi convidado para a nossa plataforma de Gestão de Conteúdo e Performance.\n\n🔗 Link de Acesso: ${generatedInvite.inviteUrl}\n✉️ E-mail: ${generatedInvite.member.email}\n🔑 Senha Inicial: ${generatedInvite.member.senha || '123456'}\nCargo: ${generatedInvite.member.cargo}\n\nFaça login para iniciar sua colaboração!`;
                        navigator.clipboard.writeText(msg);
                        setCopiedInviteText(true);
                        registerTimeout(() => setCopiedInviteText(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold shadow"
                    >
                      {copiedInviteText ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
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
