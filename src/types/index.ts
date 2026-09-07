export type PostStatus =
  | 'ideias'
  | 'a_gravar'
  | 'gravado'
  | 'a_editar'
  | 'editado'
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

export interface PermissoesEquipe {
  // Conteúdo e Criação
  canCreateContent: boolean;     // Criar posts e ideias
  canEditContent: boolean;       // Editar roteiro, legenda, tags e detalhes
  canDeleteContent: boolean;     // Excluir posts ou ideias
  // Pipeline e Operação
  canMoveKanban: boolean;        // Mover cards entre etapas
  canApproveContent: boolean;    // Aprovar conteúdos para agendamento
  canPublishContent: boolean;    // Marcar como postado ou publicar
  // Mídias
  canManageFiles: boolean;       // Upload e exclusão de arquivos de mídia
  // Analytics & Relatórios
  canViewAnalytics: boolean;     // Visualizar Instagram, GA4 e Google Ads
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
  tags: string[];
  gancho?: string;
  roteiro_desenvolvimento?: string;
  roteiro_prova?: string;
  cta?: string;
  legenda?: string;
  observacoes?: string;
  thumbnail_url?: string;
  arquivo_bruto_url?: string;
  arquivo_editado_url?: string;
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

export interface ArquivoItem {
  id: string;
  post_id?: string;
  post_titulo?: string;
  nome: string;
  url: string;
  tamanho_bytes: number;
  tipo_mime?: string;
  categoria_arquivo: 'video_bruto' | 'video_editado' | 'imagem' | 'thumbnail' | 'documento' | 'referencia';
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

export type ProvedorIntegracao = 'meta_business' | 'google_analytics' | 'google_ads';
export type StatusIntegracao = 'conectado' | 'desconectado' | 'pendente' | 'erro';

export interface CredenciaisIntegracao {
  // Meta Business Suite
  app_id?: string;
  app_secret?: string;
  access_token?: string;
  business_id?: string;
  ad_account_id?: string;
  page_id?: string;
  ig_account_id?: string;
  // Google Analytics 4
  property_id?: string;
  measurement_id?: string;
  client_email?: string;
  private_key?: string;
  // Google Ads
  customer_id?: string;
  developer_token?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
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

export interface ContaConectada {
  id: string;
  plataforma: Plataforma;
  nome_conta: string;
  page_id?: string;
  ig_business_id?: string;
  conectado_em: string;
}

export interface MetricaDiaria {
  id: string;
  conta_id: string;
  data: string;
  seguidores: number;
  alcance: number;
  curtidas: number;
  comentarios: number;
  salvamentos: number;
  compartilhamentos: number;
  visualizacoes_reels: number;
}

export interface PostMetricas {
  alcance: number;
  impressoes: number;
  curtidas: number;
  comentarios: number;
  salvamentos: number;
  compartilhamentos: number;
  reels_views?: number;
}

export interface FilterState {
  search: string;
  periodo: 'todos' | '7dias' | '30dias' | 'mes_atual' | 'proximo_mes' | 'atrasados';
  status: string; // 'todos' or specific PostStatus
  tipo: string; // 'todos' or specific PostTipo
  funil: string; // 'todos' or specific EtapaFunil
  responsavel: string; // 'todos' or name
  prioridade: string; // 'todos' or specific Prioridade
  plataforma: string; // 'todos' or specific Plataforma
  tag: string; // 'todos' or specific tag
}
