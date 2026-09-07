-- ==============================================================================
-- SCHEMA DO SUPABASE: PAINEL DE CONTEÚDO & CRM (META MÁXIMA DIGITAL)
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID
create extension if not exists "uuid-ossp";

-- 2. Enums com suporte à expansão
do $$
begin
  -- Enums existentes preservados e expandidos
  if not exists (select 1 from pg_type where typname = 'post_tipo') then
    create type post_tipo as enum ('video', 'carrossel', 'resultado', 'reels_video', 'post_estatico', 'stories', 'anuncio', 'outro');
  else
    alter type post_tipo add value if not exists 'reels_video';
    alter type post_tipo add value if not exists 'post_estatico';
    alter type post_tipo add value if not exists 'stories';
    alter type post_tipo add value if not exists 'anuncio';
    alter type post_tipo add value if not exists 'outro';
  end if;

  if not exists (select 1 from pg_type where typname = 'post_etapa_funil') then
    create type post_etapa_funil as enum ('topo', 'meio', 'fundo');
  end if;

  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type post_status as enum ('ideias', 'a_gravar', 'gravado', 'a_editar', 'editado', 'agendado', 'postado');
  else
    alter type post_status add value if not exists 'ideias';
  end if;

  if not exists (select 1 from pg_type where typname = 'plataforma_tipo') then
    create type plataforma_tipo as enum ('facebook', 'instagram', 'youtube', 'tiktok', 'linkedin');
  else
    alter type plataforma_tipo add value if not exists 'youtube';
    alter type plataforma_tipo add value if not exists 'tiktok';
    alter type plataforma_tipo add value if not exists 'linkedin';
  end if;

  -- Novos enums
  if not exists (select 1 from pg_type where typname = 'post_prioridade') then
    create type post_prioridade as enum ('baixa', 'normal', 'alta', 'urgente');
  end if;

  if not exists (select 1 from pg_type where typname = 'categoria_ideia') then
    create type categoria_ideia as enum (
      'educacional', 'autoridade', 'bastidores', 'prova_social',
      'oferta', 'entretenimento', 'tendencia', 'institucional'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'perfil_role') then
    create type perfil_role as enum ('admin', 'gestor', 'editor', 'social_media', 'visualizador', 'personalizado');
  else
    alter type perfil_role add value if not exists 'personalizado';
  end if;
end$$;

-- 3. Tabela: posts (existente preservada + novas colunas seguras)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  data_publicacao date not null,
  tipo post_tipo not null default 'video',
  etapa_funil post_etapa_funil not null default 'topo',
  titulo text not null,
  status post_status not null default 'a_gravar',
  arquivo_bruto_url text,
  arquivo_editado_url text,
  responsavel text,
  observacoes text,
  user_id uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Adicionar novas colunas em public.posts caso não existam
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'hora_publicacao') then
    alter table public.posts add column hora_publicacao text default '18:00';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'prioridade') then
    alter table public.posts add column prioridade post_prioridade default 'normal';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'plataforma') then
    alter table public.posts add column plataforma plataforma_tipo default 'instagram';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'tags') then
    alter table public.posts add column tags text[] default '{}';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'gancho') then
    alter table public.posts add column gancho text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'roteiro_desenvolvimento') then
    alter table public.posts add column roteiro_desenvolvimento text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'roteiro_prova') then
    alter table public.posts add column roteiro_prova text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'cta') then
    alter table public.posts add column cta text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'legenda') then
    alter table public.posts add column legenda text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'thumbnail_url') then
    alter table public.posts add column thumbnail_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'arquivado') then
    alter table public.posts add column arquivado boolean default false;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'ordem') then
    alter table public.posts add column ordem int default 0;
  end if;
end$$;

-- 4. Tabela: contas_conectadas (existente preservada)
create table if not exists public.contas_conectadas (
  id uuid primary key default gen_random_uuid(),
  plataforma plataforma_tipo not null,
  nome_conta text not null,
  access_token text not null,
  page_id text,
  ig_business_id text,
  conectado_em timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- 5. Tabela: metricas_diarias (existente preservada)
create table if not exists public.metricas_diarias (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references public.contas_conectadas(id) on delete cascade,
  data date not null,
  seguidores int not null default 0,
  alcance int not null default 0,
  curtidas int not null default 0,
  comentarios int not null default 0,
  salvamentos int default 0,
  compartilhamentos int default 0,
  visualizacoes_reels int default 0,
  coletado_em timestamptz not null default now(),
  constraint uq_conta_data unique (conta_id, data)
);

-- 6. Tabela: ideias (Planejamento & Banco de Ideias)
create table if not exists public.ideias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  ideia text not null,
  gancho text,
  objetivo text,
  publico text,
  etapa_funil post_etapa_funil not null default 'topo',
  formato text not null default 'Reels/Vídeo',
  referencia text,
  cta text,
  observacoes text,
  responsavel text,
  prioridade post_prioridade not null default 'normal',
  categoria categoria_ideia not null default 'educacional',
  tags text[] default '{}',
  arquivado boolean not null default false,
  post_id uuid references public.posts(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- 7. Tabela: historico_posts (Auditoria e rastreamento de ações)
create table if not exists public.historico_posts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  usuario text not null default 'Equipe',
  acao text not null,
  detalhe text,
  criado_em timestamptz not null default now()
);

-- 8. Tabela: arquivos (Supabase Storage Metadata)
create table if not exists public.arquivos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  nome text not null,
  url text not null,
  tamanho_bytes bigint not null default 0,
  tipo_mime text,
  categoria_arquivo text not null default 'documento', -- 'video_bruto', 'video_editado', 'imagem', 'thumbnail', 'documento', 'referencia'
  criado_em timestamptz not null default now()
);

-- 9. Tabela: perfis (Membros da Equipe e Permissões Granulares)
create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  email text not null unique,
  avatar_url text,
  cargo text,
  role perfil_role not null default 'editor',
  status text not null default 'ativo',
  permissoes jsonb not null default '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": false, "canPublishContent": false, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb,
  senha text default '123456',
  criado_em timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'perfis' and column_name = 'status') then
    alter table public.perfis add column status text not null default 'ativo';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'perfis' and column_name = 'permissoes') then
    alter table public.perfis add column permissoes jsonb default '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": false, "canPublishContent": false, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'perfis' and column_name = 'senha') then
    alter table public.perfis add column senha text default '123456';
  end if;
end$$;

-- 10. Tabela: integracoes (Status e configurações Meta, GA4 e Google Ads)
create table if not exists public.integracoes (
  id uuid primary key default gen_random_uuid(),
  provedor text not null unique, -- 'meta_business', 'google_analytics', 'google_ads'
  status text not null default 'desconectado', -- 'conectado', 'desconectado', 'pendente', 'erro'
  configuracoes jsonb default '{}'::jsonb,
  ultima_sincronizacao timestamptz,
  atualizado_em timestamptz not null default now()
);

-- 11. Índices para performance
create index if not exists idx_posts_data_publicacao on public.posts (data_publicacao);
create index if not exists idx_posts_status on public.posts (status);
create index if not exists idx_posts_etapa_funil on public.posts (etapa_funil);
create index if not exists idx_posts_responsavel on public.posts (responsavel);
create index if not exists idx_ideias_categoria on public.ideias (categoria);
create index if not exists idx_ideias_status on public.ideias (arquivado);
create index if not exists idx_historico_post_id on public.historico_posts (post_id);
create index if not exists idx_arquivos_post_id on public.arquivos (post_id);
create index if not exists idx_metricas_conta_data on public.metricas_diarias (conta_id, data desc);

-- 12. Trigger para atualização automática de 'atualizado_em'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_ideias_updated_at on public.ideias;
create trigger set_ideias_updated_at
  before update on public.ideias
  for each row
  execute function public.handle_updated_at();

-- 13. Row Level Security (RLS)
alter table public.posts enable row level security;
alter table public.contas_conectadas enable row level security;
alter table public.metricas_diarias enable row level security;
alter table public.ideias enable row level security;
alter table public.historico_posts enable row level security;
alter table public.arquivos enable row level security;
alter table public.perfis enable row level security;
alter table public.integracoes enable row level security;

-- Políticas de acesso
drop policy if exists "Permitir leitura de posts para autenticados e anon" on public.posts;
create policy "Permitir leitura de posts para autenticados e anon"
  on public.posts for select
  to authenticated, anon
  using (true);

drop policy if exists "Permitir escrita de posts para autenticados e anon" on public.posts;
create policy "Permitir escrita de posts para autenticados e anon"
  on public.posts for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a ideias" on public.ideias;
create policy "Permitir acesso completo a ideias"
  on public.ideias for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a historico" on public.historico_posts;
create policy "Permitir acesso completo a historico"
  on public.historico_posts for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a arquivos" on public.arquivos;
create policy "Permitir acesso completo a arquivos"
  on public.arquivos for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a perfis" on public.perfis;
create policy "Permitir acesso completo a perfis"
  on public.perfis for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a integracoes" on public.integracoes;
create policy "Permitir acesso completo a integracoes"
  on public.integracoes for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a contas conectadas" on public.contas_conectadas;
create policy "Permitir acesso completo a contas conectadas"
  on public.contas_conectadas for all
  to authenticated, anon
  using (true)
  with check (true);

drop policy if exists "Permitir acesso completo a metricas diarias" on public.metricas_diarias;
create policy "Permitir acesso completo a metricas diarias"
  on public.metricas_diarias for all
  to authenticated, anon
  using (true)
  with check (true);

-- 14. Storage Bucket para Mídias
insert into storage.buckets (id, name, public)
values ('post-midias', 'post-midias', true)
on conflict (id) do nothing;

drop policy if exists "Permitir upload publico em post-midias" on storage.objects;
create policy "Permitir upload publico em post-midias"
  on storage.objects for insert
  to authenticated, anon
  with check (bucket_id = 'post-midias');

drop policy if exists "Permitir leitura publica em post-midias" on storage.objects;
create policy "Permitir leitura publica em post-midias"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'post-midias');

drop policy if exists "Permitir exclusao em post-midias" on storage.objects;
create policy "Permitir exclusao em post-midias"
  on storage.objects for delete
  to authenticated, anon
  using (bucket_id = 'post-midias');

-- 15. Seed inicial de Perfis da Equipe
insert into public.perfis (nome, email, avatar_url, cargo, role, status, permissoes, senha)
values
  (
    'Lucas Silva',
    'lucas@metamaxima.com.br',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'Head de Conteúdo',
    'gestor',
    'ativo',
    '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": true, "canMoveKanban": true, "canApproveContent": true, "canPublishContent": true, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": true, "canManageTeam": false}'::jsonb,
    '123456'
  ),
  (
    'Mariana Costa',
    'mariana@metamaxima.com.br',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'Estrategista & Copywriter',
    'social_media',
    'ativo',
    '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": true, "canPublishContent": true, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb,
    '123456'
  ),
  (
    'Pedro Santos',
    'pedro@metamaxima.com.br',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'Editor de Vídeo & Motion',
    'editor',
    'ativo',
    '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": false, "canMoveKanban": true, "canApproveContent": false, "canPublishContent": false, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": false, "canManageTeam": false}'::jsonb,
    '123456'
  ),
  (
    'Camila Rocha',
    'camila@metamaxima.com.br',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'Diretora de Operações',
    'admin',
    'ativo',
    '{"canCreateContent": true, "canEditContent": true, "canDeleteContent": true, "canMoveKanban": true, "canApproveContent": true, "canPublishContent": true, "canManageFiles": true, "canViewAnalytics": true, "canManageIntegrations": true, "canManageTeam": true}'::jsonb,
    '123456'
  )
on conflict (email) do nothing;

-- 15.1 Seed inicial de Integrações
insert into public.integracoes (provedor, status, configuracoes, ultima_sincronizacao)
values
  ('meta_business', 'conectado', '{"business_id": "bm_77491028401", "ad_account_id": "act_904812395", "page_id": "1049281048201", "ig_account_id": "178414002938102"}'::jsonb, now() - interval '2 hours'),
  ('google_analytics', 'conectado', '{"property_id": "419284012", "measurement_id": "G-7X9P4K2M"}'::jsonb, now() - interval '3 hours'),
  ('google_ads', 'desconectado', '{"customer_id": ""}'::jsonb, null)
on conflict (provedor) do nothing;

-- 16. Seed inicial de Posts Demonstrativos (Pipeline Kanban Completo)
insert into public.posts (
  titulo, data_publicacao, hora_publicacao, tipo, etapa_funil, status, prioridade, plataforma, responsavel, tags,
  gancho, roteiro_desenvolvimento, roteiro_prova, cta, observacoes
)
values
  (
    '5 Erros que Fazem uma Empresa Perder Clientes no Instagram',
    current_date + interval '1 day',
    '18:30',
    'video',
    'topo',
    'a_gravar',
    'alta',
    'instagram',
    'Lucas Silva',
    array['Instagram', 'Erros', 'Vendas'],
    'Se sua empresa faz isso no Instagram, você provavelmente está perdendo vendas todos os dias.',
    '1. Bio confusa sem proposta clara. 2. Postar sem CTA. 3. Não responder directs em menos de 1 hora. 4. Focar em métrica de vaidade.',
    'Mostramos como a Conta X aumentou 42% as conversões apenas corrigindo o fluxo do Direct.',
    'Salve este conteúdo para aplicar na sua conta ainda hoje.',
    'Gravar no estúdio com iluminação lateral. Usar câmera Sony A7III.'
  ),
  (
    'Checklist Prático: Como Montar um Carrossel Infinito no Canva',
    current_date + interval '3 days',
    '12:00',
    'carrossel',
    'meio',
    'gravado',
    'normal',
    'instagram',
    'Mariana Costa',
    array['Design', 'Carrossel', 'Tutorial'],
    'O segredo dos carrosséis que retêm 80% mais atenção do leitor.',
    'Passo a passo com 7 slides: corte perfeito, tipografia contrastante e elementos que quebram o grid.',
    'Exemplos visuais de 3 marcas consolidadas.',
    'Comente "CARROSSEL" para receber nosso template gratuito.',
    'Mariana já entregou o roteiro. Falta exportar os assets do Illustrator.'
  ),
  (
    'Estudo de Caso: +340% em Leads para Clínica Odontológica em 45 Dias',
    current_date + interval '4 days',
    '19:00',
    'resultado',
    'fundo',
    'a_editar',
    'urgente',
    'instagram',
    'Pedro Santos',
    array['Case', 'Odonto', 'Performance'],
    'Como transformamos R$ 2.400 em mais de R$ 38.000 em procedimentos fechados.',
    'Apresentar a esteira: anúncio de conscientização + carrossel educativo + oferta irresistível de avaliação.',
    'Prints reais do gerenciador de anúncios Meta Ads e depoimento em áudio do Dr. Rafael.',
    'Clique no link da bio e fale com nossos estrategistas.',
    'Pedro precisa aplicar animações de motion nos prints de números.'
  ),
  (
    'Tutorial Rápido: Automatizando Respostas de Stories com Manychat',
    current_date - interval '2 days',
    '15:00',
    'video',
    'meio',
    'editado',
    'normal',
    'instagram',
    'Mariana Costa',
    array['Automação', 'Manychat', 'Stories'],
    'Pare de responder manualmente "Qual o valor?" centenas de vezes.',
    'Configuração simples de gatilho por palavra-chave no Story.',
    'Demonstração em tempo real na tela do celular.',
    'Envie a palavra "AUTOMACAO" no direct para ver na prática.',
    'Vídeo editado e aprovado pelo cliente. Pronto para postagem.'
  ),
  (
    'Os Segredos do Algoritmo do Instagram para 2026',
    current_date - interval '1 day',
    '18:30',
    'carrossel',
    'topo',
    'agendado',
    'alta',
    'instagram',
    'Lucas Silva',
    array['Algoritmo', 'Tendências', 'Reels'],
    'O que realmente mudou na distribuição orgânica do Instagram em 2026.',
    'Foco absoluto em compartilhamento via Direct (DM) e tempo de retenção nos primeiros 4 segundos.',
    'Dados oficiais divulgados por Adam Mosseri no Creator Week.',
    'Compartilhe este post com seu sócio ou time de marketing.',
    'Agendado no Meta Business Suite para publicação automática.'
  ),
  (
    'Como Fechamos R$ 45k de Contratos em 30 Dias com Conteúdo Orgânico',
    current_date - interval '5 days',
    '20:00',
    'resultado',
    'fundo',
    'postado',
    'normal',
    'instagram',
    'Lucas Silva',
    array['Case Interno', 'Agência', 'Vendas'],
    'Sem gastar 1 centavo em tráfego pago, validamos nosso funil de conteúdo.',
    'Estrutura do conteúdo de fundo de funil: dor latente + solução proprietária + prova inquestionável.',
    'Nossos próprios números de fechamento no CRM.',
    'Mande mensagem para agendar sua consultoria diagnóstica.',
    'Postado com sucesso! Já superou 3.4k de alcance e 24 salvamentos.'
  )
on conflict do nothing;

-- 17. Seed inicial de Ideias de Conteúdo (Planejamento)
insert into public.ideias (
  titulo, ideia, gancho, objetivo, publico, etapa_funil, formato, cta, categoria, prioridade, responsavel, tags
)
values
  (
    'A anatomia do gancho perfeito nos Reels',
    'Mostrar os 3 primeiros segundos de vídeos virais e desmontar a técnica neurológica por trás deles.',
    'Se você não prender a atenção nos primeiros 2 segundos, seu vídeo já era.',
    'Gerar autoridade e retenção.',
    'Criadores e gestores de tráfego',
    'topo',
    'Reels/Vídeo',
    'Salve para usar na sua próxima gravação.',
    'autoridade',
    'alta',
    'Mariana Costa',
    array['Reels', 'Ganchos', 'Copywriting']
  ),
  (
    'Bastidores da nossa reunião de planejamento semanal',
    'Gravar trechos dinâmicos da equipe debatendo métricas e definindo os temas da semana.',
    'É assim que planejamos 30 dias de conteúdo em apenas 2 horas.',
    'Conectar com o público e mostrar método de trabalho.',
    'Donos de empresas e agências',
    'meio',
    'Stories',
    'Você também tem reunião fixa de conteúdo na sua empresa?',
    'bastidores',
    'normal',
    'Lucas Silva',
    array['Bastidores', 'Cultura', 'Rotina']
  ),
  (
    'O maior erro de quem contrata agência de marketing',
    'Esclarecer que a agência precisa de alinhamento com o time comercial para transformar lead em faturamento.',
    'Contratar uma agência e não treinar o seu comercial é jogar dinheiro no lixo.',
    'Educar o mercado e qualificar potenciais clientes.',
    'Empresários e Diretores Comerciais',
    'fundo',
    'Carrossel',
    'Comente "DIAGNÓSTICO" se você quer alinhar tráfego e vendas.',
    'educacional',
    'alta',
    'Camila Rocha',
    array['Gestão', 'Vendas', 'Alinhamento']
  ),
  (
    'Tendências de Conteúdo Audiovisual para o Próximo Semestre',
    'Análise de formatos: vídeos sem corte, áudios originais, estética lo-fi e vídeos verticais narrados.',
    'Esses 3 formatos de vídeo vão dominar o feed nos próximos meses.',
    'Posicionamento de vanguarda e tendência.',
    'Social media e marcas inovadoras',
    'topo',
    'Reels/Vídeo',
    'Qual desses formatos você já testou?',
    'tendencia',
    'normal',
    'Pedro Santos',
    array['Tendências', 'Vídeo', 'Audiovisual']
  )
on conflict do nothing;

-- 18. Seed de Histórico Demonstrativo
insert into public.historico_posts (post_id, usuario, acao, detalhe)
select id, 'Lucas Silva', 'Criação do Conteúdo', 'Post criado na etapa A Gravar'
from public.posts
limit 3;

-- ==============================================================================
-- 19. TABELAS DE GOOGLE DRIVE (INTEGRAÇÃO, PASTAS POR STATUS E LOGS)
-- ==============================================================================

create table if not exists public.google_drive_integrations (
  id uuid default uuid_generate_v4() primary key,
  client_id text,
  client_secret text,
  refresh_token text,
  root_folder_id text,
  root_folder_name text,
  status text default 'desconectado',
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.google_drive_status_folders (
  id uuid default uuid_generate_v4() primary key,
  status post_status not null unique,
  folder_id text not null,
  folder_name text not null,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.google_drive_sync_logs (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete set null,
  post_titulo text not null,
  file_id text not null,
  file_name text not null,
  from_folder_id text,
  to_folder_id text not null,
  to_folder_name text not null,
  status text not null, -- 'sucesso' | 'erro'
  erro_mensagem text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 20. TABELAS DE META ADS & CRIATIVOS DE TRÁFEGO PAGO
-- ==============================================================================

create table if not exists public.meta_ad_accounts (
  id text primary key,
  business_id text,
  name text not null,
  currency text default 'BRL',
  account_status integer default 1,
  timezone_name text default 'America/Sao_Paulo',
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.meta_campaigns (
  id text primary key,
  account_id text references public.meta_ad_accounts(id) on delete cascade,
  name text not null,
  objective text not null,
  status text default 'ACTIVE',
  daily_budget numeric(12, 2),
  lifetime_budget numeric(12, 2),
  spend numeric(12, 2) default 0,
  leads integer default 0,
  cpl numeric(10, 2) default 0,
  impressions integer default 0,
  clicks integer default 0,
  ctr numeric(6, 2) default 0,
  created_time timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.meta_adsets (
  id text primary key,
  campaign_id text references public.meta_campaigns(id) on delete cascade,
  name text not null,
  status text default 'ACTIVE',
  targeting_summary text,
  daily_budget numeric(12, 2),
  spend numeric(12, 2) default 0,
  leads integer default 0,
  cpl numeric(10, 2) default 0
);

create table if not exists public.meta_creatives (
  id text primary key,
  post_id uuid references public.posts(id) on delete set null,
  name text not null,
  thumbnail_url text,
  title text,
  body text,
  format text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.meta_ads (
  id text primary key,
  adset_id text references public.meta_adsets(id) on delete cascade,
  campaign_id text references public.meta_campaigns(id) on delete cascade,
  creative_id text references public.meta_creatives(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  name text not null,
  status text default 'ACTIVE',
  preview_url text,
  spend numeric(12, 2) default 0,
  impressions integer default 0,
  reach integer default 0,
  clicks integer default 0,
  ctr numeric(6, 2) default 0,
  cpc numeric(10, 2) default 0,
  cpm numeric(10, 2) default 0,
  leads integer default 0,
  cpl numeric(10, 2) default 0,
  conversions integer default 0,
  cpa numeric(10, 2) default 0,
  revenue numeric(12, 2) default 0,
  roas numeric(8, 2) default 0,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 21. TABELAS DE META PIXEL & EVENTOS
-- ==============================================================================

create table if not exists public.meta_pixel_integrations (
  id uuid default uuid_generate_v4() primary key,
  pixel_id text not null unique,
  name text not null,
  status text default 'ativo',
  last_event_time timestamp with time zone,
  diagnostics text,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.meta_pixel_events (
  id uuid default uuid_generate_v4() primary key,
  pixel_id text references public.meta_pixel_integrations(pixel_id) on delete cascade,
  event_name text not null,
  event_count integer default 0,
  last_fired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text
);

-- ==============================================================================
-- 22. TABELA UNIVERSAL DE AUDITORIA (AUDIT LOGS)
-- ==============================================================================

create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_name text not null,
  user_email text,
  user_avatar text,
  action text not null,
  category text not null, -- 'conteudo' | 'drive' | 'meta_ads' | 'pixel' | 'equipe' | 'sistema'
  target_id text,
  target_name text,
  detail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para novas tabelas
alter table public.google_drive_integrations enable row level security;
alter table public.google_drive_status_folders enable row level security;
alter table public.google_drive_sync_logs enable row level security;
alter table public.meta_ad_accounts enable row level security;
alter table public.meta_campaigns enable row level security;
alter table public.meta_adsets enable row level security;
alter table public.meta_creatives enable row level security;
alter table public.meta_ads enable row level security;
alter table public.meta_pixel_integrations enable row level security;
alter table public.meta_pixel_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "Permitir leitura para todos" on public.google_drive_status_folders for select using (true);
create policy "Permitir leitura para todos" on public.google_drive_sync_logs for select using (true);
create policy "Permitir leitura para todos" on public.meta_campaigns for select using (true);
create policy "Permitir leitura para todos" on public.meta_ads for select using (true);
create policy "Permitir leitura para todos" on public.meta_pixel_integrations for select using (true);
create policy "Permitir leitura para todos" on public.meta_pixel_events for select using (true);
create policy "Permitir leitura para todos" on public.audit_logs for select using (true);

-- ==============================================================================
-- 23. TABELAS DO ASSISTENTE DE IA (GEMINI INTEGRATION)
-- ==============================================================================

-- Contexto da Marca permanente para enriquecer prompts de IA
create table if not exists public.brand_context (
  id uuid default uuid_generate_v4() primary key,
  project_id text default 'default',
  nome_empresa text not null default 'Meta Máxima Digital',
  nicho text not null default 'Marketing Digital & Tráfego Pago',
  publico_alvo text not null default 'Empresários, infoprodutores e marcas que buscam escala em vendas',
  persona text default 'Decisores de 28 a 50 anos focados em ROI, autoridade e conversão consistente',
  produtos text default 'Consultoria de Escala, Gestão de Tráfego Pago, Produção de Conteúdo Estratégico',
  servicos text default 'Gestão de Meta Ads, Google Ads, Funis de Conversão, Criativos de Alta Conversão',
  diferenciais text default 'Estratégias baseadas em dados reais, criativos orientados a conversão e acompanhamento diário de ROI',
  tom_de_voz text default 'Profissional, persuasivo, autoritário e direto ao ponto, sem enrolação',
  palavras_obrigatorias text default 'escala, conversão, ROI, previsibilidade, autoridade',
  palavras_proibidas text default 'fórmula mágica, enriquecer rápido, segredo infalível, hack',
  cta_padrao text default 'Clique no link da bio para agendar um diagnóstico estratégico gratuito.',
  regiao_atuacao text default 'Brasil e operações internacionais',
  objetivos text default 'Geração de leads qualificados, fortalecimento de autoridade e conversão direta',
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversas do Assistente Livre
create table if not exists public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  project_id text default 'default',
  title text not null default 'Nova conversa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mensagens individuais nas conversas do Assistente Livre
create table if not exists public.ai_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text default 'gemini-3.6-flash',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Registro auditável de todas as gerações de IA no sistema
create table if not exists public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  project_id text default 'default',
  type text not null check (type in ('ideias', 'roteiro', 'legenda', 'carrossel', 'anuncio', 'variacoes', 'melhorar', 'performance', 'estrategia', 'chat')),
  input_context jsonb default '{}'::jsonb not null,
  output text not null,
  model text not null default 'gemini-3.6-flash',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices de performance
create index if not exists idx_ai_conversations_user on public.ai_conversations(user_id);
create index if not exists idx_ai_messages_conversation on public.ai_messages(conversation_id);
create index if not exists idx_ai_generations_type on public.ai_generations(type);
create index if not exists idx_ai_generations_created_at on public.ai_generations(created_at desc);

-- RLS
alter table public.brand_context enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_generations enable row level security;

create policy "Permitir tudo para brand_context" on public.brand_context for all using (true) with check (true);
create policy "Permitir tudo para ai_conversations" on public.ai_conversations for all using (true) with check (true);
create policy "Permitir tudo para ai_messages" on public.ai_messages for all using (true) with check (true);
create policy "Permitir tudo para ai_generations" on public.ai_generations for all using (true) with check (true);


