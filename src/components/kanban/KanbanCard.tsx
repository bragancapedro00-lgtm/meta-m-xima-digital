'use client';

import React, { useState } from 'react';
import { Post, DRIVE_PHYSICAL_STAGES } from '@/types';
import { useContent } from '@/lib/context/ContentContext';
import {
  Calendar,
  Clock,
  AlertTriangle,
  MoreVertical,
  Copy,
  Trash2,
  Archive,
  Edit3,
  Video,
  Layers,
  FileImage,
  Sparkles,
  Share2,
  Check,
  UploadCloud,
} from 'lucide-react';
import { GoogleDriveIcon } from '@/components/icons/BrandIcons';

interface KanbanCardProps {
  post: Post;
  isDragging?: boolean;
}

export default function KanbanCard({ post }: KanbanCardProps) {
  const {
    openPostModal,
    duplicatePost,
    deletePost,
    archivePost,
    isOverdue,
    canPerform,
    retryGoogleDriveSync,
  } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [retryingDrive, setRetryingDrive] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const overdue = isOverdue(post);
  const canMove = canPerform ? canPerform('canMoveKanban') : true;
  const canCreate = canPerform ? canPerform('canCreateContent') : true;
  const canDelete = canPerform ? canPerform('canDeleteContent') : true;

  const isPhysicalStage = (DRIVE_PHYSICAL_STAGES as string[]).includes(post.status);
  const hasDriveFile = Boolean(post.google_drive_file_id || post.drive_file_id);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📌 ${post.titulo}\nStatus: ${post.status.toUpperCase()}\nData: ${post.data_publicacao}${post.hora_publicacao ? ' às ' + post.hora_publicacao : ''}\nResponsável: ${post.responsavel}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  // Drag start handler (native HTML5 DnD)
  const handleDragStart = (e: React.DragEvent) => {
    if (!canMove) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', post.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Helper for content type icon & label
  const getTypeInfo = () => {
    switch (post.tipo) {
      case 'reels_video':
      case 'video':
        return { label: 'Reels', icon: Video, color: 'text-indigo-400 bg-indigo-500/10' };
      case 'carrossel':
        return { label: 'Carrossel', icon: Layers, color: 'text-cyan-400 bg-cyan-500/10' };
      case 'post_estatico':
        return { label: 'Estático', icon: FileImage, color: 'text-emerald-400 bg-emerald-500/10' };
      case 'anuncio':
        return { label: 'Anúncio', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10' };
      default:
        return { label: 'Post', icon: Video, color: 'text-slate-400 bg-slate-500/10' };
    }
  };

  const typeInfo = getTypeInfo();
  const TypeIcon = typeInfo.icon;

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      draggable={canMove}
      onDragStart={handleDragStart}
      onClick={() => openPostModal(post, 'detalhes')}
      className={`group relative rounded-xl border bg-slate-900/90 p-3.5 shadow-sm transition-all duration-150 hover:border-slate-600/80 hover:shadow-md hover:translate-y-[-1px] ${
        canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } select-none ${
        overdue
          ? 'border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-slate-900/90'
          : 'border-slate-800'
      }`}
    >
      {/* Thumbnail preview if present */}
      {post.thumbnail_url && (
        <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg bg-slate-950">
          <img
            src={post.thumbnail_url}
            alt={post.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
              <TypeIcon className="h-3 w-3" />
              {typeInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Top Badges Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {!post.thumbnail_url && (
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${typeInfo.color}`}
            >
              <TypeIcon className="h-3 w-3" />
              {typeInfo.label}
            </span>
          )}

          {/* Funnel Badge */}
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              post.etapa_funil === 'topo'
                ? 'badge-funnel-topo'
                : post.etapa_funil === 'meio'
                ? 'badge-funnel-meio'
                : 'badge-funnel-fundo'
            }`}
          >
            {post.etapa_funil}
          </span>

          {/* Priority Pill */}
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              post.prioridade === 'urgente'
                ? 'badge-priority-urgente'
                : post.prioridade === 'alta'
                ? 'badge-priority-alta'
                : post.prioridade === 'baixa'
                ? 'badge-priority-baixa'
                : 'badge-priority-normal'
            }`}
          >
            {post.prioridade}
          </span>
        </div>

        {/* 3-dots Context Menu Toggle */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Opções do conteúdo"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-30 w-36 rounded-lg bg-slate-900 border border-slate-800 shadow-xl p-1 text-xs space-y-0.5">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openPostModal(post, 'detalhes');
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                Editar
              </button>
              {canCreate && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    duplicatePost(post.id);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5 text-cyan-400" />
                  Duplicar
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  archivePost(post.id, true);
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Archive className="h-3.5 w-3.5 text-amber-400" />
                Arquivar
              </button>
              <button
                onClick={handleShare}
                className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {copiedShare ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                    Compartilhar
                  </>
                )}
              </button>
              {canDelete && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm('Deseja excluir permanentemente este conteúdo?')) {
                      deletePost(post.id);
                    }
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-rose-400 hover:bg-rose-500/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      <h4 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 break-words group-hover:text-indigo-300 transition-colors mb-2">
        {post.titulo}
      </h4>

      {/* Hook snippet if available */}
      {post.gancho && (
        <p className="text-xs text-slate-400 italic line-clamp-1 mb-3">
          &ldquo;{post.gancho}&rdquo;
        </p>
      )}

      {/* Tags Chips */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 2 && (
            <span className="text-[10px] text-slate-500 font-medium">
              +{post.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Google Drive Status & Actions for Physical Stages */}
      {isPhysicalStage && (
        <div className="mb-2.5">
          {/* Failed sync alert */}
          {post.google_drive_sync_status === 'erro' ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]"
            >
              <span className="flex items-center gap-1 font-semibold truncate">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                ⚠️ Sincronização pendente
              </span>
              <button
                type="button"
                disabled={retryingDrive}
                onClick={async (e) => {
                  e.stopPropagation();
                  setRetryingDrive(true);
                  try {
                    await retryGoogleDriveSync(post.id);
                  } finally {
                    setRetryingDrive(false);
                  }
                }}
                className="shrink-0 text-[10px] font-bold text-amber-300 hover:text-white underline underline-offset-2 ml-1"
              >
                {retryingDrive ? 'Tentando...' : 'Tentar novamente'}
              </button>
            </div>
          ) : !hasDriveFile && post.status === 'gravado' ? (
            /* Missing file in 'gravado' */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPostModal(post, 'arquivos');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5 text-indigo-400" />
              Adicionar arquivo do Google Drive
            </button>
          ) : !hasDriveFile && (post.status === 'editado' || post.status === 'postado') ? (
            /* Missing file in 'editado' or 'postado' */
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60">
              <span>Sem arquivo vinculado ao Drive</span>
            </div>
          ) : hasDriveFile ? (
            /* Synced file */
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 font-medium bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 truncate">
              <GoogleDriveIcon className="h-3 w-3 shrink-0 text-emerald-400" />
              <span className="truncate">Drive: {post.drive_folder_name || post.status.toUpperCase()}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom Footer: Date, Overdue Indicator & Responsible Avatar */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-1 text-xs">
        <div className="flex items-center gap-2">
          {/* Overdue Badge or Date */}
          {overdue ? (
            <span className="flex items-center gap-1 rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              ATRASADO ({formatDate(post.data_publicacao)})
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px] tabular-nums">
              <Calendar className="h-3 w-3 text-slate-500" />
              <span>{formatDate(post.data_publicacao)}</span>
              {post.hora_publicacao && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>{post.hora_publicacao}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Responsible Person Avatar */}
        <div className="flex items-center gap-1.5" title={`Responsável: ${post.responsavel}`}>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline truncate max-w-[80px]">
            {post.responsavel.split(' ')[0]}
          </span>
          <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold ring-1 ring-slate-800 uppercase">
            {post.responsavel.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
