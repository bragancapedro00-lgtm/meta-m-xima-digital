'use client';

import React, { useState, useMemo } from 'react';
import { useContent } from '@/lib/context/ContentContext';
import { Post } from '@/types';
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
  const { filteredPosts, openPostModal, openNewPostModal, updatePostDate, isOverdue } = useContent();

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
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#090d16]">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800/80 bg-slate-950/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-100 capitalize">
            {monthInfo.monthName}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'mes'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'semana'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'dia'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dia
            </button>
          </div>

          <button
            onClick={() => openNewPostModal('a_gravar', todayStr)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
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
          <div className="grid grid-cols-7 border-b border-slate-800 text-center pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 flex-1 border-l border-t border-slate-800/80 overflow-y-auto">
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
                  className={`group relative flex flex-col min-h-[110px] border-r border-b border-slate-800/80 p-2 transition-colors cursor-pointer ${
                    day.isCurrentMonth ? 'bg-slate-950/40' : 'bg-slate-950/15 opacity-40'
                  } ${isDragTarget ? 'bg-indigo-950/40 ring-2 ring-indigo-500 inset-0 z-10' : ''} ${
                    isToday ? 'bg-indigo-950/20' : ''
                  } hover:bg-slate-900/60`}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-1.5 select-none">
                    <span
                      className={`text-xs font-semibold flex items-center justify-center h-5 w-5 rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : day.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewPostModal('a_gravar', day.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-opacity"
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
                              : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-indigo-500'
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0 text-indigo-400" />
                          <span className="truncate flex-1">{post.titulo}</span>
                          {post.hora_publicacao && (
                            <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
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
          <div className="grid grid-cols-7 flex-1 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
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
                  className={`flex flex-col border-r border-slate-800/80 last:border-r-0 ${
                    isDragTarget ? 'bg-indigo-950/40' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`p-3 text-center border-b border-slate-800/80 select-none ${
                      isToday ? 'bg-indigo-950/30' : 'bg-slate-900/60'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                      {day.dateObj.toLocaleString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold mt-1 ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-100'
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
                          className="rounded-lg bg-slate-900 border border-slate-700/80 p-2.5 hover:border-indigo-500 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="font-semibold uppercase text-indigo-400">
                              {post.tipo?.replace('_', ' ')}
                            </span>
                            <span>{post.hora_publicacao}</span>
                          </div>
                          <h5 className="text-xs font-semibold text-slate-100 line-clamp-2">
                            {post.titulo}
                          </h5>
                          {overdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold mt-1.5">
                              <AlertTriangle className="h-3 w-3" /> Atrasado
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => openNewPostModal('a_gravar', day.dateStr)}
                      className="w-full py-1.5 rounded border border-dashed border-slate-800 text-[11px] font-semibold text-slate-500 hover:text-indigo-400 hover:border-slate-700 transition-colors"
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-indigo-400">Linha do Tempo</span>
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
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
                    className="flex items-center justify-between bg-slate-900/90 border border-slate-800 hover:border-indigo-500 p-4 rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-500/15 rounded-lg text-indigo-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-indigo-400">
                            {post.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{post.hora_publicacao}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
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
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
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
