'use client';

import React from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { PostStatus } from '@/types';
import KanbanColumn from './KanbanColumn';
import KanbanFilterBar from './KanbanFilterBar';

const COLUMNS: { status: PostStatus; label: string; colorClass: string }[] = [
  { status: 'ideias', label: 'Ideias', colorClass: 'bg-violet-500' },
  { status: 'a_gravar', label: 'A Gravar', colorClass: 'bg-amber-500' },
  { status: 'gravado', label: 'Gravado', colorClass: 'bg-yellow-400' },
  { status: 'a_editar', label: 'A Editar', colorClass: 'bg-cyan-400' },
  { status: 'editado', label: 'Editado', colorClass: 'bg-blue-500' },
  { status: 'agendado', label: 'Agendado', colorClass: 'bg-indigo-500' },
  { status: 'postado', label: 'Postado', colorClass: 'bg-emerald-500' },
];

export default function KanbanBoard() {
  const { filteredPosts } = useContent();

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Top Filter Bar */}
      <KanbanFilterBar />

      {/* Columns Area with Horizontal Scroll & Mobile Snap */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-4 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-3 sm:gap-4 h-full min-w-max pb-2">
          {COLUMNS.map((col) => {
            const columnPosts = filteredPosts.filter((p) => p.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                colorClass={col.colorClass}
                posts={columnPosts}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
