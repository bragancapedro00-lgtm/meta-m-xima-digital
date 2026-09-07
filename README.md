# Meta Máxima Digital - Content CRM & Operação

> Plataforma SaaS de organização, planejamento e gestão de conteúdo para agências de marketing e criadores, inspirada na lógica operacional e fluidez de CRMs modernos (como Leona Flow, Linear e Notion).

---

## 1. Visão Geral e Filosofia Operacional

O sistema foi desenhado para atuar como a **central de comando** da agência, conectando todas as pontas do ciclo de vida do conteúdo:

1. **Dashboard**: Central executiva com contadores do mês, conteúdos em produção, atrasados, agendados e próximos prazos.
2. **Kanban**: Pipeline operacional com drag-and-drop instantâneo em 7 etapas (Ideias ➔ A Gravar ➔ Gravado ➔ A Editar ➔ Editado ➔ Agendado ➔ Postado).
3. **Calendário**: Visão temporal (Mês, Semana, Dia) sincronizada bidirecionalmente com o Kanban e reagendamento por arraste.
4. **Planejamento & Banco de Ideias**: Concepção de ganchos, temas por categorias (Educacional, Autoridade, Bastidores, Prova Social, Oferta, etc.) com conversão de 1 clique para card de produção.
5. **Conteúdos**: Tabela de alta densidade com ordenação por coluna, busca e filtros operacionais.
6. **Gaveta de Detalhes com 5 Abas**:
   - **Detalhes**: Status, prazos, tipo, funil, prioridade, responsável e tags.
   - **Roteiro**: Roteirizador estruturado (Gancho, Desenvolvimento, Prova, CTA) com botão de cópia rápida.
   - **Arquivos**: Integração com Supabase Storage para mídias brutas e editadas.
   - **Histórico**: Auditoria em tempo real de quem alterou o que e quando.
   - **Métricas**: Indicadores pós-publicação (alcance, curtidas, comentários, salvamentos).
7. **Instagram (Meta Graph API)**: Arquitetura segura para conexão OAuth, insights oficiais, alcance, Reels e ranking de melhores conteúdos.
8. **Google Analytics (GA4)**: Métricas de tráfego, conversões, fontes de aquisição social e evolução temporal.
9. **Relatórios**: Frequência semanal, distribuição por etapa do funil e exportação em CSV e impressão em PDF.
10. **Central de Arquivos**: Explorer unificado de mídias por post e categoria.
11. **Configurações & Equipe**: Gerenciamento de papéis (Gestor, Editor, Social Media, Admin) e status das integrações.

---

## 2. Stack Tecnológica

- **Frontend & Core**: [Next.js 16 (App Router)](https://nextjs.org) com [React 19](https://react.dev) e [TypeScript](https://www.typescriptlang.org).
- **Estilização**: TailwindCSS v4 com tokens de design do Impeccable (modo *Operate*) e CSS Custom Properties centralizadas.
- **Ícones**: [Lucide React](https://lucide.dev) + ícones SVG otimizados para marcas (Instagram, Facebook, Meta).
- **Backend & Banco de Dados**: [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Auth e Storage Buckets).
- **Resiliência**: Camada de dados com modo local / offline fallback automático (zero telas em branco ou crashes quando executado antes da configuração das chaves remotas).

---

## 3. Estrutura do Banco de Dados (`supabase/schema.sql`)

O banco utiliza PostgreSQL no Supabase com extensão UUID, triggers e RLS ativado.

### 3.1. Tabelas Principais

- **`public.posts`**: Tabela central dos conteúdos do pipeline.
  - `id` (uuid, PK)
  - `titulo` (text)
  - `data_publicacao` (date) e `hora_publicacao` (text)
  - `tipo` (enum: `reels_video`, `carrossel`, `post_estatico`, `stories`, `resultado`, `anuncio`, `outro`)
  - `etapa_funil` (enum: `topo`, `meio`, `fundo`)
  - `status` (enum: `ideias`, `a_gravar`, `gravado`, `a_editar`, `editado`, `agendado`, `postado`)
  - `prioridade` (enum: `baixa`, `normal`, `alta`, `urgente`)
  - `plataforma` (enum: `instagram`, `facebook`, `youtube`, `tiktok`, `linkedin`)
  - `responsavel` (text)
  - `tags` (text[])
  - `gancho`, `roteiro_desenvolvimento`, `roteiro_prova`, `cta`, `legenda` (text)
  - `thumbnail_url`, `arquivo_bruto_url`, `arquivo_editado_url` (text)
  - `arquivado` (boolean) e `ordem` (int)
  - `criado_em` e `atualizado_em` (timestamptz com trigger automático)

- **`public.ideias`**: Banco estratégico de ideias do módulo Planejamento.
  - `id` (uuid, PK)
  - `titulo`, `ideia`, `gancho`, `objetivo`, `publico` (text)
  - `categoria` (enum: `educacional`, `autoridade`, `bastidores`, `prova_social`, `oferta`, `entretenimento`, `tendencia`, `institucional`)
  - `post_id` (uuid, FK nullable que vincula a ideia ao card criado no Kanban)

- **`public.historico_posts`**: Trilha de auditoria das ações da equipe.
  - `id`, `post_id` (FK), `usuario`, `acao`, `detalhe`, `criado_em`.

- **`public.arquivos`**: Metadados de arquivos armazenados no bucket `post-midias`.
  - `id`, `post_id` (FK), `nome`, `url`, `tamanho_bytes`, `tipo_mime`, `categoria_arquivo`.

- **`public.contas_conectadas`** e **`public.metricas_diarias`**: Armazenamento de tokens e coletas diárias de métricas da Meta Graph API.

- **`public.perfis`**: Membros da equipe da agência com seus papéis (`admin`, `gestor`, `editor`, `social_media`, `visualizador`).

---

## 4. Variáveis de Ambiente (`.env.local`)

Crie o arquivo `.env.local` na raiz do projeto a partir do modelo `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada

# Meta Graph API (Instagram)
META_APP_ID=seu-meta-app-id
META_APP_SECRET=seu-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback

# Google Analytics 4
GA4_PROPERTY_ID=properties/123456789
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## 5. Como Executar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar o Banco no Supabase (Opcional para teste inicial)
1. Acesse o painel do seu projeto no Supabase.
2. Abra a aba **SQL Editor**.
3. Copie o conteúdo completo do arquivo [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
4. O script criará todas as tabelas, enums, triggers, índices, políticas de RLS, bucket `post-midias` e dados de demonstração (seeds).

### 3. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 4. Build de Produção
```bash
npm run build
npm run start
```

---

## 6. Como Adicionar Novas Etapas ao Kanban

Para adicionar ou personalizar as colunas do Kanban:

1. No banco de dados (`supabase/schema.sql`):
   ```sql
   ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'minha_nova_etapa';
   ```
2. No código frontend (`src/types/index.ts`):
   Adicione a nova etapa ao tipo `PostStatus`:
   ```typescript
   export type PostStatus =
     | 'ideias'
     | 'a_gravar'
     | 'gravado'
     | 'a_editar'
     | 'editado'
     | 'agendado'
     | 'minha_nova_etapa'
     | 'postado';
   ```
3. Em `src/components/kanban/KanbanBoard.tsx`:
   Adicione a nova coluna ao array `COLUMNS`:
   ```typescript
   { status: 'minha_nova_etapa', label: 'Nova Etapa', colorClass: 'bg-teal-500' },
   ```
4. A esteira com drag-and-drop, filtros e contadores integrará a nova coluna automaticamente!

---

## 7. Políticas de Segurança e Row Level Security (RLS)

- Todas as tabelas têm Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) habilitado.
- Mídias no bucket `post-midias` possuem validação de tipo de arquivo e tamanho máximo.
- Credenciais sensíveis (`META_APP_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) nunca são expostas no código cliente.

---

## 8. Conformidade com Design System (Impeccable - Modo Operate)

- Especificações de produto registradas em [`PRODUCT.md`](PRODUCT.md).
- Tokens e regras visuais registrados em [`DESIGN.md`](DESIGN.md) e sidecar [`.impeccable/design.json`](.impeccable/design.json).
- Verificado sem advertências pelo detector mecânico do Impeccable.
- Interface totalmente responsiva adaptada com gestos de toque, touch targets mínimos de 44x44px e navegação inferior ergonômica em smartphones.
