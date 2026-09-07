import React from 'react';
import { ContaTipo } from '@/types';

interface AccountBadgeProps {
  conta?: ContaTipo | string;
  tags?: string[];
  className?: string;
  size?: 'sm' | 'md';
  dotOnly?: boolean;
}

/**
 * Componente oficial de Tag de Conta:
 * - Verde para Meta Máxima Cursos
 * - Azul para Meta Máxima Digital
 */
export function AccountBadge({
  conta,
  tags = [],
  className = '',
  size = 'sm',
  dotOnly = false,
}: AccountBadgeProps) {
  // Determinar se a conta é Cursos ou Digital
  const isCursos =
    conta === 'meta_maxima_cursos' ||
    tags.some((t) => t.toLowerCase().includes('curso'));

  // Se nenhuma conta estiver explícita, assume Digital por padrão
  const finalAccount = isCursos ? 'meta_maxima_cursos' : 'meta_maxima_digital';

  if (dotOnly) {
    return finalAccount === 'meta_maxima_cursos' ? (
      <span
        title="Meta Máxima Cursos (Verde)"
        className={`inline-block h-2 w-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.5)] ${className}`}
      />
    ) : (
      <span
        title="Meta Máxima Digital (Azul)"
        className={`inline-block h-2 w-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.5)] ${className}`}
      />
    );
  }

  const sizeClasses =
    size === 'md'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : 'px-2 py-0.5 text-[10px] gap-1';

  if (finalAccount === 'meta_maxima_cursos') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 tracking-wide select-none ${sizeClasses} ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span>Meta Máxima Cursos</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-blue-950/70 text-blue-400 border border-blue-500/30 tracking-wide select-none ${sizeClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
      <span>Meta Máxima Digital</span>
    </span>
  );
}

export default AccountBadge;
