import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ContentProvider } from '@/lib/context/ContentContext';
import AppShell from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meta Máxima Digital | Content CRM & Operação',
  description: 'Sistema operacional de organização, planejamento e gestão de conteúdo para agências de marketing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full w-full bg-zinc-950 text-zinc-100 antialiased overflow-hidden">
        <ContentProvider>
          <AppShell>{children}</AppShell>
        </ContentProvider>
      </body>
    </html>
  );
}

