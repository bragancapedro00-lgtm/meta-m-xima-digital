'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContent } from '@/lib/context/ContentContext';
import { Perfil } from '@/types';
import { decodeInviteToken } from '@/lib/inviteToken';
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Layers,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profiles, loginWithEmail, registerInvitedMember } = useContent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successUser, setSuccessUser] = useState<Perfil | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  const [invitePayload, setInvitePayload] = useState<Partial<Perfil> | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill email or decode self-contained invite token from URL
  useEffect(() => {
    const inviteParam = searchParams.get('invite') || searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (inviteParam) {
      const decoded = decodeInviteToken(inviteParam);
      if (decoded && decoded.email) {
        setInvitePayload(decoded);
        setEmail(decoded.email);
        setPassword(decoded.senha || '123456');

        // Garante o registro imediato do colaborador no contexto e servidor deste dispositivo
        registerInvitedMember(decoded).catch(() => {});
      }
    } else if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams, registerInvitedMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor, informe sua senha de acesso.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginWithEmail(email.trim(), password.trim());

      if (!res.success) {
        setErrorMsg(res.error || 'Não foi possível autenticar.');
        setLoading(false);
        return;
      }

      if (res.user) {
        setSuccessUser(res.user);
        setTimeout(() => {
          router.push('/kanban');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg('Erro inesperado ao realizar login.');
      setLoading(false);
    }
  };

  const handleSelectAccount = (member: Perfil) => {
    setEmail(member.email);
    setPassword('');
    setErrorMsg('');
    setSelectedMemberName(member.nome);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="Meta Máxima Logo"
            className="h-16 w-auto object-contain drop-shadow-md"
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          META MÁXIMA
          <span className="text-xs uppercase font-bold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
            SaaS & Ops
          </span>
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Portal operacional de conteúdos e inteligência artificial. Entre para acessar sua esteira de produção.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Success Alert */}
        {successUser ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-center animate-fade-in">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm text-white">Bem-vindo, {successUser.nome}!</p>
            <p className="text-[11px] text-emerald-300">
              Acessando como <strong>{successUser.cargo}</strong> ({successUser.role.toUpperCase()})...
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
              <div className="bg-emerald-400 h-1.5 w-full animate-pulse" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invite Token Welcoming Alert */}
            {invitePayload && (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs space-y-2.5 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 font-bold text-white text-sm">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Convite Identificado: Olá, {invitePayload.nome}!</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Seu acesso à agência foi liberado como <strong className="text-white">{invitePayload.cargo}</strong> ({invitePayload.role?.toUpperCase()}).
                </p>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between">
                  <span>Senha inicial: <strong className="text-white font-mono">{invitePayload.senha || '123456'}</strong></span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                    Acesso Liberado
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                Seu E-mail de Colaborador *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@metamaxima.com.br"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-750 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all min-h-[48px]"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                Senha de Acesso *
              </label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha cadastrada"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-750 pl-4 pr-11 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all min-h-[48px] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {invitePayload
                  ? 'Senha inicial pronta para o seu primeiro acesso. Você poderá alterá-la a qualquer momento.'
                  : 'Senha definida pelo administrador no cadastro do seu perfil.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm py-3.5 px-4 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 min-h-[48px] mt-2"
            >
              {loading ? (
                'Autenticando...'
              ) : (
                <>
                  <span>
                    {invitePayload
                      ? `Entrar como ${invitePayload.nome?.split(' ')[0]}`
                      : 'Acessar Meu Painel'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Account Selector */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              Selecionar Conta de Colaborador
            </span>
            <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              Exige senha
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {profiles.slice(0, 4).map((p) => {
              const isSelected = email.toLowerCase() === p.email.toLowerCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectAccount(p)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all group min-h-[44px] ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <img
                    src={p.avatar_url}
                    alt={p.nome}
                    className={`h-7 w-7 rounded-full object-cover shrink-0 ring-1 ${
                      isSelected ? 'ring-zinc-400' : 'ring-zinc-700'
                    }`}
                  />
                  <div className="truncate">
                    <p className={`text-[11px] font-bold truncate ${
                      isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}>
                      {p.nome.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide truncate">
                      {p.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedMemberName && (
            <p className="text-[11px] text-zinc-300 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-center">
              Conta de <strong>{selectedMemberName}</strong> selecionada. Digite a senha acima para prosseguir.
            </p>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-center text-[11px] text-zinc-500">
        Não tem acesso? Peça ao administrador para incluir seu e-mail em{' '}
        <span className="text-zinc-400 font-semibold">Configurações &gt; Equipe</span>.
      </p>
    </div>
  );
}

export default function LoginView() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 relative">
      {/* Main Content wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="text-zinc-500 text-xs">Carregando portal de acesso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
