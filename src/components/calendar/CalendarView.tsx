'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Post, ContaTipo } from '@/types';
import AccountBadge from '@/components/common/AccountBadge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Layers,
  FileImage,
  AlertTriangle,
  Sparkles,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';

type CalendarViewMode = 'mes' | 'semana' | 'dia';

export default function CalendarView() {
  const { filteredPosts, openPostModal, openNewPostModal, updatePostDate, isOverdue, filters, setFilters } = useContent();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mes');
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  // Helper date navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'semana') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'semana') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const setToday = () => setCurrentDate(new Date());

  // Month grid calculations
  const monthInfo = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    // Days from previous month to fill the first row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        dateStr: currDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Days of next month to fill grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return { days, monthName: firstDay.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) };
  }, [currentDate]);

  // Week view calculations (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const days: { dateStr: string; dateObj: Date }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dateObj: new Date(d),
      });
    }
    return days;
  }, [currentDate]);

  // Drag and Drop rescheduling handlers
  const handleDragStart = (e: React.DragEvent, post: Post) => {
    e.dataTransfer.setData('text/plain', post.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverDate !== dateStr) setDraggedOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDraggedOverDate(null);
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      await updatePostDate(postId, targetDateStr);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper icon for post type
  const getPostIcon = (tipo: string) => {
    switch (tipo) {
      case 'reels_video':
      case 'video':
        return Video;
      case 'carrossel':
        return Layers;
      case 'resultado':
        return Sparkles;
      default:
        return FileImage;
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-zinc-950">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-zinc-800/80 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-zinc-100 capitalize">
            {monthInfo.monthName}
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Account Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, conta: undefined }))}
              className={`px-2.5 py-1 rounded transition-colors ${
                !filters.conta
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, conta: 'meta_maxima_digital' }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                filters.conta === 'meta_maxima_digital'
                  ? 'bg-blue-950/80 text-blue-400 border border-blue-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Digital
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, conta: 'meta_maxima_cursos' }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                filters.conta === 'meta_maxima_cursos'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Cursos
            </button>
          </div>

          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'mes'
                  ? 'bg-zinc-800 text-white font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'semana'
                  ? 'bg-zinc-800 text-white font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'dia'
                  ? 'bg-zinc-800 text-white font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Dia
            </button>
          </div>

          <button
            onClick={() => openNewPostModal('a_gravar', todayStr)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Agendar Conteúdo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MÊS VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800 text-center pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 flex-1 border-l border-t border-zinc-800/80 overflow-y-auto">
            {monthInfo.days.map((day) => {
              const dayPosts = filteredPosts.filter((p) => p.data_publicacao === day.dateStr);
              const isToday = day.dateStr === todayStr;
              const isDragTarget = draggedOverDate === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  onDragOver={(e) => handleDragOver(e, day.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.dateStr)}
                  onClick={() => openNewPostModal('a_gravar', day.dateStr)}
                  className={`group relative flex flex-col min-h-[110px] border-r border-b border-zinc-800/80 p-2 transition-colors cursor-pointer ${
                    day.isCurrentMonth ? 'bg-zinc-950/40' : 'bg-zinc-950/15 opacity-40'
                  } ${isDragTarget ? 'bg-zinc-800/60 ring-2 ring-zinc-500 inset-0 z-10' : ''} ${
                    isToday ? 'bg-zinc-900/60' : ''
                  } hover:bg-zinc-900/60`}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-1.5 select-none">
                    <span
                      className={`text-xs font-semibold flex items-center justify-center h-5 w-5 rounded-full ${
                        isToday
                          ? 'bg-zinc-100 text-zinc-950 font-bold'
                          : day.isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewPostModal('a_gravar', day.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-opacity"
                      title="Agendar neste dia"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayPosts.map((post) => {
                      const Icon = getPostIcon(post.tipo);
                      const overdue = isOverdue(post);

                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, post)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostModal(post, 'detalhes');
                          }}
                          className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium transition-all hover:scale-[1.02] shadow-sm select-none cursor-grab active:cursor-grabbing border ${
                            overdue
                              ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                              : post.status === 'postado'
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                              : 'bg-zinc-900 border-zinc-750 text-zinc-200 hover:border-zinc-600'
                          }`}
                        >
                          <AccountBadge conta={post.conta} tags={post.tags} dotOnly />
                          <Icon className="h-3 w-3 shrink-0 text-zinc-400" />
                          <span className="truncate flex-1">{post.titulo}</span>
                          {post.hora_publicacao && (
                            <span className="text-[10px] text-zinc-400 tabular-nums shrink-0">
                              {post.hora_publicacao}
                            </span>
                          )}
                          {overdue && (
                            <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEMANA VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'semana' && (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="grid grid-cols-7 flex-1 border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
            {weekDays.map((day) => {
              const dayPosts = filteredPosts.filter((p) => p.data_publicacao === day.dateStr);
              const isToday = day.dateStr === todayStr;
              const isDragTarget = draggedOverDate === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  onDragOver={(e) => handleDragOver(e, day.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.dateStr)}
                  className={`flex flex-col border-r border-zinc-800/80 last:border-r-0 ${
                    isDragTarget ? 'bg-zinc-800/60' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`p-3 text-center border-b border-zinc-800/80 select-none ${
                      isToday ? 'bg-zinc-900' : 'bg-zinc-900/60'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold text-zinc-400 uppercase">
                      {day.dateObj.toLocaleString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold mt-1 ${
                        isToday ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-100'
                      }`}
                    >
                      {day.dateObj.getDate()}
                    </span>
                  </div>

                  {/* Day Content */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                    {dayPosts.map((post) => {
                      const Icon = getPostIcon(post.tipo);
                      const overdue = isOverdue(post);

                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, post)}
                          onClick={() => openPostModal(post, 'detalhes')}
                          className="rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <AccountBadge conta={post.conta} tags={post.tags} size="sm" />
                            <span className="text-[10px] text-zinc-400 shrink-0">{post.hora_publicacao}</span>
                          </div>
                          <h5 className="text-xs font-semibold text-zinc-100 line-clamp-2">
                            {post.titulo}
                          </h5>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60">
                            <span className="text-[10px] font-medium uppercase text-zinc-400 flex items-center gap-1">
                              <Icon className="h-3 w-3 text-zinc-400" />
                              {post.tipo?.replace('_', ' ')}
                            </span>
                            {overdue && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                                <AlertTriangle className="h-3 w-3" /> Atrasado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => openNewPostModal('a_gravar', day.dateStr)}
                      className="w-full py-1.5 rounded border border-dashed border-zinc-800 text-[11px] font-semibold text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                    >
                      + Novo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIA VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'dia' && (
        <div className="flex flex-1 flex-col overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-zinc-400">Linha do Tempo</span>
              <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                {currentDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => openNewPostModal('a_gravar', currentDate.toISOString().split('T')[0])}
              className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              + Adicionar Conteúdo Hoje
            </button>
          </div>

          <div className="space-y-3">
            {filteredPosts
              .filter((p) => p.data_publicacao === currentDate.toISOString().split('T')[0])
              .map((post) => {
                const Icon = getPostIcon(post.tipo);
                const overdue = isOverdue(post);

                return (
                  <div
                    key={post.id}
                    onClick={() => openPostModal(post, 'detalhes')}
                    className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-zinc-800 rounded-lg text-zinc-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AccountBadge conta={post.conta} tags={post.tags} size="sm" />
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs font-bold uppercase text-zinc-400">
                            {post.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-zinc-400">{post.hora_publicacao}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-100">
                          {post.titulo}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {overdue && (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                          <AlertTriangle className="h-3.5 w-3.5" /> Atrasado
                        </span>
                      )}
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                        {post.responsavel}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
