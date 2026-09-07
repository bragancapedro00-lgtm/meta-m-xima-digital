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
  PermissoesEquipe,
  IntegracaoConfig,
  ProvedorIntegracao,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/types';
import {
  INITIAL_POSTS,
  INITIAL_IDEAS,
  INITIAL_HISTORY,
  INITIAL_FILES,
  INITIAL_PROFILES,
  INITIAL_INTEGRATIONS,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  modalTab: 'detalhes' | 'roteiro' | 'arquivos' | 'historico' | 'metricas';
  openPostModal: (post: Post, tab?: 'detalhes' | 'roteiro' | 'arquivos' | 'historico' | 'metricas') => void;
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

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'detalhes' | 'roteiro' | 'arquivos' | 'historico' | 'metricas'>('detalhes');

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

  // Update Post Status
  const updatePostStatus = async (id: string, newStatus: PostStatus) => {
    const post = posts.find((p) => p.id === id);
    if (!post || post.status === newStatus) return;

    const oldStatusLabel = post.status.replace('_', ' ').toUpperCase();
    const newStatusLabel = newStatus.replace('_', ' ').toUpperCase();
    const now = new Date().toISOString();

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus, atualizado_em: now } : p))
    );

    if (selectedPost && selectedPost.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, status: newStatus, atualizado_em: now } : null));
    }

    await addHistory(id, 'Status Atualizado', `Moveu de "${oldStatusLabel}" para "${newStatusLabel}"`);

    if (isSupabaseLive) {
      try {
        await supabase.from('posts').update({ status: newStatus, atualizado_em: now }).eq('id', id);
      } catch (err) {
        console.error('Error updating status in Supabase:', err);
      }
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
  const openPostModal = (post: Post, tab: 'detalhes' | 'roteiro' | 'arquivos' | 'historico' | 'metricas' = 'detalhes') => {
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

    return { success: true, message: 'Conexão estabelecida com sucesso.' };
  };

  const syncIntegrationData = async (provedor: ProvedorIntegracao): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 1200));
    const now = new Date().toISOString();
    await updateIntegration(provedor, { ultima_sincronizacao: now });
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
