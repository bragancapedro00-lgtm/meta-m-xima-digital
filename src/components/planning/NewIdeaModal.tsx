'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { CategoriaIdeia, EtapaFunil, Prioridade, ContaTipo } from '@/types';
import { X, Lightbulb } from 'lucide-react';

export default function NewIdeaModal() {
  const { isNewIdeaModalOpen, closeNewIdeaModal, saveIdea, profiles, currentUser, filters } = useContent();

  const [conta, setConta] = useState<ContaTipo>(
    filters.conta && filters.conta !== 'todos' ? filters.conta : 'meta_maxima_digital'
  );
  const [titulo, setTitulo] = useState('');
  const [ideia, setIdeia] = useState('');
  const [gancho, setGancho] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [publico, setPublico] = useState('');
  const [etapaFunil, setEtapaFunil] = useState<EtapaFunil>('topo');
  const [formato, setFormato] = useState('Reels/Vídeo');
  const [referencia, setReferencia] = useState('');
  const [cta, setCta] = useState('');
  const [categoria, setCategoria] = useState<CategoriaIdeia>('educacional');
  const [prioridade, setPrioridade] = useState<Prioridade>('normal');
  const [responsavel, setResponsavel] = useState(currentUser.nome);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isNewIdeaModalOpen && filters.conta && filters.conta !== 'todos') {
      setConta(filters.conta);
    }
  }, [isNewIdeaModalOpen, filters.conta]);

  if (!isNewIdeaModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !ideia.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const accountTag = conta === 'meta_maxima_cursos' ? 'Meta Máxima Cursos' : 'Meta Máxima Digital';
      if (!parsedTags.includes(accountTag)) {
        parsedTags.push(accountTag);
      }

      await saveIdea({
        conta,
        titulo: titulo.trim(),
        ideia: ideia.trim(),
        gancho: gancho.trim(),
        objetivo: objetivo.trim(),
        publico: publico.trim(),
        etapa_funil: etapaFunil,
        formato,
        referencia: referencia.trim(),
        cta: cta.trim(),
        categoria,
        prioridade,
        responsavel,
        tags: parsedTags,
      });

      // Reset
      setTitulo('');
      setIdeia('');
      setGancho('');
      setObjetivo('');
      setPublico('');
      setReferencia('');
      setCta('');
      setTagsInput('');
      closeNewIdeaModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nova Ideia Estratégica"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-800 rounded-md text-zinc-300">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nova Ideia Estratégica</h3>
              <p className="text-xs text-zinc-400">Adicionar ao Banco de Ideias</p>
            </div>
          </div>
          <button
            onClick={closeNewIdeaModal}
            aria-label="Fechar modal"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Seleção de Conta */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Conta / Marca *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConta('meta_maxima_digital')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  conta === 'meta_maxima_digital'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Meta Máxima Digital (Azul)
              </button>
              <button
                type="button"
                onClick={() => setConta('meta_maxima_cursos')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  conta === 'meta_maxima_cursos'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Meta Máxima Cursos (Verde)
              </button>
            </div>
          </div>

          {/* Título & Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Título / Tema Central *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: 5 erros que fazem perder clientes no Instagram"
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaIdeia)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="educacional">Educacional</option>
                <option value="autoridade">Autoridade</option>
                <option value="bastidores">Bastidores</option>
                <option value="prova_social">Prova Social</option>
                <option value="oferta">Oferta</option>
                <option value="entretenimento">Entretenimento</option>
                <option value="tendencia">Tendência</option>
                <option value="institucional">Institucional</option>
              </select>
            </div>
          </div>

          {/* Ideia Descrição */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Ideia Detalhada *
            </label>
            <textarea
              rows={3}
              required
              value={ideia}
              onChange={(e) => setIdeia(e.target.value)}
              placeholder="Explique o conceito central, abordagem e por que este conteúdo vale a pena produzir..."
              className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Gancho */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Gancho / Hook (Primeiros 3 segundos)
            </label>
            <input
              type="text"
              value={gancho}
              onChange={(e) => setGancho(e.target.value)}
              placeholder="Ex: Se sua empresa faz isso no Instagram, você provavelmente está perdendo vendas..."
              className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Grid: Objetivo & Público */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Objetivo
              </label>
              <input
                type="text"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ex: Gerar autoridade e retenção"
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Público-Alvo
              </label>
              <input
                type="text"
                value={publico}
                onChange={(e) => setPublico(e.target.value)}
                placeholder="Ex: Empresários e gestores"
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Grid: Funil, Formato, Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Funil
              </label>
              <select
                value={etapaFunil}
                onChange={(e) => setEtapaFunil(e.target.value as EtapaFunil)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="topo">Topo</option>
                <option value="meio">Meio</option>
                <option value="fundo">Fundo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Formato
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="Reels/Vídeo">Reels / Vídeo</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Post estático">Post Estático</option>
                <option value="Stories">Stories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* CTA & Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                CTA Sugerida
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ex: Salve este conteúdo."
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Link ou Referência
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ex: @perfil_referencia no Instagram"
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeNewIdeaModal}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-zinc-100 px-5 py-2 text-sm font-bold text-zinc-950 shadow-sm hover:bg-white focus:outline-none transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : '+ Salvar no Banco de Ideias'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
