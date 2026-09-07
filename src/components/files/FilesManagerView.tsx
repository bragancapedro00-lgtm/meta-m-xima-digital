'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { ArquivoItem } from '@/types';
import {
  FolderArchive,
  Upload,
  Download,
  Trash2,
  FileVideo,
  FileImage,
  FileText,
  Search,
  Filter,
  ExternalLink,
  Plus,
} from 'lucide-react';

export default function FilesManagerView() {
  const { files, deleteFile, addFile, posts } = useContent();

  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState('todos');

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (categoryFilter !== 'todas' && f.categoria_arquivo !== categoryFilter) return false;
      if (selectedPostId !== 'todos' && f.post_id !== selectedPostId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = f.nome.toLowerCase().includes(q);
        const matchPost = f.post_titulo?.toLowerCase().includes(q);
        if (!matchName && !matchPost) return false;
      }
      return true;
    });
  }, [files, categoryFilter, selectedPostId, searchQuery]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let cat: any = 'documento';
    if (file.type.includes('video')) cat = 'video_editado';
    else if (file.type.includes('image')) cat = 'imagem';

    addFile({
      nome: file.name,
      url: URL.createObjectURL(file),
      tamanho_bytes: file.size,
      tipo_mime: file.type,
      categoria_arquivo: cat,
      post_id: selectedPostId !== 'todos' ? selectedPostId : undefined,
      post_titulo:
        selectedPostId !== 'todos'
          ? posts.find((p) => p.id === selectedPostId)?.titulo
          : 'Geral da Agência',
    });
  };

  const getFileIcon = (cat: string) => {
    if (cat.includes('video')) return FileVideo;
    if (cat === 'imagem' || cat === 'thumbnail') return FileImage;
    return FileText;
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-zinc-950 text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FolderArchive className="h-4 w-4" />
            Storage & Mídias
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">Central de Arquivos</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Armazenamento de mídias brutas, cortes editados, artes e roteiros vinculados aos conteúdos.
          </p>
        </div>

        <label className="flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 text-xs font-bold shadow transition-all cursor-pointer active:scale-95">
          <Upload className="h-4 w-4" />
          <span>Fazer Upload</span>
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900/30 text-xs shrink-0">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar arquivo..."
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-zinc-600"
        >
          <option value="todas">Todas as Categorias</option>
          <option value="video_bruto">Vídeo Bruto</option>
          <option value="video_editado">Vídeo Editado</option>
          <option value="imagem">Imagem / Carrossel</option>
          <option value="thumbnail">Thumbnail / Capa</option>
          <option value="documento">Documento / PDF</option>
          <option value="referencia">Referência Visual</option>
        </select>

        <select
          value={selectedPostId}
          onChange={(e) => setSelectedPostId(e.target.value)}
          className="rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 max-w-xs truncate focus:outline-none focus:border-zinc-600"
        >
          <option value="todos">Vínculo: Todos os Conteúdos</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Files Grid / List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <FolderArchive className="h-10 w-10 text-zinc-600 mb-3" />
            <h4 className="text-base font-semibold text-zinc-300">Nenhum arquivo encontrado</h4>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Envie vídeos, imagens ou documentos vinculados aos seus conteúdos do Kanban.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.categoria_arquivo);

              return (
                <div
                  key={file.id}
                  className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-300">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                      {file.categoria_arquivo.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-200 truncate mb-1" title={file.nome}>
                    {file.nome}
                  </h4>

                  {file.post_titulo && (
                    <p className="text-[11px] text-zinc-400 truncate mb-3" title={file.post_titulo}>
                      Vinculado a: <span className="text-zinc-300 font-medium">{file.post_titulo}</span>
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span className="tabular-nums">{(file.tamanho_bytes / 1024 / 1024).toFixed(2)} MB</span>

                    <div className="flex items-center gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                        title="Baixar Arquivo"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o arquivo "${file.nome}"?`)) {
                            deleteFile(file.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                        title="Excluir Arquivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
