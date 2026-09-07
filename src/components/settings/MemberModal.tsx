'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Perfil,
  PerfilRole,
  StatusMembro,
  PermissoesEquipe,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/types';
import { processAvatarFile } from '@/lib/imageUtils';
import {
  X,
  User,
  Mail,
  Briefcase,
  Shield,
  Check,
  FileEdit,
  SlidersHorizontal,
  Share2,
  BarChart3,
  Users2,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
} from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<Perfil, 'id' | 'criado_em'>, id?: string) => Promise<void>;
  memberToEdit?: Perfil | null;
}

const ROLES_INFO: { role: PerfilRole; label: string; desc: string }[] = [
  { role: 'admin', label: 'Administrador', desc: 'Acesso total a todas as funções, equipe e integrações' },
  { role: 'gestor', label: 'Gestor de Operações', desc: 'Gerencia conteúdos, aprovações, métricas e conexões' },
  { role: 'social_media', label: 'Social Media / Copy', desc: 'Cria conteúdos, roteiros, agenda e visualiza métricas' },
  { role: 'editor', label: 'Editor Audiovisual', desc: 'Edita roteiros, move cards no pipeline e sobe mídias' },
  { role: 'visualizador', label: 'Visualizador / Cliente', desc: 'Acesso somente leitura a métricas e relatórios' },
  { role: 'personalizado', label: 'Personalizado', desc: 'Permissões customizadas individualmente' },
];

export default function MemberModal({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
}: MemberModalProps) {
  const isEditing = !!memberToEdit;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState<PerfilRole>('social_media');
  const [status, setStatus] = useState<StatusMembro>('ativo');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [permissoes, setPermissoes] = useState<PermissoesEquipe>(DEFAULT_ROLE_PERMISSIONS.social_media);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setErrorMsg('');
    try {
      const optimized = await processAvatarFile(file, 320);
      setAvatarUrl(optimized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar imagem.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (memberToEdit) {
      setNome(memberToEdit.nome || '');
      setEmail(memberToEdit.email || '');
      setSenha(''); // Keep empty by default so editing doesn't overwrite unless typed
      setShowSenha(false);
      setCargo(memberToEdit.cargo || '');
      setRole(memberToEdit.role || 'social_media');
      setStatus(memberToEdit.status || 'ativo');
      setAvatarUrl(memberToEdit.avatar_url || '');
      setPermissoes(memberToEdit.permissoes || DEFAULT_ROLE_PERMISSIONS[memberToEdit.role] || DEFAULT_ROLE_PERMISSIONS.editor);
      setErrorMsg('');
    } else {
      setNome('');
      setEmail('');
      setSenha('');
      setShowSenha(false);
      setCargo('Social Media & Roteirista');
      setRole('social_media');
      setStatus('ativo');
      setAvatarUrl('');
      setPermissoes(DEFAULT_ROLE_PERMISSIONS.social_media);
      setErrorMsg('');
    }
  }, [memberToEdit, isOpen]);

  // Handle role preset change
  const handleRoleChange = (newRole: PerfilRole) => {
    setRole(newRole);
    if (newRole !== 'personalizado') {
      setPermissoes({ ...DEFAULT_ROLE_PERMISSIONS[newRole] });
    }
  };

  // Toggle individual permission
  const handleTogglePermission = (key: keyof PermissoesEquipe) => {
    const updated = {
      ...permissoes,
      [key]: !permissoes[key],
    };
    setPermissoes(updated);
    setRole('personalizado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    if (!isEditing && !senha.trim()) {
      setErrorMsg('Por favor, defina uma senha de acesso para o novo colaborador.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const finalSenha = senha.trim() ? senha.trim() : (memberToEdit?.senha || '123456');

      await onSave(
        {
          nome: nome.trim(),
          email: email.trim(),
          cargo: cargo.trim() || 'Membro da Equipe',
          role,
          status,
          avatar_url: avatarUrl.trim() || undefined,
          permissoes,
          senha: finalSenha,
        },
        memberToEdit?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 md:p-8 my-8 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário de membro"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <h2 id="member-modal-title" className="text-xl font-bold text-white">
              {isEditing ? 'Editar Membro & Permissões' : 'Adicionar Novo Membro da Equipe'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina o perfil de acesso e personalize detalhadamente as atividades autorizadas.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Rafael Medeiros"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: rafael@metamaxima.com.br"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                Cargo / Especialidade
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Editor de Vídeo, Copywriter, Designer"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Senha de Acesso {isEditing ? '(Opcional)' : '*'}
                </span>
                {isEditing && (
                  <span className="text-[10px] text-slate-500 normal-case">
                    Vazia = mantém atual
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  required={!isEditing}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={isEditing ? '•••••••• (manter existente)' : 'Criar senha (ex: 123456)'}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 pl-3.5 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  aria-label={showSenha ? 'Ocultar senha' : 'Ver senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded"
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                Status da Conta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusMembro)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              >
                <option value="ativo">🟢 Ativo (Acesso Imediato)</option>
                <option value="convidado">🟡 Convidado (Pendente aceite)</option>
                <option value="inativo">🔴 Inativo (Acesso Suspenso)</option>
              </select>
            </div>
          </div>

          {/* Foto de Perfil (Upload de Arquivo) */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-indigo-400" />
                Foto de Perfil (Arquivo)
              </label>
              <span className="text-[11px] text-slate-500">JPG, PNG ou WEBP (até 10MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Avatar */}
              <div className="relative group shrink-0">
                <img
                  src={
                    avatarUrl ||
                    (nome.trim()
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nome)}`
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
                  }
                  alt={nome || 'Preview do avatar'}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-500/50 bg-slate-950 shadow-md"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-slate-950/70 flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Action & Buttons */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 min-h-[38px]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{avatarUrl ? 'Substituir Foto por Arquivo' : 'Escolher Arquivo do Computador'}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors min-h-[38px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover Foto</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  {avatarUrl
                    ? 'Foto personalizada carregada com sucesso. O arquivo é ajustado e otimizado automaticamente.'
                    : 'Envie uma foto do colaborador a partir do seu computador. Se nenhuma for enviada, um avatar automático será gerado.'}
                </p>
              </div>
            </div>
          </div>

          {/* Nível de Acesso (Presets de Cargo) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              Função Base (Presets de Permissões)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ROLES_INFO.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleChange(item.role)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    role === item.role
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.label}</span>
                    {role === item.role && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Matriz Granular de Permissões de Atividades */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                Permissões Detalhadas de Atividades
              </span>
              {role === 'personalizado' ? (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Modo Customizado
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">
                  Baseado em: <strong className="text-slate-200 uppercase">{role}</strong>
                </span>
              )}
            </div>

            {/* Grupo 1: Criação & Conteúdo */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileEdit className="h-3.5 w-3.5 text-blue-400" />
                Conteúdo & Ideias
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canCreateContent}
                    onChange={() => handleTogglePermission('canCreateContent')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Criar novos conteúdos e ideias</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canEditContent}
                    onChange={() => handleTogglePermission('canEditContent')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Editar roteiros, ganchos e prazos</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canDeleteContent}
                    onChange={() => handleTogglePermission('canDeleteContent')}
                    className="rounded border-slate-700 text-rose-600 focus:ring-0 h-4 w-4"
                  />
                  <span className="text-rose-300">Excluir posts e ideias</span>
                </label>
              </div>
            </div>

            {/* Grupo 2: Pipeline Kanban & Publicação */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-purple-400" />
                Operação & Kanban
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canMoveKanban}
                    onChange={() => handleTogglePermission('canMoveKanban')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Mover cards no pipeline Kanban</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canApproveContent}
                    onChange={() => handleTogglePermission('canApproveContent')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Aprovar conteúdos para agendamento</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canPublishContent}
                    onChange={() => handleTogglePermission('canPublishContent')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Marcar como postado / publicar</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canManageFiles}
                    onChange={() => handleTogglePermission('canManageFiles')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Upload e gestão na Central de Arquivos</span>
                </label>
              </div>
            </div>

            {/* Grupo 3: Métricas, Conexões e Administração */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                Métricas & Administração
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canViewAnalytics}
                    onChange={() => handleTogglePermission('canViewAnalytics')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Ver métricas do Instagram, GA4 e Google Ads</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={permissoes.canManageIntegrations}
                    onChange={() => handleTogglePermission('canManageIntegrations')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span>Conectar e editar credenciais de APIs</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={permissoes.canManageTeam}
                    onChange={() => handleTogglePermission('canManageTeam')}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                  <span className="font-semibold text-indigo-300">
                    Gerenciar equipe (convidar membros e alterar permissões)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all active:scale-95"
            >
              {saving ? (
                'Salvando...'
              ) : isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Users2 className="h-4 w-4" />
                  Cadastrar Membro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
