'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { IntegracaoConfig, ProvedorIntegracao } from '@/types';
import ConnectIntegrationModal from './ConnectIntegrationModal';
import {
  Key,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Target,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/BrandIcons';

export default function IntegrationsManagement() {
  const { integrations, syncIntegrationData } = useContent();

  const [selectedIntegration, setSelectedIntegration] = useState<IntegracaoConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [syncFeedback, setSyncFeedback] = useState<Record<string, string>>({});

  const handleOpenConfig = (item: IntegracaoConfig) => {
    setSelectedIntegration(item);
    setIsModalOpen(true);
  };

  const handleSync = async (provedor: ProvedorIntegracao) => {
    setSyncingMap((prev) => ({ ...prev, [provedor]: true }));
    try {
      const res = await syncIntegrationData(provedor);
      setSyncFeedback((prev) => ({ ...prev, [provedor]: res.message }));
      setTimeout(() => {
        setSyncFeedback((prev) => ({ ...prev, [provedor]: '' }));
      }, 4000);
    } catch {
      setSyncFeedback((prev) => ({ ...prev, [provedor]: 'Erro ao sincronizar dados.' }));
    } finally {
      setSyncingMap((prev) => ({ ...prev, [provedor]: false }));
    }
  };

  const getProviderIcon = (provedor: ProvedorIntegracao) => {
    switch (provedor) {
      case 'meta_business':
        return (
          <div className="p-3 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/20">
            <InstagramIcon className="h-6 w-6" />
          </div>
        );
      case 'google_analytics':
        return (
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
        );
      case 'google_ads':
        return (
          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <Target className="h-6 w-6" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conectado':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Conectado & Ativo
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Aguardando Validação
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full">
            <AlertCircle className="h-3 w-3 text-slate-500" />
            Não Conectado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-400" />
            Conexões de APIs & Plataformas Externas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sincronização de métricas e contas para Meta Business Suite, Google Analytics 4 e Google Ads.
          </p>
        </div>
      </div>

      {/* Checklist Guide Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Checklist: O que você precisa fazer para conectar
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase">
                Guia Rápido
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consulte o arquivo <code className="text-indigo-300 font-mono">GUIA_CONEXOES.md</code> na raiz do projeto com os passos exatos no Meta for Developers e Google Cloud para gerar seus tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isSyncing = !!syncingMap[item.provedor];
          const feedback = syncFeedback[item.provedor];
          const isConnected = item.status === 'conectado';

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  {getProviderIcon(item.provedor)}
                  {getStatusBadge(item.status)}
                </div>

                {/* Title & Description */}
                <h4 className="text-sm font-bold text-white mb-1.5">{item.nome}</h4>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                  {item.descricao}
                </p>

                {/* Connection Details Preview */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  {item.provedor === 'meta_business' && (
                    <>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Business ID:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.business_id || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Conta de Anúncios:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.ad_account_id || 'Não vinculada'}
                        </span>
                      </div>
                    </>
                  )}

                  {item.provedor === 'google_analytics' && (
                    <>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Property ID:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.property_id || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Fluxo Web:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.measurement_id || 'Não configurado'}
                        </span>
                      </div>
                    </>
                  )}

                  {item.provedor === 'google_ads' && (
                    <>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Customer ID:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.customer_id || 'Não informado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Developer Token:</span>
                        <span className="font-mono text-slate-200">
                          {item.credenciais.developer_token ? 'Configurado' : 'Pendente'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>Última sincronização:</span>
                    <span className="text-slate-300 font-medium">
                      {item.ultima_sincronizacao
                        ? new Date(item.ultima_sincronizacao).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nunca'}
                    </span>
                  </div>
                </div>

                {/* Feedback message */}
                {feedback && (
                  <p className="mt-3 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center animate-fade-in">
                    {feedback}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenConfig(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2.5 rounded-lg transition-colors min-h-[44px]"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  {isConnected ? 'Editar Conexão' : 'Conectar Conta'}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleSync(item.provedor)}
                    aria-label={`Sincronizar dados de ${item.nome}`}
                    className="flex items-center justify-center p-2.5 text-indigo-400 hover:text-white bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg transition-all active:scale-95 disabled:opacity-50 min-h-[44px] min-w-[44px]"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      <ConnectIntegrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        integration={selectedIntegration}
      />
    </div>
  );
}
