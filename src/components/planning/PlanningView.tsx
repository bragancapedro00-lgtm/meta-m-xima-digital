'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Ideia, CategoriaIdeia } from '@/types';
import {
  Lightbulb,
  Plus,
  ArrowRight,
  Search,
  Tag,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Video,
  Smile,
  Flame,
  Building2,
  Target,
} from 'lucide-react';

const CATEGORIAS: { id: CategoriaIdeia | 'todas'; label: string; icon: any }[] = [
  { id: 'todas', label: 'Todas as Categorias', icon: Lightbulb },
  { id: 'educacional', label: 'Educacional', icon: BookOpen },
  { id: 'autoridade', label: 'Autoridade', icon: ShieldCheck },
  { id: 'bastidores', label: 'Bastidores', icon: Video },
  { id: 'prova_social', label: 'Prova Social', icon: Sparkles },
  { id: 'oferta', label: 'Oferta', icon: Target },
  { id: 'entretenimento', label: 'Entretenimento', icon: Smile },
  { id: 'tendencia', label: 'Tendência', icon: Flame },
  { id: 'institucional', label: 'Institucional', icon: Building2 },
];

export default function PlanningView() {
  const { ideas, convertIdeaToPost, deleteIdea, openNewIdeaModal } = useContent();

  const [selectedCategory, setSelectedCategory] = useState<CategoriaIdeia | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((item) => {
      if (item.arquivado) return false;
      if (selectedCategory !== 'todas' && item.categoria !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.titulo.toLowerCase().includes(q);
        const matchIdea = item.ideia.toLowerCase().includes(q);
        const matchHook = item.gancho?.toLowerCase().includes(q);
        if (!matchTitle && !matchIdea && !matchHook) return false;
      }
      return true;
    });
  }, [ideas, selectedCategory, searchQuery]);

  const handleConvert = async (ideaId: string) => {
    setConvertingId(ideaId);
    try {
      await convertIdeaToPost(ideaId, 'ideias');
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Top Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Estratégia & Ideação
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-violet-400" />
            Planejamento & Banco de Ideias
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conceba ganchos, temas e formatos estratégicos e transforme em cards do Kanban com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar ideias..."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={openNewIdeaModal}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Ideia</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 overflow-x-auto shrink-0">
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600 text-white font-semibold shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ideas Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <Lightbulb className="h-10 w-10 text-slate-600 mb-3" />
            <h4 className="text-base font-semibold text-slate-300">Nenhuma ideia encontrada</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Cadastre ganchos e ideias estratégicas para abastecer a esteira de conteúdo da agência.
            </p>
            <button
              onClick={openNewIdeaModal}
              className="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              + Criar Primeira Ideia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredIdeas.map((idea) => {
              const isConverted = Boolean(idea.post_id);

              return (
                <div
                  key={idea.id}
                  className="flex flex-col rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 shadow-sm transition-all relative group"
                >
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                      {idea.categoria}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {idea.etapa_funil}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {idea.formato}
                      </span>
                    </div>
                  </div>

                  {/* Title & Idea description */}
                  <h3 className="text-base font-bold text-slate-100 leading-snug mb-2">
                    {idea.titulo}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {idea.ideia}
                  </p>

                  {/* Gancho / Hook Box */}
                  {idea.gancho && (
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 mb-3 text-xs">
                      <span className="block font-bold text-amber-400 text-[10px] uppercase tracking-wider mb-1">
                        ⚡ Gancho Proposto:
                      </span>
                      <p className="italic text-slate-300">&ldquo;{idea.gancho}&rdquo;</p>
                    </div>
                  )}

                  {/* CTA if present */}
                  {idea.cta && (
                    <div className="text-[11px] text-emerald-400 font-medium mb-3 flex items-center gap-1.5">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">CTA:</span>
                      {idea.cta}
                    </div>
                  )}

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {idea.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer with Action */}
                  <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Resp: <strong className="text-slate-200">{idea.responsavel?.split(' ')[0]}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Excluir esta ideia?')) deleteIdea(idea.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Excluir Ideia"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {isConverted ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          No Kanban
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvert(idea.id)}
                          disabled={convertingId === idea.id}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 text-xs font-semibold rounded-md shadow transition-all active:scale-95 disabled:opacity-50"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          {convertingId === idea.id ? 'Convertendo...' : 'Transformar em Conteúdo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
