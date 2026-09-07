'use client';

import React, { useState } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { PostStatus, PostTipo, EtapaFunil, Prioridade, Plataforma, ClassificacaoConteudo, ContaTipo } from '@/types';
import { X, Sparkles } from 'lucide-react';

export default function NewPostModal() {
  const { isNewPostModalOpen, closeNewPostModal, newPostDefaults, savePost, profiles, currentUser, filters } = useContent();

  const [conta, setConta] = useState<ContaTipo>(
    filters.conta && filters.conta !== 'todos' ? filters.conta : 'meta_maxima_digital'
  );
  const [titulo, setTitulo] = useState('');
  const [dataPublicacao, setDataPublicacao] = useState(newPostDefaults.date);
  const [horaPublicacao, setHoraPublicacao] = useState('18:00');
  const [tipo, setTipo] = useState<PostTipo>('reels_video');
  const [etapaFunil, setEtapaFunil] = useState<EtapaFunil>('topo');
  const [status, setStatus] = useState<PostStatus>(newPostDefaults.status);
  const [prioridade, setPrioridade] = useState<Prioridade>('normal');
  const [plataforma, setPlataforma] = useState<Plataforma>('instagram');
  const [responsavel, setResponsavel] = useState(currentUser.nome);
  const [classificacao, setClassificacao] = useState<ClassificacaoConteudo>('organico');
  const [gancho, setGancho] = useState('');
  const [cta, setCta] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaults when modal opens
  React.useEffect(() => {
    if (isNewPostModalOpen) {
      setStatus(newPostDefaults.status);
      setDataPublicacao(newPostDefaults.date);
      setResponsavel(currentUser.nome);
      if (filters.conta && filters.conta !== 'todos') {
        setConta(filters.conta);
      }
    }
  }, [isNewPostModalOpen, newPostDefaults, currentUser, filters.conta]);

  if (!isNewPostModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

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

      await savePost({
        conta,
        titulo: titulo.trim(),
        data_publicacao: dataPublicacao,
        hora_publicacao: horaPublicacao,
        tipo,
        etapa_funil: etapaFunil,
        status,
        prioridade,
        plataforma,
        responsavel,
        classificacao,
        gancho: gancho.trim(),
        cta: cta.trim(),
        observacoes: observacoes.trim(),
        tags: parsedTags,
      });

      // Reset form
      setTitulo('');
      setGancho('');
      setCta('');
      setObservacoes('');
      setTagsInput('');
      closeNewPostModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Novo Conteúdo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-800 rounded-md text-zinc-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Novo Conteúdo</h3>
              <p className="text-xs text-zinc-400">Criar card na esteira de produção</p>
            </div>
          </div>
          <button
            onClick={closeNewPostModal}
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

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Título do Conteúdo *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: 5 erros que fazem você perder vendas..."
              className="w-full rounded-md bg-zinc-800/80 border border-zinc-700 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {/* Grid: Etapa Inicial & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Etapa no Pipeline
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="ideias">IDEIAS</option>
                <option value="a_gravar">A GRAVAR</option>
                <option value="gravado">GRAVADO</option>
                <option value="a_editar">A EDITAR</option>
                <option value="editado">EDITADO</option>
                <option value="agendado">AGENDADO</option>
                <option value="postado">POSTADO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Data de Publicação *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={dataPublicacao}
                  onChange={(e) => setDataPublicacao(e.target.value)}
                  className="flex-1 rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
                <input
                  type="time"
                  value={horaPublicacao}
                  onChange={(e) => setHoraPublicacao(e.target.value)}
                  className="w-24 rounded-md bg-zinc-800/80 border border-zinc-750 px-2 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Grid: Tipo & Funil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Tipo de Conteúdo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as PostTipo)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="reels_video">Reels / Vídeo Curto</option>
                <option value="carrossel">Carrossel (Slides)</option>
                <option value="post_estatico">Post Estático</option>
                <option value="stories">Stories Sequencial</option>
                <option value="resultado">Resultado / Case</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Etapa do Funil
              </label>
              <select
                value={etapaFunil}
                onChange={(e) => setEtapaFunil(e.target.value as EtapaFunil)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="topo">Topo (Atração & Alcance)</option>
                <option value="meio">Meio (Nutrição & Autoridade)</option>
                <option value="fundo">Fundo (Conversão & Vendas)</option>
              </select>
            </div>
          </div>

          {/* Grid: Classificação & Plataforma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Classificação de Conteúdo
              </label>
              <select
                value={classificacao}
                onChange={(e) => setClassificacao(e.target.value as ClassificacaoConteudo)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="organico">Conteúdo de Marca / Orgânico</option>
                <option value="patrocinado">Criativo de Alta Conversão</option>
                <option value="organico_patrocinado">Distribuição Mista (Orgânico + Tráfego)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Plataforma Principal
              </label>
              <select
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value as Plataforma)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          </div>

          {/* Grid: Responsável & Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Responsável
              </label>
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
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

          {/* Gancho */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Gancho / Frase Inicial (Opcional)
            </label>
            <input
              type="text"
              value={gancho}
              onChange={(e) => setGancho(e.target.value)}
              placeholder="Ex: Pare de postar sem antes conferir isso..."
              className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* CTA & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                CTA Final (Opcional)
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Ex: Salve para consultar depois."
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Reels, Vendas, Dicas..."
                className="w-full rounded-md bg-zinc-800/80 border border-zinc-750 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeNewPostModal}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-zinc-100 px-5 py-2 text-sm font-bold text-zinc-950 shadow-sm hover:bg-white focus:outline-none transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : '+ Criar Conteúdo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
