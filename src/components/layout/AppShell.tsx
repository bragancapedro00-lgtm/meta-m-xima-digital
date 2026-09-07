'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContent } from '@/lib/context/ContentContext';
import ContentModal from '@/components/content/ContentModal';
import NewPostModal from '@/components/content/NewPostModal';
import NewIdeaModal from '@/components/planning/NewIdeaModal';
import SwitchProfileModal from '@/components/auth/SwitchProfileModal';
import MemberModal from '@/components/settings/MemberModal';
import { Perfil } from '@/types';
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Lightbulb,
  ListOrdered,
  TrendingUp,
  FileSpreadsheet,
  FolderArchive,
  Settings,
  Plus,
  AlertCircle,
  Database,
  Menu,
  X,
  ChevronDown,
  LogOut,
  UserCog,
  ShieldAlert,
  Megaphone,
  Sparkles,
  Radio,
  BarChart3,
  History,
  Bot,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/icons/BrandIcons';

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'VISÃO GERAL',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Assistente de IA', href: '/ia', icon: Bot },
    ],
  },
  {
    label: 'CONTEÚDO & OPERAÇÃO',
    items: [
      { name: 'Kanban de Produção', href: '/kanban', icon: KanbanSquare },
      { name: 'Calendário Editorial', href: '/calendario', icon: Calendar },
      { name: 'Todos os Conteúdos', href: '/conteudos', icon: ListOrdered },
      { name: 'Banco de Ideias', href: '/planejamento', icon: Lightbulb },
      { name: 'Arquivos & Drive', href: '/arquivos', icon: FolderArchive },
    ],
  },
  {
    label: 'TRÁFEGO PAGO & META ADS',
    items: [
      { name: 'Meta Ads Manager', href: '/marketing/meta-ads', icon: Megaphone },
      { name: 'Conteúdos Patrocinados', href: '/marketing/patrocinados', icon: Sparkles },
      { name: 'Meta Pixel & Sinais', href: '/marketing/pixel', icon: Radio },
      { name: 'Performance de Criativos', href: '/marketing/performance', icon: BarChart3 },
      { name: 'Relatórios de Impacto', href: '/relatorios', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'CANAIS & ANALYTICS',
    items: [
      { name: 'Instagram Insights', href: '/instagram', icon: InstagramIcon },
      { name: 'Facebook Page', href: '/analytics/facebook', icon: FacebookIcon },
      { name: 'Google Analytics 4', href: '/analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'GOVERNANÇA',
    items: [
      { name: 'Histórico & Auditoria', href: '/historico', icon: History },
      { name: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    openNewPostModal,
    openNewIdeaModal,
    posts,
    isOverdue,
    isSupabaseLive,
    currentUser,
    setCurrentUser,
    updateTeamMember,
    profiles,
    isAuthenticated,
    logout,
  } = useContent();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switchTarget, setSwitchTarget] = useState<Perfil | null>(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleInitiateSwitch = (target: Perfil) => {
    if (target.id === currentUser.id) {
      setProfileDropdownOpen(false);
      return;
    }
    setSwitchTarget(target);
    setIsSwitchModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleConfirmSwitch = (target: Perfil) => {
    setCurrentUser(target);
    try {
      localStorage.setItem('mmd_crm_session_v1', JSON.stringify(target));
      localStorage.removeItem('mmd_crm_logged_out_v1');
    } catch {}
  };

  const handleSaveOwnProfile = async (
    memberData: Omit<Perfil, 'id' | 'criado_em'>,
    id?: string
  ) => {
    await updateTeamMember(id || currentUser.id, memberData);
    setIsEditProfileOpen(false);
  };

  // Authentication guard: if user is not authenticated and not on /login, redirect to /login
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // If we are on the login page, render only the login screen without the dashboard shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Count overdue items
  const overdueCount = posts.filter(isOverdue).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (FIXED, 260px) */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md select-none shrink-0 z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 border border-indigo-400/30 text-white font-bold text-base">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              META MÁXIMA
              <span className="text-[10px] uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-1 rounded border border-indigo-500/20">
                PRO
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">Content CRM & Ops</span>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2">
          <button
            onClick={() => openNewPostModal('a_gravar')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 px-3 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            + Novo Conteúdo
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 font-semibold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {/* Overdue alert pill next to Kanban */}
                    {item.href === '/kanban' && overdueCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                        <AlertCircle className="h-3 w-3" />
                        {overdueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Supabase status indicator */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseLive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-blue-400'
              }`}
            />
            <span className="text-slate-400 font-medium">
              {isSupabaseLive ? 'Supabase Live' : 'Modo Local Ativo'}
            </span>
          </div>
          <Database className="h-3.5 w-3.5 text-slate-500" />
        </div>

        {/* User Profile Footer with team switcher */}
        <div className="relative p-3 border-t border-slate-800/80 bg-slate-950/60">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex w-full items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.nome}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUser.cargo}</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Profile Switcher Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-30 space-y-1">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Trocar de Conta</span>
                <span className="text-[9px] text-indigo-400 font-normal lowercase">(exige senha)</span>
              </div>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleInitiateSwitch(p)}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    currentUser.id === p.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={p.avatar_url} alt={p.nome} className="h-5 w-5 rounded-full object-cover shrink-0" />
                    <span className="truncate">{p.nome}</span>
                  </div>
                  {currentUser.id === p.id && (
                    <span className="text-[10px] text-indigo-400 font-bold ml-1">Ativo</span>
                  )}
                </button>
              ))}

              <div className="pt-1 mt-1 border-t border-slate-800 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                >
                  <UserCog className="h-3.5 w-3.5" />
                  <span>Editar Meu Perfil / Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">
              M
            </div>
            <span className="text-xs font-bold text-white tracking-wider">META MÁXIMA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openNewPostModal('a_gravar')}
              className="rounded bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              + Post
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Collapsible Full Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[53px] bottom-14 z-40 bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto border-b border-slate-800">
            <nav className="space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.href === '/kanban' && overdueCount > 0 && (
                          <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                            {overdueCount} atrasados
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-slate-800 space-y-3">
                {/* Current User in Mobile Drawer */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.nome}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-200 truncate">{currentUser.nome}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUser.cargo}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditProfileOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
                  >
                    Editar Foto
                  </button>
                </div>

                {/* Team Switcher in Mobile Drawer */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                    <span>Alternar Perfil</span>
                    <span className="text-indigo-400 lowercase font-normal">(exige senha)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleInitiateSwitch(p)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors border ${
                          currentUser.id === p.id
                            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <img src={p.avatar_url} alt={p.nome} className="h-5 w-5 rounded-full object-cover shrink-0" />
                        <span className="truncate">{p.nome.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    router.push('/login');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Content Children (Scrollable Viewport) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#090d16] flex flex-col">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (4 primary quick links with 44px touch targets) */}
        <nav
          aria-label="Navegação rápida mobile"
          className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950 px-2 py-1 shrink-0 z-30"
        >
          <Link
            href="/"
            aria-label="Ir para o Início"
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 p-1 text-[10px] font-medium ${
              pathname === '/' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Início</span>
          </Link>

          <Link
            href="/kanban"
            aria-label="Ir para o Kanban"
            className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 p-1 text-[10px] font-medium ${
              pathname === '/kanban' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KanbanSquare className="h-4 w-4" />
            <span>Kanban</span>
            {overdueCount > 0 && (
              <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </Link>

          <Link
            href="/calendario"
            aria-label="Ir para o Calendário"
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 p-1 text-[10px] font-medium ${
              pathname === '/calendario' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Agenda</span>
          </Link>

          <Link
            href="/planejamento"
            aria-label="Ir para o Planejamento e Ideias"
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 p-1 text-[10px] font-medium ${
              pathname === '/planejamento' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Ideias</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu completo"
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 p-1 text-[10px] font-medium ${
              mobileMenuOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="h-4 w-4" />
            <span>Mais</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      <ContentModal />
      <NewPostModal />
      <NewIdeaModal />
      <SwitchProfileModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        currentUser={currentUser}
        targetUser={switchTarget}
        onConfirmSwitch={handleConfirmSwitch}
      />
      <MemberModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveOwnProfile}
        memberToEdit={currentUser}
      />
    </div>
  );
}
