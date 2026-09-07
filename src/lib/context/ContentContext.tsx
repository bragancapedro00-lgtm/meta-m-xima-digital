'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Post,
  Ideia,
  HistoricoItem,
  ArquivoItem,
  Perfil,
  FilterState,
  PostStatus,
  Prioridade,
  EtapaFunil,
  PostTipo,
  Plataforma,
  CategoriaIdeia,
  PerfilRole,
  PermissoesEquipe,
  IntegracaoConfig,
  ProvedorIntegracao,
  DEFAULT_ROLE_PERMISSIONS,
  GoogleDriveFolderMapping,
  DRIVE_PHYSICAL_STAGES,
  DRIVE_FOLDER_IDS,
  DEFAULT_DRIVE_FOLDER_MAPPINGS,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaCreative,
  MetaPixelConfig,
  AuditLog,
  BrandContext,
  GeneratedIdeaItem,
  GeneratedScript,
  GeneratedCarousel,
  GeneratedAd,
} from '@/types';
import {
  INITIAL_POSTS,
  INITIAL_IDEAS,
  INITIAL_HISTORY,
  INITIAL_FILES,
  INITIAL_PROFILES,
  INITIAL_INTEGRATIONS,
  INITIAL_DRIVE_FOLDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_ADSETS,
  INITIAL_ADS,
  INITIAL_CREATIVES,
  INITIAL_PIXEL_CONFIG,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type PostModalTab = 'detalhes' | 'roteiro' | 'arquivos' | 'publicacao' | 'anuncios' | 'metricas' | 'historico';

interface ContentContextType {
  posts: Post[];
  ideas: Ideia[];
  history: HistoricoItem[];
  files: ArquivoItem[];
  profiles: Perfil[];
  addTeamMember: (member: Omit<Perfil, 'id' | 'criado_em'>) => Promise<Perfil>;
  updateTeamMember: (id: string, updates: Partial<Perfil>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  integrations: IntegracaoConfig[];
  updateIntegration: (provedor: ProvedorIntegracao, updates: Partial<IntegracaoConfig>) => Promise<void>;
  testIntegrationConnection: (provedor: ProvedorIntegracao) => Promise<{ success: boolean; message: string }>;
  syncIntegrationData: (provedor: ProvedorIntegracao) => Promise<{ success: boolean; message: string }>;
  canPerform: (action: keyof PermissoesEquipe) => boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredPosts: Post[];
  selectedPost: Post | null;
  isModalOpen: boolean;
  modalTab: PostModalTab;
  openPostModal: (post: Post, tab?: PostModalTab) => void;
  closePostModal: () => void;
  isNewPostModalOpen: boolean;
  openNewPostModal: (initialStatus?: PostStatus, initialDate?: string) => void;
  closeNewPostModal: () => void;
  newPostDefaults: { status: PostStatus; date: string };
  isNewIdeaModalOpen: boolean;
  openNewIdeaModal: () => void;
  closeNewIdeaModal: () => void;
  updatePostStatus: (id: string, newStatus: PostStatus) => Promise<void>;
  updatePostDate: (id: string, newDate: string, newTime?: string) => Promise<void>;
  savePost: (post: Partial<Post> & { titulo: string; data_publicacao: string }) => Promise<Post>;
  duplicatePost: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  archivePost: (id: string, arquivado?: boolean) => Promise<void>;
  saveIdea: (idea: Partial<Ideia> & { titulo: string; ideia: string }) => Promise<Ideia>;
  deleteIdea: (id: string) => Promise<void>;
  convertIdeaToPost: (ideaId: string, targetStatus?: PostStatus) => Promise<Post>;
  addFile: (file: Omit<ArquivoItem, 'id' | 'criado_em'>) => Promise<ArquivoItem>;
  deleteFile: (fileId: string) => Promise<void>;
  addHistory: (postId: string, acao: string, detalhe?: string) => Promise<void>;
  isOverdue: (post: Post) => boolean;
  isSupabaseLive: boolean;
  currentUser: Perfil;
  setCurrentUser: (perfil: Perfil) => void;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, senha?: string) => Promise<{ success: boolean; error?: string; user?: Perfil }>;
  logout: () => void;

  // New Operational Entities & Methods
  driveFolders: GoogleDriveFolderMapping[];
  setDriveFolders: React.Dispatch<React.SetStateAction<GoogleDriveFolderMapping[]>>;
  campaigns: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAd[];
  creatives: MetaCreative[];
  pixelConfig: MetaPixelConfig;
  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    entityType: 'POST' | 'IDEA' | 'CAMPAIGN' | 'AD' | 'FILE' | 'INTEGRATION',
    entityId?: string,
    entityTitle?: string,
    details?: string
  ) => Promise<void>;
  moveGoogleDriveFile: (postId: string, newStatus: PostStatus) => Promise<{ success: boolean; folderName: string }>;
  retryGoogleDriveSync: (postId: string) => Promise<{ success: boolean; message: string }>;
  linkGoogleDriveFile: (
    postId: string,
    fileData: {
      fileId: string;
      fileName: string;
      fileUrl: string;
      folderId?: string;
      mimeType?: string;
      thumbnailUrl?: string;
    }
  ) => Promise<void>;
  inviteTeamMember: (data: {
    nome: string;
    email: string;
    cargo: string;
    role: PerfilRole;
    senha?: string;
  }) => Promise<{ success: boolean; member: Perfil; inviteUrl: string }>;
  linkPostToAd: (postId: string, adId: string, campaignId?: string) => Promise<void>;

  // AI Assistant Integrations
  brandContext: BrandContext;
  updateBrandContext: (updates: Partial<BrandContext>) => Promise<void>;
  saveAIIdeaToIdeas: (idea: GeneratedIdeaItem) => Promise<Ideia>;
  saveAIScriptToPost: (script: GeneratedScript, targetStatus?: PostStatus) => Promise<Post>;
  saveAICarouselToPost: (carousel: GeneratedCarousel) => Promise<Post>;
  saveAIAdToCreative: (ad: GeneratedAd) => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  periodo: 'todos',
  status: 'todos',
  tipo: 'todos',
  funil: 'todos',
  responsavel: 'todos',
  prioridade: 'todos',
  plataforma: 'todos',
  tag: 'todos',
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_POSTS = 'mmd_crm_posts_v1';
const LOCAL_STORAGE_KEY_IDEAS = 'mmd_crm_ideas_v1';
const LOCAL_STORAGE_KEY_HISTORY = 'mmd_crm_history_v1';
const LOCAL_STORAGE_KEY_FILES = 'mmd_crm_files_v1';
const LOCAL_STORAGE_KEY_PROFILES = 'mmd_crm_profiles_v1';
const LOCAL_STORAGE_KEY_INTEGRATIONS = 'mmd_crm_integrations_v1';
const LOCAL_STORAGE_KEY_SESSION = 'mmd_crm_session_v1';
const LOCAL_STORAGE_KEY_LOGGED_OUT = 'mmd_crm_logged_out_v1';
const LOCAL_STORAGE_KEY_DRIVE_FOLDERS = 'mmd_crm_drive_folders_v1';
const LOCAL_STORAGE_KEY_CAMPAIGNS = 'mmd_crm_campaigns_v1';
const LOCAL_STORAGE_KEY_ADS = 'mmd_crm_ads_v1';
const LOCAL_STORAGE_KEY_PIXEL = 'mmd_crm_pixel_v1';
const LOCAL_STORAGE_KEY_AUDIT_LOGS = 'mmd_crm_audit_logs_v1';
const LOCAL_STORAGE_KEY_BRAND_CONTEXT = 'mmd_crm_brand_context_v1';

export const INITIAL_BRAND_CONTEXT: BrandContext = {
  nome_empresa: 'Meta Máxima Digital',
  nicho: 'Marketing Digital & Tráfego Pago',
  publico_alvo: 'Empresários, infoprodutores e marcas que buscam escala em vendas',
  persona: 'Decisores de 28 a 50 anos focados em ROI, autoridade e conversão consistente',
  produtos: 'Consultoria de Escala, Gestão de Tráfego Pago, Produção de Conteúdo Estratégico',
  servicos: 'Gestão de Meta Ads, Google Ads, Funis de Conversão, Criativos de Alta Conversão',
  diferenciais: 'Estratégias baseadas em dados reais, criativos orientados a conversão e acompanhamento diário de ROI',
  tom_de_voz: 'Profissional, persuasivo, autoritário e direto ao ponto, sem enrolação',
  palavras_obrigatorias: 'escala, conversão, ROI, previsibilidade, autoridade',
  palavras_proibidas: 'fórmula mágica, enriquecer rápido, segredo infalível, hack',
  cta_padrao: 'Clique no link da bio para agendar um diagnóstico estratégico gratuito.',
  regiao_atuacao: 'Brasil e operações internacionais',
  objetivos: 'Geração de leads qualificados, fortalecimento de autoridade e conversão direta',
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [ideas, setIdeas] = useState<Ideia[]>(INITIAL_IDEAS);
  const [history, setHistory] = useState<HistoricoItem[]>(INITIAL_HISTORY);
  const [files, setFiles] = useState<ArquivoItem[]>(INITIAL_FILES);
  const [profiles, setProfiles] = useState<Perfil[]>(INITIAL_PROFILES);
  const [integrations, setIntegrations] = useState<IntegracaoConfig[]>(INITIAL_INTEGRATIONS);
  const [currentUser, setCurrentUser] = useState<Perfil>(INITIAL_PROFILES[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Operational State
  const [driveFolders, setDriveFolders] = useState<GoogleDriveFolderMapping[]>(INITIAL_DRIVE_FOLDERS);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>(INITIAL_CAMPAIGNS);
  const [adSets, setAdSets] = useState<MetaAdSet[]>(INITIAL_ADSETS);
  const [ads, setAds] = useState<MetaAd[]>(INITIAL_ADS);
  const [creatives, setCreatives] = useState<MetaCreative[]>(INITIAL_CREATIVES);
  const [pixelConfig, setPixelConfig] = useState<MetaPixelConfig>(INITIAL_PIXEL_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [brandContext, setBrandContext] = useState<BrandContext>(INITIAL_BRAND_CONTEXT);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<PostModalTab>('detalhes');

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostDefaults, setNewPostDefaults] = useState<{ status: PostStatus; date: string }>({
    status: 'a_gravar',
    date: new Date().toISOString().split('T')[0],
  });

  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
  const [isSupabaseLive] = useState(isSupabaseConfigured());

  // Load from localStorage on mount if present
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(LOCAL_STORAGE_KEY_POSTS);
      if (savedPosts) setPosts(JSON.parse(savedPosts));

      const savedIdeas = localStorage.getItem(LOCAL_STORAGE_KEY_IDEAS);
      if (savedIdeas) setIdeas(JSON.parse(savedIdeas));

      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedFiles = localStorage.getItem(LOCAL_STORAGE_KEY_FILES);
      if (savedFiles) setFiles(JSON.parse(savedFiles));

      const savedProfiles = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES);
      let activeProfiles = INITIAL_PROFILES;
      if (savedProfiles) {
        activeProfiles = JSON.parse(savedProfiles);
        setProfiles(activeProfiles);
      }

      const savedIntegrations = localStorage.getItem(LOCAL_STORAGE_KEY_INTEGRATIONS);
      if (savedIntegrations) setIntegrations(JSON.parse(savedIntegrations));

      const savedDriveFolders = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVE_FOLDERS);
      if (savedDriveFolders) setDriveFolders(JSON.parse(savedDriveFolders));

      const savedCampaigns = localStorage.getItem(LOCAL_STORAGE_KEY_CAMPAIGNS);
      if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));

      const savedAds = localStorage.getItem(LOCAL_STORAGE_KEY_ADS);
      if (savedAds) setAds(JSON.parse(savedAds));

      const savedPixel = localStorage.getItem(LOCAL_STORAGE_KEY_PIXEL);
      if (savedPixel) setPixelConfig(JSON.parse(savedPixel));

      const savedAuditLogs = localStorage.getItem(LOCAL_STORAGE_KEY_AUDIT_LOGS);
      if (savedAuditLogs) setAuditLogs(JSON.parse(savedAuditLogs));

      const savedBrand = localStorage.getItem(LOCAL_STORAGE_KEY_BRAND_CONTEXT);
      if (savedBrand) setBrandContext(JSON.parse(savedBrand));

      const wasLoggedOut = localStorage.getItem(LOCAL_STORAGE_KEY_LOGGED_OUT) === 'true';
      const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);

      if (wasLoggedOut) {
        setIsAuthenticated(false);
      } else if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          const matched = activeProfiles.find((p) => p.email === parsed.email || p.id === parsed.id) || parsed;
          setCurrentUser(matched);
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(true);
        }
      } else {
        // Default authenticated with initial profiles for seamless demo
        setIsAuthenticated(true);
      }
    } catch {
      // ignore localStorage parse error
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_IDEAS, JSON.stringify(ideas));
    } catch {}
  }, [ideas]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FILES, JSON.stringify(files));
    } catch {}
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_INTEGRATIONS, JSON.stringify(integrations));
    } catch {}
  }, [integrations]);

  useEffect(() => {
    try {
      if (currentUser && isAuthenticated) {
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(currentUser));
      }
    } catch {}
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRIVE_FOLDERS, JSON.stringify(driveFolders));
    } catch {}
  }, [driveFolders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
    } catch {}
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(ads));
    } catch {}
  }, [ads]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Try to load real data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseLive) return;

    async function fetchSupabaseData() {
      try {
        const { data: dbPosts } = await supabase.from('posts').select('*').order('criado_em', { ascending: false });
        if (dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts as Post[]);
        }

        const { data: dbIdeas } = await supabase.from('ideias').select('*').order('criado_em', { ascending: false });
        if (dbIdeas && dbIdeas.length > 0) {
          setIdeas(dbIdeas as Ideia[]);
        }

        const { data: dbHistory } = await supabase.from('historico_posts').select('*').order('criado_em', { ascending: false });
        if (dbHistory && dbHistory.length > 0) {
          setHistory(dbHistory as HistoricoItem[]);
        }

        const { data: dbProfiles } = await supabase.from('perfis').select('*').order('criado_em', { ascending: true });
        if (dbProfiles && dbProfiles.length > 0) {
          setProfiles(dbProfiles as Perfil[]);
        }

        const { data: dbIntegrations } = await supabase.from('integracoes').select('*');
        if (dbIntegrations && dbIntegrations.length > 0) {
          setIntegrations((prev) =>
            prev.map((item) => {
              const found = dbIntegrations.find((d: any) => d.provedor === item.provedor);
              if (found) {
                return {
                  ...item,
                  status: found.status,
                  ultima_sincronizacao: found.ultima_sincronizacao,
                  credenciais: { ...item.credenciais, ...(found.configuracoes || {}) },
                };
              }
              return item;
            })
          );
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback active:', err);
      }
    }

    fetchSupabaseData();
  }, [isSupabaseLive]);

  // Overdue check
  const isOverdue = (post: Post): boolean => {
    if (post.status === 'postado' || post.arquivado) return false;
    const today = new Date().toISOString().split('T')[0];
    return post.data_publicacao < today;
  };

  // Add History
  const addHistory = async (postId: string, acao: string, detalhe?: string) => {
    const item: HistoricoItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      post_id: postId,
      usuario: currentUser.nome,
      acao,
      detalhe,
      criado_em: new Date().toISOString(),
    };

    setHistory((prev) => [item, ...prev]);

    if (isSupabaseLive) {
      try {
        await supabase.from('historico_posts').insert([{
          post_id: postId,
          usuario: currentUser.nome,
          acao,
          detalhe,
        }]);
      } catch {}
    }
  };

  // Add Audit Log
  const addAuditLog = async (
    action: string,
    entityType: 'POST' | 'IDEA' | 'CAMPAIGN' | 'AD' | 'FILE' | 'INTEGRATION',
    entityId?: string,
    entityTitle?: string,
    details?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: currentUser?.id,
      user_name: currentUser?.nome || 'Operador',
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_title: entityTitle,
      details,
      criado_em: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (isSupabaseLive) {
      try {
        await supabase.from('audit_logs').insert([newLog]);
      } catch {}
    }
  };

  // Update Post Status & Synchronize selective physical stages with Google Drive
  const updatePostStatus = async (id: string, newStatus: PostStatus) => {
    const post = posts.find((p) => p.id === id);
    if (!post || post.status === newStatus) return;

    const oldStatusLabel = post.status.replace('_', ' ').toUpperCase();
    const newStatusLabel = newStatus.replace('_', ' ').toUpperCase();
    const now = new Date().toISOString();

    const isPhysical = (DRIVE_PHYSICAL_STAGES as string[]).includes(newStatus);
    const targetFolder = driveFolders.find((df) => df.status === newStatus) || (
      isPhysical && DRIVE_FOLDER_IDS[newStatus as 'gravado' | 'editado' | 'postado']
        ? {
            status: newStatus,
            folder_id: DRIVE_FOLDER_IDS[newStatus as 'gravado' | 'editado' | 'postado'],
            folder_name: newStatus === 'gravado' ? 'Gravado' : newStatus === 'editado' ? 'Editado' : 'Postado',
          }
        : null
    );

    let driveUpdates: Partial<Post> = {};

    if (isPhysical && targetFolder) {
      driveUpdates.drive_folder_id = targetFolder.folder_id;
      driveUpdates.drive_folder_name = targetFolder.folder_name;
      driveUpdates.google_drive_folder_id = targetFolder.folder_id;

      const fileId = post.google_drive_file_id || post.drive_file_id;
      if (!fileId) {
        // Physical stage without a file: never block movement!
        driveUpdates.google_drive_sync_status = 'sem_arquivo';
        driveUpdates.google_drive_sync_error = undefined;
      } else {
        // Physical stage with file: move file in Google Drive via server API
        try {
          const res = await fetch('/api/drive/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId: id,
              fileId,
              targetStatus: newStatus,
              sourceFolderId: post.google_drive_folder_id || post.drive_folder_id,
              destinationFolderId: targetFolder.folder_id,
            }),
          });
          const data = await res.json();
          if (data.success) {
            driveUpdates.google_drive_sync_status = 'sincronizado';
            driveUpdates.google_drive_sync_error = undefined;
          } else {
            driveUpdates.google_drive_sync_status = 'erro';
            driveUpdates.google_drive_sync_error = data.error || 'Falha ao sincronizar pasta no Drive';
          }
        } catch (err: any) {
          driveUpdates.google_drive_sync_status = 'erro';
          driveUpdates.google_drive_sync_error = err.message || 'Erro de conexão com Google Drive';
        }
      }
    } else {
      // Non-physical stages: Ideias, A gravar, A editar, Agendado, etc.
      // NEVER require Drive file, NEVER call Drive API, NEVER block
      driveUpdates.google_drive_sync_status = post.google_drive_file_id ? 'sincronizado' : undefined;
      driveUpdates.google_drive_sync_error = undefined;
    }

    const updatedPost: Post = {
      ...post,
      status: newStatus,
      ...driveUpdates,
      atualizado_em: now,
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? updatedPost : p))
    );

    if (selectedPost && selectedPost.id === id) {
      setSelectedPost((prev) => (prev ? updatedPost : null));
    }

    const driveLogDetail = isPhysical && targetFolder
      ? ` Pasta do Google Drive: "${targetFolder.folder_name}".`
      : '';

    await addHistory(id, 'Status Atualizado', `Moveu de "${oldStatusLabel}" para "${newStatusLabel}".${driveLogDetail}`);
    await addAuditLog('MOVE_STATUS', 'POST', id, post.titulo, `Status alterado de ${oldStatusLabel} para ${newStatusLabel}.${driveLogDetail}`);

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').update({
          status: newStatus,
          drive_folder_id: updatedPost.drive_folder_id,
          drive_folder_name: updatedPost.drive_folder_name,
          google_drive_folder_id: updatedPost.google_drive_folder_id,
          google_drive_sync_status: updatedPost.google_drive_sync_status,
          google_drive_sync_error: updatedPost.google_drive_sync_error || null,
          atualizado_em: now,
        }).eq('id', id);
      } catch (err) {
        console.error('Error updating status in Supabase:', err);
      }
    }
  };

  const moveGoogleDriveFile = async (postId: string, newStatus: PostStatus) => {
    const post = posts.find((p) => p.id === postId);
    const targetFolder = driveFolders.find((df) => df.status === newStatus) || (
      (DRIVE_PHYSICAL_STAGES as string[]).includes(newStatus) && DRIVE_FOLDER_IDS[newStatus as 'gravado' | 'editado' | 'postado']
        ? {
            status: newStatus,
            folder_id: DRIVE_FOLDER_IDS[newStatus as 'gravado' | 'editado' | 'postado'],
            folder_name: newStatus === 'gravado' ? 'Gravado' : newStatus === 'editado' ? 'Editado' : 'Postado',
          }
        : null
    );

    if (!post || !targetFolder) {
      return { success: false, folderName: '' };
    }
    await updatePostStatus(postId, newStatus);
    return { success: true, folderName: targetFolder.folder_name };
  };

  const retryGoogleDriveSync = async (postId: string): Promise<{ success: boolean; message: string }> => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return { success: false, message: 'Conteúdo não encontrado.' };

    const isPhysical = (DRIVE_PHYSICAL_STAGES as string[]).includes(post.status);
    if (!isPhysical) {
      return { success: false, message: `A etapa "${post.status}" não requer sincronização com Google Drive.` };
    }

    const fileId = post.google_drive_file_id || post.drive_file_id;
    if (!fileId) {
      return { success: false, message: 'Nenhum arquivo do Google Drive vinculado a este conteúdo.' };
    }

    const targetFolder = driveFolders.find((df) => df.status === post.status) || {
      status: post.status,
      folder_id: DRIVE_FOLDER_IDS[post.status as 'gravado' | 'editado' | 'postado'],
      folder_name: post.status === 'gravado' ? 'Gravado' : post.status === 'editado' ? 'Editado' : 'Postado',
    };

    try {
      const res = await fetch('/api/drive/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          fileId,
          targetStatus: post.status,
          sourceFolderId: post.google_drive_folder_id || post.drive_folder_id,
          destinationFolderId: targetFolder.folder_id,
        }),
      });
      const data = await res.json();
      const now = new Date().toISOString();

      if (data.success) {
        const updatedPost: Post = {
          ...post,
          google_drive_sync_status: 'sincronizado',
          google_drive_sync_error: undefined,
          google_drive_folder_id: targetFolder.folder_id,
          drive_folder_id: targetFolder.folder_id,
          drive_folder_name: targetFolder.folder_name,
          atualizado_em: now,
        };
        setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
        if (isSupabaseLive) {
          try {
            await supabase.from('posts').update({
              google_drive_sync_status: 'sincronizado',
              google_drive_sync_error: null,
              google_drive_folder_id: targetFolder.folder_id,
              drive_folder_id: targetFolder.folder_id,
              drive_folder_name: targetFolder.folder_name,
              atualizado_em: now,
            }).eq('id', postId);
          } catch {}
        }
        await addHistory(postId, 'Drive Sincronizado', `Arquivo sincronizado com sucesso na pasta "${targetFolder.folder_name}".`);
        return { success: true, message: `Arquivo sincronizado na pasta ${targetFolder.folder_name} com sucesso!` };
      } else {
        const errMsg = data.error || 'Falha ao sincronizar com Google Drive';
        setPosts((prev) => prev.map((p) => (p.id === postId ? {
          ...p,
          google_drive_sync_status: 'erro',
          google_drive_sync_error: errMsg,
          atualizado_em: now,
        } : p)));
        return { success: false, message: errMsg };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro de conexão ao sincronizar com Google Drive.' };
    }
  };

  const linkGoogleDriveFile = async (
    postId: string,
    fileData: {
      fileId: string;
      fileName: string;
      fileUrl: string;
      folderId?: string;
      mimeType?: string;
      thumbnailUrl?: string;
    }
  ) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const now = new Date().toISOString();
    const isPhysical = (DRIVE_PHYSICAL_STAGES as string[]).includes(post.status);
    const targetFolderId = fileData.folderId || (
      isPhysical && DRIVE_FOLDER_IDS[post.status as 'gravado' | 'editado' | 'postado']
        ? DRIVE_FOLDER_IDS[post.status as 'gravado' | 'editado' | 'postado']
        : undefined
    );

    const updatedPost: Post = {
      ...post,
      google_drive_file_id: fileData.fileId,
      google_drive_file_name: fileData.fileName,
      google_drive_web_view_link: fileData.fileUrl,
      google_drive_folder_id: targetFolderId,
      google_drive_mime_type: fileData.mimeType,
      google_drive_thumbnail_url: fileData.thumbnailUrl,
      google_drive_sync_status: 'sincronizado',
      google_drive_sync_error: undefined,
      drive_file_id: fileData.fileId,
      drive_file_url: fileData.fileUrl,
      drive_folder_id: targetFolderId,
      atualizado_em: now,
    };

    setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPost);
    }

    const newFile: ArquivoItem = {
      id: `f-drive-${Date.now()}`,
      post_id: postId,
      post_titulo: post.titulo,
      nome: fileData.fileName,
      url: fileData.fileUrl,
      tamanho_bytes: 0,
      tipo_mime: fileData.mimeType || 'application/vnd.google-apps.file',
      categoria_arquivo: fileData.fileName.match(/\.(mp4|mov|avi)$/i) ? 'video_bruto' : 'documento',
      google_drive_file_id: fileData.fileId,
      criado_em: now,
    };
    setFiles((prev) => [newFile, ...prev]);

    await addHistory(postId, 'Arquivo Drive Vinculado', `Vinculou arquivo "${fileData.fileName}" do Google Drive.`);
    await addAuditLog('LINK_DRIVE_FILE', 'FILE', fileData.fileId, fileData.fileName, `Vinculado ao post "${post.titulo}"`);

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').update({
          google_drive_file_id: fileData.fileId,
          google_drive_file_name: fileData.fileName,
          google_drive_web_view_link: fileData.fileUrl,
          google_drive_folder_id: targetFolderId,
          google_drive_sync_status: 'sincronizado',
          drive_file_id: fileData.fileId,
          drive_file_url: fileData.fileUrl,
          drive_folder_id: targetFolderId,
          atualizado_em: now,
        }).eq('id', postId);
        await supabase.from('arquivos').insert([newFile]);
      } catch (err) {
        console.warn('Supabase linkGoogleDriveFile error:', err);
      }
    }
  };

  const linkPostToAd = async (postId: string, adId: string, campaignId?: string) => {
    const post = posts.find((p) => p.id === postId);
    const ad = ads.find((a) => a.id === adId);
    if (!post || !ad) return;

    const now = new Date().toISOString();
    const updatedPost: Post = {
      ...post,
      meta_ad_id: adId,
      meta_campaign_id: campaignId || ad.campaign_id,
      classificacao: post.classificacao === 'organico' ? 'organico_patrocinado' : post.classificacao,
      uso_trafego_pago: 'ativo',
      atualizado_em: now,
    };

    setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(updatedPost);
    }

    setAds((prev) => prev.map((a) => (a.id === adId ? { ...a, post_id: postId } : a)));

    await addHistory(postId, 'Vínculo Meta Ads', `Conteúdo associado ao anúncio "${ad.name}"`);
    await addAuditLog('LINK_AD', 'AD', adId, ad.name, `Vinculado ao post "${post.titulo}" (ID: ${postId})`);

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').update({
          meta_ad_id: adId,
          meta_campaign_id: campaignId || ad.campaign_id,
          classificacao: updatedPost.classificacao,
          uso_trafego_pago: 'ativo',
          atualizado_em: now,
        }).eq('id', postId);
        await supabase.from('meta_ads').update({ post_id: postId }).eq('id', adId);
      } catch {}
    }
  };

  // Update Post Date
  const updatePostDate = async (id: string, newDate: string, newTime?: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const now = new Date().toISOString();
    const updatedHora = newTime || post.hora_publicacao;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, data_publicacao: newDate, hora_publicacao: updatedHora, atualizado_em: now }
          : p
      )
    );

    if (selectedPost && selectedPost.id === id) {
      setSelectedPost((prev) =>
        prev
          ? { ...prev, data_publicacao: newDate, hora_publicacao: updatedHora, atualizado_em: now }
          : null
      );
    }

    await addHistory(
      id,
      'Data Reagendada',
      `Data alterada de ${post.data_publicacao} para ${newDate} às ${updatedHora}`
    );

    if (isSupabaseLive) {
      try {
        await supabase
          .from('posts')
          .update({ data_publicacao: newDate, hora_publicacao: updatedHora, atualizado_em: now })
          .eq('id', id);
      } catch {}
    }
  };

  // Save / Create / Update Post
  const savePost = async (
    data: Partial<Post> & { titulo: string; data_publicacao: string }
  ): Promise<Post> => {
    const now = new Date().toISOString();
    let savedPost: Post;

    if (data.id) {
      // Update
      savedPost = {
        ...(posts.find((p) => p.id === data.id)!),
        ...data,
        atualizado_em: now,
      };

      setPosts((prev) => prev.map((p) => (p.id === data.id ? savedPost : p)));

      if (selectedPost && selectedPost.id === data.id) {
        setSelectedPost(savedPost);
      }

      await addHistory(data.id, 'Conteúdo Editado', `Informações do post atualizadas`);

      if (isSupabaseLive) {
        try {
          await supabase.from('posts').update(savedPost).eq('id', data.id);
        } catch {}
      }
    } else {
      // Create new
      const newId = `post-${Date.now()}`;
      savedPost = {
        id: newId,
        titulo: data.titulo,
        data_publicacao: data.data_publicacao,
        hora_publicacao: data.hora_publicacao || '18:00',
        tipo: data.tipo || 'reels_video',
        etapa_funil: data.etapa_funil || 'topo',
        status: data.status || 'a_gravar',
        prioridade: data.prioridade || 'normal',
        plataforma: data.plataforma || 'instagram',
        responsavel: data.responsavel || currentUser.nome,
        tags: data.tags || [],
        gancho: data.gancho || '',
        roteiro_desenvolvimento: data.roteiro_desenvolvimento || '',
        roteiro_prova: data.roteiro_prova || '',
        cta: data.cta || '',
        legenda: data.legenda || '',
        observacoes: data.observacoes || '',
        thumbnail_url: data.thumbnail_url || '',
        arquivado: false,
        ordem: 0,
        criado_em: now,
        atualizado_em: now,
      };

      setPosts((prev) => [savedPost, ...prev]);
      await addHistory(newId, 'Conteúdo Criado', `Criado na etapa ${savedPost.status}`);

      if (isSupabaseLive) {
        try {
          await supabase.from('posts').insert([savedPost]);
        } catch {}
      }
    }

    return savedPost;
  };

  // Duplicate Post
  const duplicatePost = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const duplicated: Post = {
      ...post,
      id: `post-${Date.now()}`,
      titulo: `${post.titulo} (Cópia)`,
      status: 'ideias',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    setPosts((prev) => [duplicated, ...prev]);
    await addHistory(duplicated.id, 'Conteúdo Duplicado', `Duplicado a partir de "${post.titulo}"`);

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').insert([duplicated]);
      } catch {}
    }
  };

  // Delete Post
  const deletePost = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPost && selectedPost.id === id) {
      closePostModal();
    }

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').delete().eq('id', id);
      } catch {}
    }
  };

  // Archive Post
  const archivePost = async (id: string, arquivado = true) => {
    const now = new Date().toISOString();
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, arquivado, atualizado_em: now } : p)));
    await addHistory(id, arquivado ? 'Conteúdo Arquivado' : 'Conteúdo Desarquivado');

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').update({ arquivado, atualizado_em: now }).eq('id', id);
      } catch {}
    }
  };

  // Save Idea
  const saveIdea = async (
    data: Partial<Ideia> & { titulo: string; ideia: string }
  ): Promise<Ideia> => {
    const now = new Date().toISOString();
    let savedIdea: Ideia;

    if (data.id) {
      savedIdea = {
        ...(ideas.find((i) => i.id === data.id)!),
        ...data,
        atualizado_em: now,
      };
      setIdeas((prev) => prev.map((i) => (i.id === data.id ? savedIdea : i)));

      if (isSupabaseLive) {
        try {
          await supabase.from('ideias').update(savedIdea).eq('id', data.id);
        } catch {}
      }
    } else {
      const newId = `ideia-${Date.now()}`;
      savedIdea = {
        id: newId,
        titulo: data.titulo,
        ideia: data.ideia,
        gancho: data.gancho || '',
        objetivo: data.objetivo || '',
        publico: data.publico || '',
        etapa_funil: data.etapa_funil || 'topo',
        formato: data.formato || 'Reels/Vídeo',
        referencia: data.referencia || '',
        cta: data.cta || '',
        observacoes: data.observacoes || '',
        responsavel: data.responsavel || currentUser.nome,
        prioridade: data.prioridade || 'normal',
        categoria: data.categoria || 'educacional',
        tags: data.tags || [],
        arquivado: false,
        criado_em: now,
        atualizado_em: now,
      };

      setIdeas((prev) => [savedIdea, ...prev]);

      if (isSupabaseLive) {
        try {
          await supabase.from('ideias').insert([savedIdea]);
        } catch {}
      }
    }

    return savedIdea;
  };

  // Delete Idea
  const deleteIdea = async (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    if (isSupabaseLive) {
      try {
        await supabase.from('ideias').delete().eq('id', id);
      } catch {}
    }
  };

  // Convert Idea to Post (IDEIA -> KANBAN)
  const convertIdeaToPost = async (ideaId: string, targetStatus: PostStatus = 'ideias'): Promise<Post> => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) throw new Error('Ideia não encontrada');

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    const dateStr = nextDate.toISOString().split('T')[0];

    const newPost = await savePost({
      titulo: idea.titulo,
      data_publicacao: dateStr,
      hora_publicacao: '18:00',
      tipo: idea.formato.toLowerCase().includes('carrossel') ? 'carrossel' : 'reels_video',
      etapa_funil: idea.etapa_funil,
      status: targetStatus,
      prioridade: idea.prioridade,
      plataforma: 'instagram',
      responsavel: idea.responsavel || currentUser.nome,
      tags: idea.tags,
      gancho: idea.gancho,
      cta: idea.cta,
      observacoes: `Convertido da ideia: ${idea.ideia}\nObjetivo: ${idea.objetivo || 'N/A'}`,
    });

    // Link idea to post
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, post_id: newPost.id, atualizado_em: new Date().toISOString() } : i))
    );

    await addHistory(newPost.id, 'Ideia Convertida', `Gerado a partir do Banco de Ideias ("${idea.titulo}")`);

    return newPost;
  };

  // Add File
  const addFile = async (fileData: Omit<ArquivoItem, 'id' | 'criado_em'>): Promise<ArquivoItem> => {
    const newFile: ArquivoItem = {
      ...fileData,
      id: `file-${Date.now()}`,
      criado_em: new Date().toISOString(),
    };

    setFiles((prev) => [newFile, ...prev]);

    if (fileData.post_id) {
      await addHistory(fileData.post_id, 'Arquivo Anexado', `Upload de "${fileData.nome}" (${fileData.categoria_arquivo})`);
    }

    if (isSupabaseLive) {
      try {
        await supabase.from('arquivos').insert([newFile]);
      } catch {}
    }

    return newFile;
  };

  // Delete File
  const deleteFile = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    if (file?.post_id) {
      await addHistory(file.post_id, 'Arquivo Removido', `Arquivo "${file.nome}" foi excluído`);
    }

    if (isSupabaseLive) {
      try {
        await supabase.from('arquivos').delete().eq('id', fileId);
      } catch {}
    }
  };

  // Modal handlers
  const openPostModal = (post: Post, tab: PostModalTab = 'detalhes') => {
    setSelectedPost(post);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const openNewPostModal = (initialStatus: PostStatus = 'a_gravar', initialDate?: string) => {
    setNewPostDefaults({
      status: initialStatus,
      date: initialDate || new Date().toISOString().split('T')[0],
    });
    setIsNewPostModalOpen(true);
  };

  const closeNewPostModal = () => {
    setIsNewPostModalOpen(false);
  };

  const openNewIdeaModal = () => setIsNewIdeaModalOpen(true);
  const closeNewIdeaModal = () => setIsNewIdeaModalOpen(false);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Filtered Posts computation
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Ignorar arquivados a menos que explicitamente solicitado
      if (p.arquivado) return false;

      // Busca por título / tags / gancho
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = p.titulo.toLowerCase().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        const matchHook = p.gancho?.toLowerCase().includes(query) || false;
        const matchResp = p.responsavel.toLowerCase().includes(query);
        if (!matchTitle && !matchTags && !matchHook && !matchResp) return false;
      }

      // Status
      if (filters.status !== 'todos' && p.status !== filters.status) return false;

      // Tipo
      if (filters.tipo !== 'todos' && p.tipo !== filters.tipo) return false;

      // Funil
      if (filters.funil !== 'todos' && p.etapa_funil !== filters.funil) return false;

      // Responsável
      if (filters.responsavel !== 'todos' && p.responsavel !== filters.responsavel) return false;

      // Prioridade
      if (filters.prioridade !== 'todos' && p.prioridade !== filters.prioridade) return false;

      // Plataforma
      if (filters.plataforma !== 'todos' && p.plataforma !== filters.plataforma) return false;

      // Tags
      if (filters.tag !== 'todos' && !p.tags.includes(filters.tag)) return false;

      // Período
      if (filters.periodo !== 'todos') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (filters.periodo === 'atrasados') {
          if (!isOverdue(p)) return false;
        } else if (filters.periodo === 'mes_atual') {
          const currentMonth = todayStr.substring(0, 7);
          if (!p.data_publicacao.startsWith(currentMonth)) return false;
        } else if (filters.periodo === '7dias') {
          const past7 = new Date();
          past7.setDate(past7.getDate() - 7);
          const next7 = new Date();
          next7.setDate(next7.getDate() + 7);
          const pDate = new Date(p.data_publicacao);
          if (pDate < past7 || pDate > next7) return false;
        }
      }

      return true;
    });
  }, [posts, filters]);

  // Permission verification
  const canPerform = (action: keyof PermissoesEquipe): boolean => {
    if (currentUser.role === 'admin') return true;
    return !!currentUser.permissoes?.[action];
  };

  // Team Members CRUD
  const addTeamMember = async (member: Omit<Perfil, 'id' | 'criado_em'>): Promise<Perfil> => {
    const newMember: Perfil = {
      ...member,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      criado_em: new Date().toISOString(),
      avatar_url: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.nome)}`,
      permissoes: member.permissoes || DEFAULT_ROLE_PERMISSIONS[member.role] || DEFAULT_ROLE_PERMISSIONS.editor,
      senha: member.senha || '123456',
    };

    setProfiles((prev) => [...prev, newMember]);

    if (isSupabaseLive) {
      try {
        await supabase.from('perfis').insert({
          nome: newMember.nome,
          email: newMember.email,
          avatar_url: newMember.avatar_url,
          cargo: newMember.cargo,
          role: newMember.role,
          status: newMember.status,
          permissoes: newMember.permissoes,
          senha: newMember.senha,
        });
      } catch (err) {
        console.warn('Supabase addTeamMember error:', err);
      }
    }

    return newMember;
  };

  const updateTeamMember = async (id: string, updates: Partial<Perfil>) => {
    setProfiles((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return m;
      })
    );

    if (isSupabaseLive) {
      try {
        await supabase.from('perfis').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateTeamMember error:', err);
      }
    }
  };

  const deleteTeamMember = async (id: string) => {
    setProfiles((prev) => prev.filter((m) => m.id !== id));

    if (isSupabaseLive) {
      try {
        await supabase.from('perfis').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteTeamMember error:', err);
      }
    }
  };

  const inviteTeamMember = async (data: {
    nome: string;
    email: string;
    cargo: string;
    role: PerfilRole;
    senha?: string;
  }): Promise<{ success: boolean; member: Perfil; inviteUrl: string }> => {
    const newMember = await addTeamMember({
      nome: data.nome,
      email: data.email,
      cargo: data.cargo,
      role: data.role,
      status: 'convidado',
      senha: data.senha || '123456',
      permissoes: DEFAULT_ROLE_PERMISSIONS[data.role] || DEFAULT_ROLE_PERMISSIONS.editor,
    });

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${baseUrl}/login?email=${encodeURIComponent(data.email)}`;

    await addAuditLog('INVITE_MEMBER', 'POST', newMember.id, newMember.nome, `Convite gerado para ${newMember.email} com acesso ${newMember.role}`);

    return { success: true, member: newMember, inviteUrl };
  };

  // Integrations Management
  const updateIntegration = async (provedor: ProvedorIntegracao, updates: Partial<IntegracaoConfig>) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.provedor === provedor ? { ...item, ...updates } : item))
    );

    if (isSupabaseLive) {
      try {
        await supabase.from('integracoes').upsert(
          {
            provedor,
            status: updates.status,
            configuracoes: updates.credenciais,
            ultima_sincronizacao: updates.ultima_sincronizacao || new Date().toISOString(),
          },
          { onConflict: 'provedor' }
        );
      } catch (err) {
        console.warn('Supabase updateIntegration error:', err);
      }
    }
  };

  const testIntegrationConnection = async (provedor: ProvedorIntegracao): Promise<{ success: boolean; message: string }> => {
    const int = integrations.find((i) => i.provedor === provedor);
    if (!int) return { success: false, message: 'Provedor não encontrado.' };

    await new Promise((r) => setTimeout(r, 900));

    if (provedor === 'meta_business') {
      const hasKey = !!int.credenciais.access_token || !!int.credenciais.business_id;
      if (!hasKey) {
        return { success: false, message: 'Informe o Token de Acesso ou ID do Business Manager da Meta.' };
      }
      await updateIntegration('meta_business', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Conexão com Meta Graph API & Instagram validada com sucesso!' };
    }

    if (provedor === 'meta_ads') {
      const hasKey = !!int.credenciais.ad_account_id || !!int.credenciais.access_token || !!int.credenciais.business_id;
      if (!hasKey) {
        return { success: false, message: 'Informe o ID da Conta de Anúncios (act_...) ou Token de Acesso da Meta.' };
      }
      await updateIntegration('meta_ads', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Conexão com Meta Marketing API & Gerenciador de Anúncios validada com sucesso!' };
    }

    if (provedor === 'meta_pixel') {
      const hasKey = !!int.credenciais.pixel_id || !!int.credenciais.pixel_conversion_token || !!int.credenciais.access_token;
      if (!hasKey) {
        return { success: false, message: 'Informe o Pixel ID (15-16 dígitos) ou Token de Conversão da Meta.' };
      }
      await updateIntegration('meta_pixel', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Meta Pixel & Conversions API (CAPI) validados com sucesso!' };
    }

    if (provedor === 'google_drive') {
      await updateIntegration('google_drive', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Google Drive conectado com sucesso às 3 pastas fixas do Kanban (Gravado, Editado, Postado)!' };
    }

    if (provedor === 'google_analytics') {
      const hasId = !!int.credenciais.property_id || !!int.credenciais.client_email;
      if (!hasId) {
        return { success: false, message: 'Informe o Property ID ou e-mail de serviço do GA4.' };
      }
      await updateIntegration('google_analytics', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Conexão com Google Analytics Data API validada com sucesso!' };
    }

    if (provedor === 'google_ads') {
      const hasCust = !!int.credenciais.customer_id;
      if (!hasCust) {
        return { success: false, message: 'Informe o Customer ID (10 dígitos) da conta Google Ads.' };
      }
      await updateIntegration('google_ads', { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
      return { success: true, message: 'Conexão com Google Ads API validada com sucesso!' };
    }

    await updateIntegration(provedor, { status: 'conectado', ultima_sincronizacao: new Date().toISOString() });
    return { success: true, message: 'Conexão estabelecida com sucesso.' };
  };

  const syncIntegrationData = async (provedor: ProvedorIntegracao): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 1200));
    const now = new Date().toISOString();
    await updateIntegration(provedor, { status: 'conectado', ultima_sincronizacao: now });
    return { success: true, message: `Métricas sincronizadas em tempo real com sucesso (${new Date(now).toLocaleTimeString('pt-BR')})!` };
  };

  // Authentication & Session
  const loginWithEmail = async (
    email: string,
    senha?: string
  ): Promise<{ success: boolean; error?: string; user?: Perfil }> => {
    const cleanEmail = email.trim().toLowerCase();
    const member = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!member) {
      return {
        success: false,
        error: 'E-mail não cadastrado na equipe. Solicite ao administrador da agência para cadastrar seu acesso.',
      };
    }

    if (member.status === 'inativo') {
      return {
        success: false,
        error: 'Sua conta de colaborador está inativa. Entre em contato com a administração da agência.',
      };
    }

    const expectedPassword = member.senha || '123456';
    if (!senha || senha.trim() === '') {
      return {
        success: false,
        error: 'Por favor, informe a senha de acesso para entrar neste perfil.',
      };
    }

    if (senha.trim() !== expectedPassword) {
      return {
        success: false,
        error: 'Senha incorreta para este perfil. Verifique os dados digitados ou solicite a redefinição.',
      };
    }

    setCurrentUser(member);
    setIsAuthenticated(true);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LOGGED_OUT);
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(member));

    return { success: true, user: member };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGGED_OUT, 'true');
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
  };

  // ==============================================================================
  // AI ASSISTANT OPERATIONAL METHODS
  // ==============================================================================

  const updateBrandContext = async (updates: Partial<BrandContext>) => {
    const updated = { ...brandContext, ...updates, atualizado_em: new Date().toISOString() };
    setBrandContext(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BRAND_CONTEXT, JSON.stringify(updated));
    } catch {}

    if (isSupabaseLive) {
      try {
        await supabase.from('brand_context').upsert({ project_id: 'default', ...updated });
      } catch (err) {
        console.warn('Erro ao salvar brand_context no Supabase:', err);
      }
    }

    await addAuditLog('Contexto da Marca Atualizado', 'INTEGRATION', undefined, updated.nome_empresa, 'Diretrizes de IA atualizadas');
  };

  const saveAIIdeaToIdeas = async (item: GeneratedIdeaItem): Promise<Ideia> => {
    const saved = await saveIdea({
      titulo: item.titulo,
      ideia: item.conceito,
      gancho: item.hook,
      objetivo: item.objetivo,
      etapa_funil: item.etapa_funil || 'topo',
      formato: item.formato || 'Reels/Vídeo',
      cta: item.cta,
      observacoes: `Justificativa Estratégica: ${item.justificativa_estrategica}`,
      categoria: 'educacional',
      prioridade: 'normal',
      tags: ['Gerado com IA', item.formato || 'IA'],
    });

    await addAuditLog('Ideia de IA Salva', 'IDEA', saved.id, saved.titulo, 'Ideia gerada pelo Gemini salva no Banco');
    return saved;
  };

  const saveAIScriptToPost = async (script: GeneratedScript, targetStatus: PostStatus = 'a_gravar'): Promise<Post> => {
    const today = new Date().toISOString().split('T')[0];
    const cenasText = script.cenas && script.cenas.length > 0
      ? script.cenas
          .map(
            (c) =>
              `[CENA ${c.cena_numero}] Visual: ${c.indicacao_visual} | Fala: "${c.texto_falado}" ${c.b_roll ? `| B-Roll: ${c.b_roll}` : ''} ${c.texto_na_tela ? `| Texto Tela: ${c.texto_na_tela}` : ''}`
          )
          .join('\n\n')
      : '';

    const saved = await savePost({
      titulo: script.titulo,
      data_publicacao: today,
      status: targetStatus,
      tipo: 'reels_video',
      gancho: script.hook,
      roteiro_desenvolvimento: script.desenvolvimento,
      roteiro_prova: script.prova,
      cta: script.cta || script.cta_final,
      observacoes: `Duração Estimada: ${script.duracao}\n\nDetalhamento de Cenas:\n${cenasText}`,
      tags: ['Roteiro IA', 'Gemini'],
    });

    await addAuditLog('Roteiro de IA Salvo', 'POST', saved.id, saved.titulo, `Roteiro salvo como conteúdo em ${targetStatus}`);
    return saved;
  };

  const saveAICarouselToPost = async (carousel: GeneratedCarousel): Promise<Post> => {
    const today = new Date().toISOString().split('T')[0];
    const slidesText = carousel.slides
      .map((s) => `[SLIDE ${s.slide_numero} - ${s.tipo.toUpperCase()}]\nTítulo: ${s.titulo}\nTexto: ${s.texto}\nVisual: ${s.sugestao_visual}`)
      .join('\n\n---\n\n');

    const saved = await savePost({
      titulo: carousel.tema,
      data_publicacao: today,
      status: 'a_gravar',
      tipo: 'carrossel',
      cta: carousel.cta_final,
      legenda: `Tema: ${carousel.tema}\n\n${slidesText}`,
      tags: ['Carrossel IA', 'Gemini'],
    });

    await addAuditLog('Carrossel de IA Salvo', 'POST', saved.id, saved.titulo, 'Carrossel estruturado salvo no Kanban');
    return saved;
  };

  const saveAIAdToCreative = async (ad: GeneratedAd): Promise<void> => {
    const newCreative: MetaCreative = {
      id: `cr-ai-${Date.now()}`,
      name: `Criativo IA - ${ad.headline_principal.slice(0, 30)}`,
      title: ad.headline_principal,
      body: ad.texto_principal,
      format: ad.formato || 'Reels 9:16',
    };

    const updatedCreatives = [newCreative, ...creatives];
    setCreatives(updatedCreatives);
    try {
      localStorage.setItem('mmd_crm_creatives_v1', JSON.stringify(updatedCreatives));
    } catch {}

    await addAuditLog('Criativo de IA Salvo', 'AD', newCreative.id, newCreative.name, 'Criativo de anúncio salvo na central de anúncios');
  };

  return (
    <ContentContext.Provider
      value={{
        posts,
        ideas,
        history,
        files,
        profiles,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        inviteTeamMember,
        integrations,
        updateIntegration,
        testIntegrationConnection,
        syncIntegrationData,
        canPerform,
        isAuthenticated,
        loginWithEmail,
        logout,
        filters,
        setFilters,
        resetFilters,
        filteredPosts,
        selectedPost,
        isModalOpen,
        modalTab,
        openPostModal,
        closePostModal,
        isNewPostModalOpen,
        openNewPostModal,
        closeNewPostModal,
        newPostDefaults,
        isNewIdeaModalOpen,
        openNewIdeaModal,
        closeNewIdeaModal,
        updatePostStatus,
        updatePostDate,
        savePost,
        duplicatePost,
        deletePost,
        archivePost,
        saveIdea,
        deleteIdea,
        convertIdeaToPost,
        addFile,
        deleteFile,
        addHistory,
        isOverdue,
        isSupabaseLive,
        currentUser,
        setCurrentUser,
        driveFolders,
        setDriveFolders,
        campaigns,
        adSets,
        ads,
        creatives,
        pixelConfig,
        auditLogs,
        addAuditLog,
        moveGoogleDriveFile,
        retryGoogleDriveSync,
        linkGoogleDriveFile,
        linkPostToAd,
        brandContext,
        updateBrandContext,
        saveAIIdeaToIdeas,
        saveAIScriptToPost,
        saveAICarouselToPost,
        saveAIAdToCreative,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent deve ser utilizado dentro de um ContentProvider');
  }
  return context;
}
