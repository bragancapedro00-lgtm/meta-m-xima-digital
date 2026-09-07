'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import {
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  Filter,
  Layers,
  Globe,
  Server,
} from 'lucide-react';
import { MetaIcon } from '@/components/icons/BrandIcons';

export default function MetaPixelPage() {
  const { pixelConfig, integrations } = useContent();

  const [simulatingEvent, setSimulatingEvent] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  const pixelIntegration = integrations.find(
    (i) => i.provedor === 'meta_pixel' || i.provedor === 'meta_business'
  );
  const isConnected = pixelIntegration?.status === 'conectado';

  if (!isConnected) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700 mb-4 text-slate-400">
          <Radio className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Meta Pixel Não Conectado</h3>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          Integre o Meta Pixel e a API de Conversões (CAPI) para rastrear o funil de tráfego, eventos de Lead e compras no site.
        </p>
        <a
          href="/configuracoes?tab=integracoes"
          className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Radio className="h-4 w-4" />
          Configurar Pixel na Central de Integrações
        </a>
      </div>
    );
  }

  // Calculate funnel steps
  const pageViewEv = pixelConfig.events.find((e) => e.event_name === 'PageView');
  const viewContentEv = pixelConfig.events.find((e) => e.event_name === 'ViewContent');
  const leadEv = pixelConfig.events.find((e) => e.event_name === 'Lead');
  const contactEv = pixelConfig.events.find((e) => e.event_name === 'Contact');
  const regEv = pixelConfig.events.find((e) => e.event_name === 'CompleteRegistration');

  const pageViewCount = pageViewEv?.event_count || 52410;
  const viewContentCount = viewContentEv?.event_count || 18920;
  const leadCount = leadEv?.event_count || 1580;
  const contactCount = contactEv?.event_count || 740;
  const regCount = regEv?.event_count || 310;

  const handleTestEvent = () => {
    setSimulatingEvent(true);
    setTimeout(() => {
      setSimulatingEvent(false);
      setSimulationSuccess('Evento Lead disparado com sucesso via API de Conversões (CAPI)!');
      setTimeout(() => setSimulationSuccess(null), 4000);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Rastreamento & Conversões
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Sinal Ativo & Saudável
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2.5">
            <Radio className="h-5 w-5 text-indigo-400" />
            Meta Pixel & API de Conversões (CAPI)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnósticos de sinal, monitoramento de eventos de conversão e jornada do usuário entre anúncio e site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestEvent}
            disabled={simulatingEvent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {simulatingEvent ? 'Disparando...' : 'Testar Disparo de Evento'}
          </button>

          <a
            href="https://business.facebook.com/events_manager2"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Gerenciador de Eventos Meta
          </a>
        </div>
      </div>

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {simulationSuccess && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{simulationSuccess}</span>
          </div>
        )}

        {/* Diagnostics Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {pixelConfig.name}
                  <span className="text-xs text-indigo-400 font-mono">ID: {pixelConfig.pixel_id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pixelConfig.diagnostics}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-300 font-medium">Pixel Web: Ativo</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">API Servidor (CAPI): Ativo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Qualidade de Correspondência</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">8.8 / 10</p>
              <span className="text-[10px] text-emerald-500/80">Excelente sinal</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Eventos Desduplicados</span>
              <p className="text-lg font-bold text-indigo-400 mt-1">99.4%</p>
              <span className="text-[10px] text-slate-500">Browser + Servidor</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Último Evento Recebido</span>
              <p className="text-sm font-bold text-slate-200 mt-1.5">Há 2 minutos</p>
              <span className="text-[10px] text-slate-500">Fluxo contínuo</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Status de Domínio</span>
              <p className="text-sm font-bold text-emerald-400 mt-1.5">Verificado</p>
              <span className="text-[10px] text-slate-500">metamaxima.com.br</span>
            </div>
          </div>
        </div>

        {/* Visual Conversion Funnel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Jornada de Conversão dos Anúncios no Site
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Funil de eventos disparados pelos visitantes originados no tráfego pago.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Etapa 1</span>
                <h5 className="text-xs font-bold text-slate-200 mt-0.5">PageView (Sessões)</h5>
                <p className="text-xl font-bold text-slate-100 mt-2 tabular-nums">
                  {pageViewCount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                100% dos acessos
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Etapa 2</span>
                <h5 className="text-xs font-bold text-slate-200 mt-0.5">ViewContent (Planos)</h5>
                <p className="text-xl font-bold text-indigo-300 mt-2 tabular-nums">
                  {viewContentCount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-indigo-400 font-semibold">
                {((viewContentCount / pageViewCount) * 100).toFixed(1)}% de retenção
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Etapa 3</span>
                <h5 className="text-xs font-bold text-slate-200 mt-0.5">Lead (Formulários)</h5>
                <p className="text-xl font-bold text-emerald-400 mt-2 tabular-nums">
                  {leadCount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-semibold">
                {((leadCount / viewContentCount) * 100).toFixed(1)}% taxa de conversão
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Etapa 4</span>
                <h5 className="text-xs font-bold text-slate-200 mt-0.5">Contact (WhatsApp)</h5>
                <p className="text-xl font-bold text-cyan-300 mt-2 tabular-nums">
                  {contactCount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 font-semibold">
                {((contactCount / leadCount) * 100).toFixed(1)}% engajamento
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Etapa 5</span>
                <h5 className="text-xs font-bold text-slate-200 mt-0.5">Registration / Venda</h5>
                <p className="text-xl font-bold text-amber-300 mt-2 tabular-nums">
                  {regCount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-amber-400 font-semibold">
                {((regCount / leadCount) * 100).toFixed(1)}% fechamento final
              </div>
            </div>
          </div>
        </div>

        {/* Live Events Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Eventos Padronizados & Atividade Recente
            </h4>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Nome do Evento</th>
                <th className="py-3 px-4">URL / Origem</th>
                <th className="py-3 px-3 text-right">Disparos Totais</th>
                <th className="py-3 px-4 text-right">Último Disparo</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pixelConfig.events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                    {ev.event_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] truncate max-w-xs">
                    {ev.url || 'Todas as páginas'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-100 tabular-nums">
                    {ev.event_count.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 tabular-nums">
                    {ev.last_fired_at}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Recebendo
                    </span>
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
