'use client';

import React, { useState, useEffect } from 'react';
import { Perfil } from '@/types';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ArrowRight,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

interface SwitchProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Perfil;
  targetUser: Perfil | null;
  onConfirmSwitch: (targetUser: Perfil) => void;
}

export default function SwitchProfileModal({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  onConfirmSwitch,
}: SwitchProfileModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Por favor, digite a senha da conta para confirmar a troca.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const expectedPassword = targetUser.senha || '123456';

    setTimeout(() => {
      if (password.trim() === expectedPassword) {
        onConfirmSwitch(targetUser);
        onClose();
      } else {
        setErrorMsg(
          `Senha incorreta para a conta de ${targetUser.nome.split(' ')[0]}. Verifique os dados digitados.`
        );
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 text-center pr-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Confirmação de Senha Obrigatória</h3>
          <p className="text-xs text-slate-400">
            Para alternar de usuário, informe a senha de acesso da conta de destino por segurança.
          </p>
        </div>

        {/* Account Switch Visualizer */}
        <div className="grid grid-cols-5 items-center gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {/* Current User */}
          <div className="col-span-2 flex flex-col items-center text-center">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.nome}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700 mb-1.5"
            />
            <span className="text-[10px] text-slate-400 font-medium">Você atual</span>
            <p className="text-xs font-semibold text-slate-300 truncate w-full">{currentUser.nome.split(' ')[0]}</p>
          </div>

          {/* Arrow */}
          <div className="col-span-1 flex flex-col items-center justify-center text-indigo-400">
            <ArrowRight className="h-5 w-5 animate-pulse" />
          </div>

          {/* Target User */}
          <div className="col-span-2 flex flex-col items-center text-center">
            <img
              src={targetUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={targetUser.nome}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500 mb-1.5"
            />
            <span className="text-[10px] text-indigo-400 font-semibold">Conta Destino</span>
            <p className="text-xs font-bold text-white truncate w-full">{targetUser.nome.split(' ')[0]}</p>
          </div>
        </div>

        {/* Target Details Badge */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{targetUser.nome}</p>
            <p className="text-[11px] text-indigo-300">{targetUser.cargo} • <span className="uppercase">{targetUser.role}</span></p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{targetUser.email}</span>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Senha de {targetUser.nome.split(' ')[0]} *</span>
              <span className="text-[10px] text-slate-500 normal-case">Padrão da agência se não alterada: 123456</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha deste colaborador"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                'Validando...'
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Confirmar e Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
