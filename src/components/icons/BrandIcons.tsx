import React from 'react';

export function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function MetaIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12.001 7.427c-1.37 0-2.61.644-3.419 1.658C7.772 10.098 7.28 11.517 7.28 13.064c0 1.55.492 2.969 1.302 3.982.81 1.015 2.05 1.659 3.419 1.659 1.37 0 2.61-.644 3.42-1.659.81-1.013 1.302-2.432 1.302-3.982 0-1.547-.492-2.966-1.302-3.979-.81-1.014-2.05-1.658-3.42-1.658zm-7.632 5.637c0-2.42 1.018-4.636 2.653-6.216C8.657 5.267 10.8 4.35 13.11 4.35c2.31 0 4.453.917 6.088 2.498 1.635 1.58 2.653 3.796 2.653 6.216s-1.018 4.636-2.653 6.216C17.563 20.86 15.42 21.777 13.11 21.777c-2.31 0-4.453-.917-6.088-2.497-1.635-1.58-2.653-3.796-2.653-6.216z" />
    </svg>
  );
}
