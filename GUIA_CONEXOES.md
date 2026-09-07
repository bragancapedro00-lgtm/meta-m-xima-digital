# 🚀 Guia de Conexões & Checklist Operacional (Meta Máxima Digital)

Este guia contém o **passo a passo exato** do que você precisa fazer para obter suas chaves e conectar o **Meta Business Suite**, o **Google Analytics 4** e o **Google Ads** ao seu sistema.

---

## 1. 🟣 Conectar Meta Business Suite (Instagram & Meta Ads)

Com essa conexão, o CRM sincroniza métricas de alcance, seguidores, impressões, Reels e campanhas de anúncios.

### Passo 1.1: Criar o Aplicativo no Meta for Developers
1. Acesse o portal oficial de desenvolvedores da Meta:  
   👉 **[https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)**
2. Clique no botão verde **"Criar aplicativo"** (Create App).
3. Selecione o caso de uso: **"Outro"** ou **"Empresa" (Business)** e clique em Avançar.
4. Preencha o nome do app (ex: `Painel de Conteúdo Meta Máxima`) e selecione a sua conta do Gerenciador de Negócios (Business Manager).

### Passo 1.2: Adicionar os Produtos e Permissões
No painel do seu aplicativo recém-criado, configure as permissões necessárias:
- Vá em **Adicionar Produtos** e adicione o **"Instagram Graph API"**.
- As permissões que você deve solicitar/marcar são:
  - `instagram_basic`
  - `instagram_manage_insights`
  - `pages_read_engagement`
  - `ads_read` (para campanhas de anúncios)

### Passo 1.3: Gerar o Token de Acesso Permanente (System User Token)
1. Abra o **Gerenciador de Negócios da Meta (Business Manager)**:  
   👉 **[https://business.facebook.com/settings](https://business.facebook.com/settings)**
2. No menu esquerdo, vá em **Usuários** > **Usuários do Sistema** (System Users).
3. Clique em **Adicionar**, defina a função como **Administrador** e confirme.
4. Clique no usuário criado e depois em **"Gerar Novo Token"**:
   - Selecione o seu Aplicativo.
   - Marque a expiração como **"Nunca expira" (Never)** ou 60 dias.
   - Marque as permissões: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `ads_read`.
5. Copie o **Token de Acesso** gerado (`EAABwz...`).

### Passo 1.4: Onde pegar os IDs
- **ID do Gerenciador de Negócios (Business ID)**: Visível na barra de endereços do Business Manager ou em *Configurações do Negócio > Informações da Empresa*.
- **ID da Conta de Anúncios**: Acesse o Gerenciador de Anúncios (`act_XXXXXXXXX`).
- **ID da Página do Facebook**: Em *Configurações da Página > Geral*.

### Passo 1.5: Ativar no Sistema
1. No seu CRM, vá em **Configurações > Conexões de APIs**.
2. No card **Meta Business Suite**, clique em **Conectar Conta**.
3. Cole o **Token de Acesso**, o **Business ID** e o **ID da Conta de Anúncios**.
4. Clique em **Testar Conexão** e depois em **Salvar Credenciais**.

---

## 2. 🟠 Conectar Google Analytics 4 (GA4)

Com essa conexão, o sistema monitora tráfego do link da bio, sessões, taxas de conversão e comportamento dos visitantes.

### Passo 2.1: Obter o ID da Propriedade GA4
1. Acesse o Google Analytics:  
   👉 **[https://analytics.google.com/](https://analytics.google.com/)**
2. No canto inferior esquerdo, clique no ícone de engrenagem **"Administrador"**.
3. Na coluna do meio, clique em **"Detalhes da Propriedade"**.
4. No canto superior direito da tela, copie o número do **"ID DA PROPRIEDADE"** (são apenas dígitos, ex: `419284012`).

### Passo 2.2: Criar Conta de Serviço no Google Cloud (Service Account)
1. Acesse o Google Cloud Console:  
   👉 **[https://console.cloud.google.com/](https://console.cloud.google.com/)**
2. Crie um projeto novo ou selecione um existente.
3. No menu esquerdo, vá em **APIs e Serviços > Biblioteca**.
4. Pesquise por **"Google Analytics Data API"** e clique em **Ativar**.
5. Em seguida, vá em **APIs e Serviços > Credenciais** > **Criar Credenciais** > **Conta de Serviço**.
6. Dê um nome (ex: `crm-analytics-sync`) e conclua.
7. Copie o e-mail da conta de serviço criada (ex: `crm-analytics-sync@seu-projeto.iam.gserviceaccount.com`).

### Passo 2.3: Conceder Acesso de Leitor no GA4
1. Volte ao painel do Google Analytics em **Administrador > Gerenciamento de acesso à propriedade**.
2. Clique no botão azul `+` no canto superior direito e em **Adicionar usuários**.
3. Cole o e-mail da conta de serviço que você copiou no Google Cloud.
4. Marque a função como **"Leitor"** (Viewer) e salve.

### Passo 2.4: Ativar no Sistema
1. No CRM, vá em **Configurações > Conexões de APIs**.
2. No card **Google Analytics 4**, clique em **Conectar Conta**.
3. Insira o seu **ID da Propriedade GA4** e o **E-mail da Conta de Serviço**.
4. Clique em **Testar Conexão** e confirme a sincronização.

---

## 3. 🔵 Conectar Google Ads

Com essa conexão, o CRM consolida dados de cliques (CPC), custo total, impressões e taxa de cliques (CTR) de anúncios de pesquisa e display.

### Passo 3.1: Obter o Customer ID do Google Ads
1. Acesse o painel do Google Ads:  
   👉 **[https://ads.google.com/](https://ads.google.com/)**
2. No topo superior direito da tela (ao lado do seu nome de perfil), copie o código de **10 dígitos**:  
   Exemplo: `123-456-7890`.

### Passo 3.2: Developer Token (Para APIs Diretas)
- Se você utiliza conta de administrador (**Google Ads MCC**), acesse **Ferramentas e Configurações > Central de APIs** para obter o seu **Developer Token**.

### Passo 3.3: Ativar no Sistema
1. No CRM, vá em **Configurações > Conexões de APIs**.
2. No card **Google Ads**, clique em **Conectar Conta**.
3. Insira o **Customer ID** (com ou sem traços).
4. Clique em **Testar Conexão** e salve.

---

## 4. 🗄️ Conectar ao Supabase (Banco de Dados em Nuvem)

Se quiser migrar do modo de demonstração/offline para persistência total em nuvem com PostgreSQL:

1. Acesse **[https://supabase.com/](https://supabase.com/)** e crie um projeto gratuito.
2. Em **Project Settings > API**, copie:
   - `Project URL` (URL do projeto)
   - `Project API Keys > anon public` (Chave anônima pública)
3. Crie ou edite o arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. No painel do Supabase, clique em **SQL Editor** no menu esquerdo.
5. Abra o arquivo [`supabase/schema.sql`](file:///c:/Users/teste/Desktop/meta%20m%C3%A1xima%20digital/supabase/schema.sql) deste projeto, copie todo o conteúdo e execute (clique em **Run**).
6. Pronto! As tabelas de conteúdos, membros com permissões granulares, mídias e integrações serão criadas instantaneamente.

---

## 6. 🔐 Como Enviar o Link de Acesso para os Colaboradores

Para que seus colaboradores acessem o sistema com as permissões exatas que você configurou:

### Passo 6.1: Cadastrar o Colaborador
1. No menu lateral, acesse **Configurações > Equipe & Permissões**.
2. Clique em **"+ Novo Membro da Equipe"**.
3. Preencha o **Nome**, o **E-mail Corporativo** e o **Cargo**.
4. Selecione o nível de função base (*Admin, Gestor, Social Media, Editor, Visualizador*) ou personalize as 10 permissões pontuais.
5. Clique em **Cadastrar Membro**.

### Passo 6.2: Copiar o Link de Acesso Personalizado
1. No card do colaborador recém-cadastrado, clique no botão azul **"Copiar Link de Acesso"**.
2. O sistema gerará e copiará automaticamente o link formatado com o e-mail dele:  
   `http://localhost:3000/login?email=colaborador@metamaxima.com.br`  
   *(Em produção na web, o link usará automaticamente o domínio do seu site).*

### Passo 6.3: Envio e Acesso do Colaborador
1. Envie o link copiado para o colaborador (via WhatsApp, Slack, Telegram ou E-mail).
2. Ao abrir o link, o colaborador verá a tela oficial de login da **Meta Máxima Digital** com seu e-mail já preenchido.
3. Ele clica em **"Acessar Meu Painel"** e entra instantaneamente com o perfil e permissões que você definiu.
4. Para sair, basta clicar no avatar dele no rodapé do menu e selecionar **"Sair da Conta"**.

---

🎉 **O sistema está 100% pronto para uso operacional na agência!**
