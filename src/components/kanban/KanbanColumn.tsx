'use client';

import React, { useState } from 'react';
import { Post, PostStatus, DRIVE_PHYSICAL_STAGES } from '@/types';
import { useContent } from '@/lib/context/ContentContext';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';
import { GoogleDriveIcon } from '@/components/icons/BrandIcons';

interface KanbanColumnProps {
  status: PostStatus;
  label: string;
  colorClass: string;
  posts: Post[];
}

export default function KanbanColumn({ status, label, colorClass, posts }: KanbanColumnProps) {
  const { updatePostStatus, openNewPostModal } = useContent();
  const [isOver, setIsOver] = useState(false);
  const isPhysical = (DRIVE_PHYSICAL_STAGES as string[]).includes(status);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      await updatePostStatus(postId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full snap-center min-w-[84vw] sm:min-w-[280px] max-w-[310px] w-full rounded-xl bg-slate-950/50 border transition-all duration-150 ${
        isOver
          ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/80 bg-slate-950/80 rounded-t-xl select-none">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {label}
          </h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800 px-1.5 text-[11px] font-bold text-slate-400 tabular-nums">
            {posts.length}
          </span>
          {isPhysical && (
            <span
              title="Etapa física com pasta sincronizada no Google Drive"
              className="flex items-center gap-1 rounded bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 uppercase tracking-wider"
            >
              <GoogleDriveIcon className="h-2.5 w-2.5" />
              Drive
            </span>
          )}
        </div>

        <button
          onClick={() => openNewPostModal(status)}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={`Adicionar conteúdo em ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Column Body / Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-slate-800/80 p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">Nenhum conteúdo aqui</p>
            <button
              onClick={() => openNewPostModal(status)}
              className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              + Adicionar
            </button>
          </div>
        ) : (
          posts.map((post) => <KanbanCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
