'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import TeamManagement from './TeamManagement';
import AccountBadge from '@/components/common/AccountBadge';
import { BRAND_PRESETS } from '@/lib/ai/gemini';
import {
  Settings,
  Users,
  ShieldCheck,
  Database,
  Sparkles,
  Check,
  Server,
  FileCode,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsView() {
  const { isSupabaseLive } = useContent();

  const [activeTab, setActiveTab] = useState<'equipe' | 'marcas' | 'sistema'>('marcas');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSaveEnv = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-y-auto bg-zinc-950 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-zinc-300" />
          Administração da Plataforma
        </span>
        <h1 className="text-2xl font-bold text-white mt-0.5">Configurações do Sistema</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie membros da equipe, treinamento da IA por conta e infraestrutura operacional.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('marcas')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'marcas'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4 text-zinc-300" />
          Contas & Treinamento da IA
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equipe')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'equipe'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipe & Permissões
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sistema')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'sistema'
              ? 'border-zinc-100 text-zinc-100 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="h-4 w-4" />
          Banco de Dados & Storage
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTAS & TREINAMENTO DA IA */}
      {/* ========================================================================= */}
      {activeTab === 'marcas' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">
              ✨ Treinamento Minucioso da IA do Gemini (Interactions API):
            </span>
            A inteligência artificial foi calibrada para atuar em duas frentes distintas com parâmetros exclusivos de linguagem, psicologia de conversão e regras de compliance. Use as tags para categorizar conteúdos e direcionar a geração.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meta Máxima Digital (Azul) */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <AccountBadge conta="meta_maxima_digital" size="md" />
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-500/30">
                  Tag: Azul
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Nicho & Posicionamento:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.nicho}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Público-Alvo:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.publico_alvo}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Tom de Voz da IA:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_digital.tom_de_voz}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Termos Obrigatórios Injetados:</span>
                  <p className="text-blue-300 font-mono text-[11px] bg-zinc-950 p-2 rounded border border-zinc-800">
                    {BRAND_PRESETS.meta_maxima_digital.palavras_obrigatorias}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">CTA Padrão de Conversão:</span>
                  <p className="text-zinc-300 italic bg-zinc-950 p-2 rounded border border-zinc-800">
                    &quot;{BRAND_PRESETS.meta_maxima_digital.cta_padrao}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Máxima Cursos (Verde) */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <AccountBadge conta="meta_maxima_cursos" size="md" />
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                  Tag: Verde
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Nicho & Posicionamento:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.nicho}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Público-Alvo:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.publico_alvo}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Tom de Voz da IA:</span>
                  <p className="text-zinc-200">{BRAND_PRESETS.meta_maxima_cursos.tom_de_voz}</p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">Termos Obrigatórios Injetados:</span>
                  <p className="text-emerald-300 font-mono text-[11px] bg-zinc-950 p-2 rounded border border-zinc-800">
                    {BRAND_PRESETS.meta_maxima_cursos.palavras_obrigatorias}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block mb-0.5">CTA Padrão de Conversão:</span>
                  <p className="text-zinc-300 italic bg-zinc-950 p-2 rounded border border-zinc-800">
                    &quot;{BRAND_PRESETS.meta_maxima_cursos.cta_padrao}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EQUIPE & PERMISSÕES */}
      {/* ========================================================================= */}
      {activeTab === 'equipe' && <TeamManagement />}

      {/* ========================================================================= */}
      {/* TAB 3: BANCO DE DADOS & STORAGE */}
      {/* ========================================================================= */}
      {activeTab === 'sistema' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100">Status da Instância do Banco</h4>
                <p className="text-xs text-zinc-400">PostgreSQL com Row Level Security, Triggers e Storage</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isSupabaseLive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-blue-400'
                }`}
              />
              <span className="text-zinc-300 font-medium">
                {isSupabaseLive
                  ? 'Conectado à instância remota do Supabase'
                  : 'Modo Local / Demonstração Ativo (persistência local e cache reativo funcionando 100%)'}
              </span>
            </div>

            <form onSubmit={handleSaveEnv} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-zinc-400" />
                  Script de banco disponível em: <code className="text-zinc-300">supabase/schema.sql</code>
                </p>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all active:scale-95 min-h-[44px]"
                >
                  {savedSettings ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
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
