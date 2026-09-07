export type PostStatus =
  | 'ideias'
  | 'a_gravar'
  | 'gravado'
  | 'a_editar'
  | 'editado'
  | 'revisao'
  | 'aprovado'
  | 'agendado'
  | 'postado';

export type PostTipo =
  | 'video'
  | 'reels_video'
  | 'carrossel'
  | 'post_estatico'
  | 'stories'
  | 'resultado'
  | 'anuncio'
  | 'outro';

export type EtapaFunil = 'topo' | 'meio' | 'fundo';

export type Prioridade = 'baixa' | 'normal' | 'alta' | 'urgente';

export type Plataforma = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin';

export type CategoriaIdeia =
  | 'educacional'
  | 'autoridade'
  | 'bastidores'
  | 'prova_social'
  | 'oferta'
  | 'entretenimento'
  | 'tendencia'
  | 'institucional';

export type PerfilRole = 'admin' | 'gestor' | 'editor' | 'social_media' | 'visualizador' | 'personalizado';

export type StatusMembro = 'ativo' | 'convidado' | 'inativo';

export type ClassificacaoConteudo = 'organico' | 'patrocinado' | 'organico_patrocinado';

export type UsoTrafegoPago =
  | 'nao_utilizado'
  | 'em_teste'
  | 'ativo'
  | 'pausado'
  | 'finalizado';

export interface PermissoesEquipe {
  // Conteúdo e Criação
  canCreateContent: boolean;     // Criar posts e ideias
  canEditContent: boolean;       // Editar roteiro, legenda, tags e detalhes
  canDeleteContent: boolean;     // Excluir posts ou ideias
  // Pipeline e Operação
  canMoveKanban: boolean;        // Mover cards entre etapas
  canApproveContent: boolean;    // Aprovar conteúdos para agendamento
  canPublishContent: boolean;    // Marcar como postado ou publicar
  // Mídias & Google Drive
  canManageFiles: boolean;       // Upload e exclusão de arquivos e Drive
  // Marketing & Analytics
  canViewMarketing: boolean;     // Visualizar Meta Ads, Pixel e Performance
  canViewAnalytics: boolean;     // Visualizar Instagram, Facebook e GA4
  // Administração
  canManageIntegrations: boolean;// Conectar e editar APIs
  canManageTeam: boolean;        // Convidar e editar permissões da equipe
}

export const DEFAULT_ROLE_PERMISSIONS: Record<PerfilRole, PermissoesEquipe> = {
  admin: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canMoveKanban: true,
    canApproveContent: true,
    canPublishContent: true,
    canManageFiles: true,
    canViewMarketing: true,
    canViewAnalytics: true,
    canManageIntegrations: true,
    canManageTeam: true,
  },
  gestor: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canMoveKanban: true,
    canApproveContent: true,
    canPublishContent: true,
    canManageFiles: true,
    canViewMarketing: true,
    canViewAnalytics: true,
    canManageIntegrations: true,
    canManageTeam: false,
  },
  editor: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canMoveKanban: true,
    canApproveContent: false,
    canPublishContent: false,
    canManageFiles: true,
    canViewMarketing: false,
    canViewAnalytics: true,
    canManageIntegrations: false,
    canManageTeam: false,
  },
  social_media: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canMoveKanban: true,
    canApproveContent: true,
    canPublishContent: true,
    canManageFiles: true,
    canViewMarketing: true,
    canViewAnalytics: true,
    canManageIntegrations: false,
    canManageTeam: false,
  },
  visualizador: {
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canMoveKanban: false,
    canApproveContent: false,
    canPublishContent: false,
    canManageFiles: false,
    canViewMarketing: true,
    canViewAnalytics: true,
    canManageIntegrations: false,
    canManageTeam: false,
  },
  personalizado: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canMoveKanban: true,
    canApproveContent: false,
    canPublishContent: false,
    canManageFiles: true,
    canViewMarketing: true,
    canViewAnalytics: true,
    canManageIntegrations: false,
    canManageTeam: false,
  },
};

export interface Post {
  id: string;
  titulo: string;
  data_publicacao: string; // YYYY-MM-DD
  hora_publicacao: string; // HH:mm
  tipo: PostTipo;
  etapa_funil: EtapaFunil;
  status: PostStatus;
  prioridade: Prioridade;
  plataforma: Plataforma;
  responsavel: string;
  cliente_projeto?: string;
  tags: string[];
  
  // Roteiro estruturado
  gancho?: string;
  roteiro_hook?: string;
  roteiro_desenvolvimento?: string;
  roteiro_prova?: string;
  roteiro_cta?: string;
  cta?: string;
  legenda?: string;
  hashtags?: string;
  observacoes?: string;
  referencia_url?: string;
  
  // Arquivos e Google Drive
  thumbnail_url?: string;
  arquivo_bruto_url?: string;
  arquivo_editado_url?: string;
  google_drive_file_id?: string;
  google_drive_folder_id?: string;
  google_drive_file_name?: string;
  google_drive_web_view_link?: string;
  google_drive_mime_type?: string;
  google_drive_thumbnail_url?: string;
  drive_file_id?: string;
  drive_file_url?: string;
  drive_folder_id?: string;
  drive_folder_name?: string;

  // Publicação Externa
  publicacao_url?: string;
  publicacao_id?: string;
  publicacao_status?: 'nao_publicado' | 'agendado' | 'publicado' | 'erro';
  publicacao_data?: string;

  // Tráfego Pago & Meta Ads
  classificacao?: ClassificacaoConteudo;
  uso_trafego_pago?: UsoTrafegoPago;
  meta_ad_id?: string;
  meta_ad_name?: string;
  meta_adset_id?: string;
  meta_adset_name?: string;
  meta_campaign_id?: string;
  meta_campaign_name?: string;
  meta_creative_id?: string;
  meta_creative_name?: string;
  meta_account_id?: string;
  
  // Métricas de Anúncios Reais (quando vinculadas)
  anuncio_investimento?: number;
  anuncio_leads?: number;
  anuncio_cpl?: number;
  anuncio_cliques?: number;
  anuncio_ctr?: number;
  anuncio_cpc?: number;
  anuncio_cpm?: number;
  anuncio_conversoes?: number;
  anuncio_cpa?: number;
  anuncio_receita?: number;
  anuncio_roas?: number;

  // Métricas Orgânicas Reais (quando sincronizadas)
  organico_alcance?: number;
  organico_impressoes?: number;
  organico_curtidas?: number;
  organico_comentarios?: number;
  organico_salvamentos?: number;
  organico_compartilhamentos?: number;
  organico_reels_views?: number;

  idea_id?: string;
  arquivado?: boolean;
  ordem?: number;
  user_id?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Ideia {
  id: string;
  titulo: string;
  ideia: string;
  hook?: string;
  gancho?: string;
  objetivo?: string;
  publico?: string;
  etapa_funil: EtapaFunil;
  formato: string;
  referencia?: string;
  cta?: string;
  observacoes?: string;
  responsavel?: string;
  prioridade: Prioridade;
  categoria: CategoriaIdeia;
  tags: string[];
  plataforma?: Plataforma;
  arquivado: boolean;
  post_id?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface HistoricoItem {
  id: string;
  post_id: string;
  usuario: string;
  acao: string;
  detalhe?: string;
  criado_em: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  action: string;
  category?: 'conteudo' | 'drive' | 'meta_ads' | 'pixel' | 'equipe' | 'sistema';
  entity_type?: 'POST' | 'IDEA' | 'CAMPAIGN' | 'AD' | 'FILE' | 'INTEGRATION' | string;
  entity_id?: string;
  entity_title?: string;
  target_id?: string;
  target_name?: string;
  detail?: string;
  details?: string;
  criado_em?: string;
  created_at?: string;
}

export interface ContaConectada {
  id: string;
  plataforma: Plataforma;
  nome_conta: string;
  status: 'conectado' | 'desconectado';
}

export interface MetricaDiaria {
  data: string;
  alcance: number;
  impressoes: number;
  engajamento: number;
  seguidores: number;
}

export interface ArquivoItem {
  id: string;
  post_id?: string;
  post_titulo?: string;
  nome: string;
  url: string;
  tamanho_bytes: number;
  tipo_mime?: string;
  categoria_arquivo: 'video_bruto' | 'video_editado' | 'imagem' | 'thumbnail' | 'documento' | 'referencia';
  google_drive_file_id?: string;
  criado_em: string;
}

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  cargo: string;
  role: PerfilRole;
  status: StatusMembro;
  permissoes: PermissoesEquipe;
  senha?: string;
  criado_em?: string;
}

// Google Drive Integration
export interface GoogleDriveFolderMapping {
  id?: string;
  status: PostStatus;
  folder_id: string;
  folder_name: string;
}

export interface GoogleDriveSyncLog {
  id: string;
  post_id: string;
  post_titulo: string;
  file_id: string;
  file_name: string;
  from_folder_id?: string;
  to_folder_id: string;
  to_folder_name: string;
  status: 'sucesso' | 'erro';
  erro_mensagem?: string;
  criado_em: string;
}

// Meta Marketing API (Ads & Creatives)
export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  daily_budget?: number;
  lifetime_budget?: number;
  spend?: number;
  leads?: number;
  cpl?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  created_time?: string;
}

export interface MetaAdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  targeting_summary?: string;
  daily_budget?: number;
  spend?: number;
  leads?: number;
  cpl?: number;
}

export interface MetaAd {
  id: string;
  adset_id: string;
  campaign_id: string;
  name: string;
  creative_id?: string;
  post_id?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  preview_url?: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  cpl: number;
  conversions: number;
  cpa: number;
  revenue?: number;
  roas?: number;
}

export interface MetaCreative {
  id: string;
  name: string;
  post_id?: string;
  thumbnail_url?: string;
  title?: string;
  body?: string;
  format?: string;
}

// Meta Pixel Integration
export interface MetaPixelEvent {
  id: string;
  pixel_id: string;
  event_name: 'PageView' | 'ViewContent' | 'Lead' | 'Contact' | 'CompleteRegistration' | 'Purchase' | string;
  event_count: number;
  last_fired_at: string;
  url?: string;
}

export interface MetaPixelConfig {
  pixel_id: string;
  name: string;
  status: 'ativo' | 'inativo' | 'alerta';
  last_event_time?: string;
  diagnostics?: string;
  events: MetaPixelEvent[];
}

// Performance Ranking & Comparison
export interface CreativePerformanceItem {
  post_id: string;
  post_titulo: string;
  thumbnail_url?: string;
  campaign_name?: string;
  ad_name?: string;
  uso_trafego_pago: UsoTrafegoPago;
  classificacao: ClassificacaoConteudo;
  investido: number;
  impressoes: number;
  alcance: number;
  cliques: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  cpl: number;
  conversoes: number;
  cpa: number;
  receita: number;
  roas: number;
  rating?: 'excelente' | 'bom' | 'regular' | 'atencao' | 'baixo';
}

export type ProvedorIntegracao =
  | 'google_drive'
  | 'meta_business'
  | 'meta_ads'
  | 'meta_pixel'
  | 'google_analytics'
  | 'google_ads';

export type StatusIntegracao = 'conectado' | 'desconectado' | 'pendente' | 'erro';

export interface CredenciaisIntegracao {
  // Google Drive
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  root_folder_id?: string;
  root_folder_name?: string;

  // Meta Business Suite
  app_id?: string;
  app_secret?: string;
  access_token?: string;
  business_id?: string;
  ad_account_id?: string;
  page_id?: string;
  ig_account_id?: string;

  // Meta Pixel
  pixel_id?: string;
  pixel_conversion_token?: string;

  // Google Analytics 4
  property_id?: string;
  measurement_id?: string;
  client_email?: string;
  private_key?: string;

  // Google Ads
  customer_id?: string;
  developer_token?: string;
}

export interface IntegracaoConfig {
  id: string;
  provedor: ProvedorIntegracao;
  nome: string;
  descricao: string;
  status: StatusIntegracao;
  ultima_sincronizacao?: string;
  credenciais: CredenciaisIntegracao;
}

export interface FilterState {
  search: string;
  periodo: 'todos' | 'hoje' | 'ontem' | '7dias' | '30dias' | 'mes_atual' | 'mes_anterior' | 'proximo_mes' | 'atrasados';
  status: string; // 'todos' or specific PostStatus
  tipo: string; // 'todos' or specific PostTipo
  funil: string; // 'todos' or specific EtapaFunil
  responsavel: string; // 'todos' or name
  prioridade: string; // 'todos' or specific Prioridade
  plataforma: string; // 'todos' or specific Plataforma
  tag: string; // 'todos' or specific tag
  cliente_projeto?: string;
  classificacao?: string; // 'todos' | 'organico' | 'patrocinado' | 'organico_patrocinado'
  uso_trafego_pago?: string; // 'todos' | UsoTrafegoPago
}
