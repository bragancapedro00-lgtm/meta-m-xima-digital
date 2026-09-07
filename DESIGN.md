---
name: Meta Máxima Digital - Content CRM
description: Design System para Gestão e Operação de Conteúdo de Agência
colors:
  surface-bg: "#090d16"
  surface-card: "#0f172a"
  surface-card-hover: "#1e293b"
  surface-border: "#1e293b"
  surface-border-subtle: "#334155"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  accent-emerald: "#10b981"
  accent-amber: "#f59e0b"
  accent-rose: "#f43f5e"
  accent-indigo: "#6366f1"
  accent-cyan: "#06b6d4"
  accent-violet: "#8b5cf6"
typography:
  display:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
  micro:
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#4f46e5"
---

# Design System: Meta Máxima Digital

## Overview

**Creative North Star: "The Agency Mission Control"**

O design do sistema é focado na alta produtividade operacional de uma agência de marketing de alto padrão. Ele transmite autoridade, clareza cirúrgica e agilidade. Cada elemento em tela tem uma função prática imediata: identificar gargalos, acelerar aprovações, roteirizar e movimentar entregas no pipeline.

O visual adota o modo **Operate** com superfícies escuras refinadas (slate/zinc profundo), tipografia nítida, contrastes semânticos precisos e densidade de informação equilibrada para evitar rolagem excessiva. Evita-se qualquer artifício decorativo sem propósito como sombras pesadas, blur difuso ou gradientes chamativos.

**Key Characteristics:**
- Superfícies escuras de alto contraste com separação milimétrica por bordas sutis.
- Sinalização semântica por cores funcionais (Verde para Postado, Âmbar para Atrasado/Atenção, Azul/Índigo para Em Produção).
- Números e datas alinhados em fonte tabular (`tabular-nums`) para escaneamento rápido.
- Feedback tátil em todas as ações de drag-and-drop e cliques.

## Colors

A paleta prioriza a sobriedade operacional com acentos semânticos de alta fidelidade visual.

### Primary
- **Deep Slate Canvas** (`#090d16`): Fundo principal da aplicação, garantindo imersão e foco.
- **Card Surface** (`#0f172a`): Superfície de cards, colunas do Kanban e modais.
- **Active Indigo Accent** (`#6366f1`): Cor de destaque para ações principais e botões primários.

### Status & Funnels
- **Emerald Postado** (`#10b981`): Status postado e métricas positivas.
- **Amber Alerta/Atraso** (`#f59e0b`): Conteúdos atrasados e alertas operacionais.
- **Rose Urgência** (`#f43f5e`): Prioridade urgente e exclusões.
- **Cyan Produção** (`#06b6d4`): Etapa de edição e mídia.
- **Violet Ideação** (`#8b5cf6`): Banco de ideias e ganchos.

### Neutral
- **Text Primary** (`#f8fafc`): Títulos e textos de alta legibilidade.
- **Text Secondary** (`#94a3b8`): Subtítulos, metadados e badges secundárias.
- **Text Muted** (`#64748b`): Labels auxiliares, datas relativas e placeholders.
- **Borders & Dividers** (`#1e293b`): Divisões estruturais limpas sem peso visual.

### Named Rules
**The Status Contrast Rule.** Cores quentes e chamativas são restritas a estados críticos (atraso, urgência e publicação). Elementos inativos ou em repouso permanecem em tons neutros para não sobrecarregar a visão da equipe.

## Typography

**Display & Body Font:** Geist Sans / Inter (`system-ui, sans-serif`)
**Mono Font:** Geist Mono / JetBrains Mono (para datas, horários e métricas)

**Character:** Tipografia corporativa moderna, limpa e altamente legível em densidades elevadas.

### Hierarchy
- **Display** (Bold 700, 28px, line-height 1.2): Títulos de dashboards e contadores principais.
- **Headline** (SemiBold 600, 20px, line-height 1.3): Cabeçalhos de colunas do Kanban e nomes de abas.
- **Title** (Medium 500, 15px, line-height 1.4): Título de cada card de conteúdo ou ideia.
- **Body** (Regular 400, 14px, line-height 1.5): Textos de roteiro, descrições e observações.
- **Label** (Medium 500, 12px, tracking 0.02em): Badges de funil, prioridade, responsável e status.

## Layout

- **Desktop (>1024px):** Barra lateral fixa com 260px de largura e área de trabalho com rolagem independente, aproveitamento vertical máximo para o Kanban.
- **Tablet (768px-1024px):** Barra lateral colapsável com ícones de acesso rápido e cabeçalho expansível.
- **Mobile (<768px):** Navegação inferior (Bottom Navigation) com as 4 áreas mais frequentes (Dashboard, Kanban, Calendário, Ideias) e menu "Mais" para as demais opções.

## Elevation & Depth

Surperfícies predominantemente planas com elevação sutil baseada em camadas tonais (`#090d16` para base, `#0f172a` para colunas/containers, `#1e293b` para cards em hover e sobreposições). Sombras discretas são utilizadas exclusivamente em elementos flutuantes (menus contextuais de 3 pontos, drawers e cards sendo arrastados).

### Named Rules
**The Flat-By-Default Rule.** Cards em repouso repousam sem sombras projetadas; ao iniciar o arraste ou abrir modal, uma sombra focal de elevação (`0 12px 32px rgba(0, 0, 0, 0.4)`) destaca a peça em manipulação.

## Shapes

Bordas suavemente arredondadas com raio de 10px para containers e cards de conteúdo, 6px para botões e inputs, e formato circular para avatares de responsáveis e chips de status.

## Components

### Buttons
- **Shape:** Raio de 6px com espaçamento interno de 8px x 16px.
- **Primary:** Fundo Indigo (`#6366f1`), texto branco, transição suave de 150ms para `#4f46e5`.
- **Secondary / Ghost:** Fundo transparente com borda `#1e293b` e hover em `#1e293b/50`.

### Cards (Kanban)
- **Shape:** Raio de 10px, borda sólida de 1px `#1e293b`.
- **Interatividade:** Cursor `grab`, micro-elevação ao passar o mouse com borda clareando para `#334155`.
- **Informações:** Thumbnail no topo quando houver, título com truncamento inteligente, linha inferior com responsável, tags e prazo com destaque de atraso.

### Chips & Badges
- **Status Pills:** Fundo com 15% de opacidade da cor temática e texto 100% saturado para máximo contraste e elegância.

## Do's and Don'ts

### Do:
- **Do** manter sincronização imediata entre Kanban e Calendário.
- **Do** alertar claramente com badge vermelho/âmbar qualquer post com data vencida e status diferente de postado.
- **Do** fornecer skeleton loaders rápidos durante o carregamento inicial.
- **Do** exibir estados vazios amigáveis com botão de ação direta ("+ Adicionar Conteúdo").

### Don't:
- **Don't** utilizar gradientes violeta genéricos ou glassmorphism borrado.
- **Don't** exigir recarregamento de página para refletir mudanças no pipeline.
- **Don't** ocultar botões essenciais dentro de menus profundos.
- **Don't** exibir dados fictícios como se fossem métricas reais de integrações.
