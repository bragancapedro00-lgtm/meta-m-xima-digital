'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import TeamManagement from './TeamManagement';
import IntegrationsManagement from './IntegrationsManagement';
import {
  Settings,
  Users,
  ShieldCheck,
  Database,
  Key,
  Check,
  Server,
  FileCode,
} from 'lucide-react';

export default function SettingsView() {
  const { isSupabaseLive } = useContent();

  const [activeTab, setActiveTab] = useState<'equipe' | 'integracoes' | 'sistema'>('equipe');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSaveEnv = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-[#090d16] p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-indigo-400" />
          Administração da Agência
        </span>
        <h1 className="text-2xl font-bold text-white mt-0.5">Configurações do Sistema</h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie membros da equipe, permissões pontuais de atividades, conexões de APIs e banco de dados.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('equipe')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'equipe'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipe & Permissões
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integracoes')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'integracoes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="h-4 w-4" />
          Conexões de APIs (Meta, GA4, Ads)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sistema')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'sistema'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          Banco de Dados & Supabase
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EQUIPE & PERMISSÕES */}
      {/* ========================================================================= */}
      {activeTab === 'equipe' && <TeamManagement />}

      {/* ========================================================================= */}
      {/* TAB 2: INTEGRAÇÕES & APIS */}
      {/* ========================================================================= */}
      {activeTab === 'integracoes' && <IntegrationsManagement />}

      {/* ========================================================================= */}
      {/* TAB 3: BANCO DE DADOS & SUPABASE */}
      {/* ========================================================================= */}
      {activeTab === 'sistema' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Status da Instância do Banco</h4>
                <p className="text-xs text-slate-400">PostgreSQL com Row Level Security, Triggers e Storage</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isSupabaseLive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-blue-400'
                }`}
              />
              <span className="text-slate-300 font-medium">
                {isSupabaseLive
                  ? 'Conectado à instância remota do Supabase'
                  : 'Modo Local / Demonstração Ativo (persistência local e cache reativo funcionando 100%)'}
              </span>
            </div>

            <form onSubmit={handleSaveEnv} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                  Script de banco disponível em: <code className="text-slate-300">supabase/schema.sql</code>
                </p>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-all active:scale-95 min-h-[44px]"
                >
                  {savedSettings ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      Salvo!
                    </>
                  ) : (
                    'Salvar Parâmetros'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
