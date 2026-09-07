'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ConviteRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const invite = searchParams.get('invite') || searchParams.get('token');
    const email = searchParams.get('email');

    const params = new URLSearchParams();
    if (invite) params.set('invite', invite);
    if (email) params.set('email', email);

    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 text-xs">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>Validando convite de colaborador...</span>
      </div>
    </div>
  );
}

export default function ConvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-xs text-zinc-500">Carregando convite...</div>}>
      <ConviteRedirect />
    </Suspense>
  );
}
