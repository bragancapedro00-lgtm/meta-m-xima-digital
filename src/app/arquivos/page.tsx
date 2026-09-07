import FilesManagerView from '@/components/files/FilesManagerView';

export const metadata = {
  title: 'Central de Arquivos | Meta Máxima Digital',
  description: 'Gestão de vídeos, imagens e documentos no Supabase Storage.',
};

export default function FilesPage() {
  return <FilesManagerView />;
}
