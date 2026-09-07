'use client';

import React, { useState, useEffect } from 'react';
import { IntegracaoConfig, ProvedorIntegracao, StatusIntegracao } from '@/types';
import { useContent } from '@/lib/context/ContentContext';
import {
  X,
  Key,
  ShieldCheck,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/BrandIcons';

interface ConnectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegracaoConfig | null;
}

export default function ConnectIntegrationModal({
  isOpen,
  onClose,
  integration,
}: ConnectIntegrationModalProps) {
  const { updateIntegration, testIntegrationConnection } = useContent();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData({
        app_id: integration.credenciais.app_id || '',
        app_secret: integration.credenciais.app_secret || '',
        access_token: integration.credenciais.access_token || '',
        business_id: integration.credenciais.business_id || '',
        ad_account_id: integration.credenciais.ad_account_id || '',
        page_id: integration.credenciais.page_id || '',
        ig_account_id: integration.credenciais.ig_account_id || '',
        pixel_id: integration.credenciais.pixel_id || '',
        pixel_conversion_token: integration.credenciais.pixel_conversion_token || '',
        property_id: integration.credenciais.property_id || '',
        measurement_id: integration.credenciais.measurement_id || '',
        client_email: integration.credenciais.client_email || '',
        private_key: integration.credenciais.private_key || '',
        customer_id: integration.credenciais.customer_id || '',
        developer_token: integration.credenciais.developer_token || '',
        client_id: integration.credenciais.client_id || '',
        client_secret: integration.credenciais.client_secret || '',
        refresh_token: integration.credenciais.refresh_token || '',
      });
      setTestResult(null);
      setShowHelp(false);
    }
  }, [integration, isOpen]);

  if (!isOpen || !integration) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // First save draft credentials
      await updateIntegration(integration.provedor, {
        credenciais: { ...integration.credenciais, ...formData },
      });
      const res = await testIntegrationConnection(integration.provedor);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Falha ao validar credenciais.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const hasAnyCredential = Boolean(
        formData.access_token ||
        formData.property_id ||
        formData.customer_id ||
        formData.ad_account_id ||
        formData.pixel_id ||
        formData.client_email ||
        formData.refresh_token ||
        formData.client_id
      );

      await updateIntegration(integration.provedor, {
        credenciais: { ...integration.credenciais, ...formData },
        status: hasAnyCredential ? 'conectado' : 'desconectado',
        ultima_sincronizacao: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 md:p-8 my-8 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal de conexão"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h2 id="connect-modal-title" className="text-xl font-bold text-white">
              Conectar {integration.nome}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{integration.descricao}</p>
          </div>
        </div>

        {/* Test Connection Banner if present */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-6 border ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* ========================================================================= */}
          {/* 1. META BUSINESS SUITE FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'meta_business' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Token de Acesso (User Token ou System User) *
                </label>
                <input
                  type="password"
                  value={formData.access_token || ''}
                  onChange={(e) => handleChange('access_token', e.target.value)}
                  placeholder="EAABwzLIX... (Gerado no Meta for Developers ou BM)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Permissões necessárias: <code className="text-slate-400">instagram_basic</code>, <code className="text-slate-400">instagram_manage_insights</code>, <code className="text-slate-400">pages_read_engagement</code>, <code className="text-slate-400">ads_read</code>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    ID do Business Manager
                  </label>
                  <input
                    type="text"
                    value={formData.business_id || ''}
                    onChange={(e) => handleChange('business_id', e.target.value)}
                    placeholder="Ex: 77491028401"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    ID da Conta de Anúncios
                  </label>
                  <input
                    type="text"
                    value={formData.ad_account_id || ''}
                    onChange={(e) => handleChange('ad_account_id', e.target.value)}
                    placeholder="Ex: act_904812395"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    ID da Página do Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.page_id || ''}
                    onChange={(e) => handleChange('page_id', e.target.value)}
                    placeholder="Ex: 1049281048201"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Instagram Account ID
                  </label>
                  <input
                    type="text"
                    value={formData.ig_account_id || ''}
                    onChange={(e) => handleChange('ig_account_id', e.target.value)}
                    placeholder="Ex: 178414002938102"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Meta App ID (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.app_id || ''}
                    onChange={(e) => handleChange('app_id', e.target.value)}
                    placeholder="Ex: 123456789012345"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Meta App Secret (Opcional)
                  </label>
                  <input
                    type="password"
                    value={formData.app_secret || ''}
                    onChange={(e) => handleChange('app_secret', e.target.value)}
                    placeholder="Chave secreta do App Meta"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 2. GOOGLE ANALYTICS 4 FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'google_analytics' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  ID da Propriedade GA4 (Property ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.property_id || ''}
                  onChange={(e) => handleChange('property_id', e.target.value)}
                  placeholder="Ex: 419284012 (Apenas os dígitos)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Encontrado em Administrador &gt; Detalhes da Propriedade no GA4.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  ID de Medição do Fluxo Web (Measurement ID)
                </label>
                <input
                  type="text"
                  value={formData.measurement_id || ''}
                  onChange={(e) => handleChange('measurement_id', e.target.value)}
                  placeholder="Ex: G-XXXXXXXXXX"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail da Conta de Serviço Google (Service Account)
                </label>
                <input
                  type="email"
                  value={formData.client_email || ''}
                  onChange={(e) => handleChange('client_email', e.target.value)}
                  placeholder="Ex: crm-sync@seu-projeto.iam.gserviceaccount.com"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Adicione este e-mail como leitor na sua propriedade do Google Analytics.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Chave Privada / JSON da Conta de Serviço (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.private_key || ''}
                  onChange={(e) => handleChange('private_key', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 3. GOOGLE ADS FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'google_ads' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Customer ID do Google Ads (10 Dígitos) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_id || ''}
                  onChange={(e) => handleChange('customer_id', e.target.value)}
                  placeholder="Ex: 123-456-7890 ou 1234567890"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Exibido no canto superior direito do seu painel do Google Ads.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Developer Token (MCC)
                  </label>
                  <input
                    type="password"
                    value={formData.developer_token || ''}
                    onChange={(e) => handleChange('developer_token', e.target.value)}
                    placeholder="Token da conta de administrador"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.client_id || ''}
                    onChange={(e) => handleChange('client_id', e.target.value)}
                    placeholder="XXXX.apps.googleusercontent.com"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 4. META ADS MANAGER FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'meta_ads' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  ID da Conta de Anúncios (Ad Account ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ad_account_id || ''}
                  onChange={(e) => handleChange('ad_account_id', e.target.value)}
                  placeholder="Ex: act_904812395"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Identificador da conta no Gerenciador de Anúncios (com prefixo <code className="text-slate-400">act_</code>).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Token de Acesso da Meta Marketing API *
                </label>
                <input
                  type="password"
                  value={formData.access_token || ''}
                  onChange={(e) => handleChange('access_token', e.target.value)}
                  placeholder="EAABwzLIX... (Token de Usuário do Sistema com ads_read, ads_management)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  ID do Business Manager (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.business_id || ''}
                  onChange={(e) => handleChange('business_id', e.target.value)}
                  placeholder="Ex: 77491028401"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 5. META PIXEL & CAPI FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'meta_pixel' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  ID do Pixel da Meta (Pixel ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pixel_id || ''}
                  onChange={(e) => handleChange('pixel_id', e.target.value)}
                  placeholder="Ex: 129481029482019 (15 a 16 dígitos)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Encontrado no Gerenciador de Eventos da Meta em Fontes de Dados &gt; Configurações.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Token da API de Conversões (CAPI)
                </label>
                <input
                  type="password"
                  value={formData.pixel_conversion_token || formData.access_token || ''}
                  onChange={(e) => {
                    handleChange('pixel_conversion_token', e.target.value);
                    handleChange('access_token', e.target.value);
                  }}
                  placeholder="EAABwzLIX... (Gerado em Gerenciador de Eventos > API de Conversões)"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Necessário para envio direto de eventos server-side de Leads, Contatos e Conversões.
                </span>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 6. GOOGLE DRIVE WORKSPACE FIELDS */}
          {/* ========================================================================= */}
          {integration.provedor === 'google_drive' && (
            <>
              {/* Fixed physical folders summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                  Mapeamento Fixo de Pastas Físicas do Kanban
                </span>
                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans">1. GRAVADO:</span>
                    <span className="text-indigo-300 select-all">19_TAUMLSHKnMnbrCnXh3W2Ckph9L_b0_</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans">2. EDITADO:</span>
                    <span className="text-indigo-300 select-all">14Fejcns0sSJ7QNww9A8J-7hrVUU83drj</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans">3. POSTADO:</span>
                    <span className="text-indigo-300 select-all">1e1MiCRqtVB9xiqlJn-GbHFXipZThWahb</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  As demais etapas (Ideias, A gravar, A editar, Agendado) não exigem nem movimentam pastas no Google Drive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail da Conta de Serviço Google (Service Account)
                </label>
                <input
                  type="email"
                  value={formData.client_email || ''}
                  onChange={(e) => handleChange('client_email', e.target.value)}
                  placeholder="drive-bot@seu-projeto.iam.gserviceaccount.com"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Compartilhe as 3 pastas acima com este e-mail como Editor no Google Drive.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Chave Privada / JSON da Conta de Serviço (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.private_key || ''}
                  onChange={(e) => handleChange('private_key', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Toggle Help Guide */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {showHelp ? 'Ocultar guia de onde encontrar as chaves' : 'Como obter e onde encontrar essas credenciais?'}
            </button>

            {showHelp && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                {integration.provedor === 'meta_business' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>Acesse <strong className="text-slate-200">developers.facebook.com</strong> &gt; Criar App &gt; Tipo: Empresa (Business).</li>
                    <li>Em <strong className="text-slate-200">Ferramentas &gt; Explorador da Graph API</strong>, selecione seu app e conceda as permissões de Instagram e Páginas.</li>
                    <li>Gere um <strong className="text-slate-200">Token de Usuário do Sistema</strong> no Business Manager com validade permanente.</li>
                  </ol>
                )}
                {integration.provedor === 'meta_ads' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>No Gerenciador de Anúncios (<strong className="text-slate-200">adsmanager.facebook.com</strong>), copie o ID da sua conta (ex: <code className="text-slate-200">act_904812395</code>).</li>
                    <li>Gere um token de acesso de usuário do sistema no Business Manager com as permissões <code className="text-slate-200">ads_read</code> e <code className="text-slate-200">ads_management</code>.</li>
                  </ol>
                )}
                {integration.provedor === 'meta_pixel' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>Acesse o <strong className="text-slate-200">Gerenciador de Eventos da Meta</strong> &gt; Fontes de Dados &gt; selecione o Pixel da sua marca.</li>
                    <li>Copie o <strong className="text-slate-200">Pixel ID</strong> numérico.</li>
                    <li>Na aba <strong className="text-slate-200">Configurações</strong> &gt; API de Conversões, clique em <strong className="text-slate-200">Gerar token de acesso</strong>.</li>
                  </ol>
                )}
                {integration.provedor === 'google_drive' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>As 3 pastas fixas do Kanban já estão pré-configuradas (Gravado, Editado, Postado).</li>
                    <li>No Google Cloud Console, crie uma <strong className="text-slate-200">Conta de Serviço</strong> com a Google Drive API ativa.</li>
                    <li>No Google Drive, clique com o botão direito nas pastas e compartilhe o acesso de <strong className="text-slate-200">Editor</strong> com o e-mail da conta de serviço.</li>
                  </ol>
                )}
                {integration.provedor === 'google_analytics' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>No painel do GA4 (<strong className="text-slate-200">analytics.google.com</strong>), clique em Administrador &gt; Detalhes da Propriedade e copie o <strong className="text-slate-200">ID da Propriedade</strong>.</li>
                    <li>No Google Cloud Console, ative a <strong className="text-slate-200">Google Analytics Data API v1</strong>.</li>
                    <li>Crie uma Conta de Serviço (Service Account), copie o e-mail dela e adicione-o como leitor no GA4.</li>
                  </ol>
                )}
                {integration.provedor === 'google_ads' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-400">
                    <li>No Google Ads (<strong className="text-slate-200">ads.google.com</strong>), copie o ID de 10 dígitos no topo direito (ex: 123-456-7890).</li>
                    <li>Para uso com API direta, solicite o <strong className="text-slate-200">Developer Token</strong> na sua conta MCC em Central de APIs.</li>
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testando Conexão...' : 'Testar Conexão'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all active:scale-95 min-h-[44px]"
              >
                {saving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Salvar Credenciais
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
