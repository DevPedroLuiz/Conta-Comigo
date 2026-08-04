# Documentação do Design System - Conta Comigo

## 1. Filosofia Visual

O Design System do **Conta Comigo** baseia-se na premissa de que a gestão financeira deve ser uma experiência pacífica, clara e sob controle. Nossos princípios são:

*   **Alta Relação Sinal-Ruído:** Remoção de qualquer elemento decorativo que não transmita informação. Interfaces limpas com muito espaço em branco (ou espaço negativo no Dark Mode).
*   **Foco no Conteúdo:** Os números e os gráficos são os protagonistas. A interface é apenas o palco.
*   **Minimalismo Utilitário:** Semelhante à abordagem da Linear e Vercel, utilizamos bordas finas (hairlines), contrastes sutis de fundo e tipografia rigorosamente alinhada.
*   **Elegância Tecnológica:** Transmitimos segurança institucional de um banco tradicional, com a velocidade e estética de uma FinTech moderna.

---

## 2. Identidade e Percepção

O usuário deve se sentir **no controle, calmo e focado**. O sistema financeiro muitas vezes gera ansiedade; portanto, a interface não deve "gritar".
*   As cores de alerta e erro são usadas com parcimônia.
*   O sucesso é celebrado de forma sutil, sem animações exageradas ou confetes.
*   A paleta predominantemente neutra e monocromática cria uma sensação de estabilidade e confiança.

---

## 3. Paleta de Cores (Tokens Visuals)

A paleta é construída em torno de uma escala de cinzas (Zinc/Neutral) sofisticada e cores semânticas vibrantes, mas controladas.

### Cores Base
*   **Primária (Brand):** Indigo/Violeta. Transmite inovação e tecnologia.
*   **Secundária:** Escala de cinzas (Zinc). Usada para o esqueleto da interface.

### Semântica
*   **Sucesso (Success):** Emerald (Verde). Usado para rendimentos, receitas e indicadores positivos.
*   **Erro/Destrutivo (Danger):** Rose (Vermelho). Usado para exclusões, despesas altas (quando alertadas) e erros.
*   **Alerta (Warning):** Amber (Amarelo/Laranja). Usado para orçamentos próximos do limite.
*   **Informação (Info):** Sky (Azul Claro). Usado para tooltips e onboarding.

### Aplicação (Dark Mode "Sophisticated Dark" & Light Mode)
*   **Background (Fundo):**
    *   Dark: `#09090b` (Preto profundo)
    *   Light: `#ffffff` (Branco puro)
*   **Surface (Superfícies/Cards):**
    *   Dark: `#0f0f11` (Elevado 1 nível) até `#18181b` (Elevado 2 níveis)
    *   Light: `#fafafa` (Elevado 1 nível)
*   **Borders (Bordas):** Utilização de `zinc-800` (Dark) e `zinc-200` (Light). Sempre opacidade sólida de 1px.
*   **Text (Texto):**
    *   High Contrast: `zinc-100` (Dark) / `zinc-900` (Light) para Títulos.
    *   Medium Contrast: `zinc-400` (Dark) / `zinc-500` (Light) para parágrafos e subtítulos.
    *   Disabled: `zinc-600` (Dark) / `zinc-300` (Light).

---

## 4. Tipografia

Utilizaremos a fonte do sistema combinada com uma fonte geométrica sem serifa (ex: *Inter*, *SF Pro* ou *Geist*).

*   **Família Primária:** Sans-serif moderna e legível em tamanhos pequenos (focada em dados numéricos perfeitamente alinhados).
*   **Escalas:**
    *   H1: 24px (Mobile) / 32px (Desktop)
    *   H2: 20px (Mobile) / 24px (Desktop)
    *   Body Base: 16px (Leitura perfeita).
    *   Small / Caption: 12px (Metadados de transação).
    *   Micro / Overline: 10px (Labels de gráficos, UPPERCASE tracking largo).
*   **Hierarquia:** Construída variando peso (Medium/Semibold) e cor (High/Medium contrast), e não apenas tamanho.
*   **Tabular Numbers:** Obrigatório o uso de `font-variant-numeric: tabular-nums` para que valores financeiros fiquem perfeitamente alinhados verticalmente nas tabelas.

---

## 5. Grid

O layout utiliza grids fluídos limitados a contêineres máximos para não perder a proporção em monitores ultra-wide.

*   **Desktop (xl/2xl):** 12 colunas. Container máximo de 1280px ou 1440px. Margens generosas.
*   **Tablet (md/lg):** 8 colunas. Adaptação de sidebars para estado "colapsado" (apenas ícones).
*   **Mobile (sm):** 4 colunas. Container ocupa 100% da largura, margens laterais de 16px.

---

## 6. Espaçamentos (Spacing System)

Baseado em um **sistema de 4pt** para garantir ritmo vertical perfeito.

*   Micro: 2px, 4px (Gap de ícones e textos adjacentes)
*   Pequeno: 8px, 12px (Padding interno de botões e inputs)
*   Médio: 16px, 24px (Padding de cards, gap de listas)
*   Grande: 32px, 48px (Espaço entre seções do dashboard)
*   Enorme: 64px+ (Espaçamento estrutural de páginas)

---

## 7. Bordas e Sombras

Inspirado no Apple e Stripe, os cantos são arredondados matematicamente e as sombras simulam iluminação física.

*   **Radius:**
    *   `sm` (4px): Inputs, Checkboxes, Badges pequenas.
    *   `md` (8px): Botões padrão, Menus Dropdown.
    *   `xl` (16px - 24px): Cards principais do Dashboard, Modais e Bottom Sheets.
*   **Sombras (Elevations):**
    *   Dark Mode: Sombras quase imperceptíveis. A separação é feita via bordas finas (`border-zinc-800`).
    *   Light Mode: Sombras suaves e difusas com deslocamento vertical longo (ex: `0 4px 20px rgba(0,0,0,0.05)`).
    *   Glow (Efeito Vercel): Uso esporádico de sombras coloridas para botões primários (ex: glow indigo suave).

---

## 8. Ícones

*   **Biblioteca:** Lucide Icons (traços geométricos, consistentes e modernos).
*   **Estilo:** Outline (contorno). Stroke (espessura) de 1.5px ou 2px (dependendo do peso visual da fonte adjacente).
*   **Tamanhos:**
    *   16px: Dentro de botões, inputs e metadados.
    *   20px / 24px: Menus de navegação e ações de barra de topo.
    *   32px+: Ícones ilustrativos para Empty States.

---

## 9. Componentes

### Elementos Básicos
*   **Botões:** Sem bordas pesadas. Botão Primário usa a cor da marca com leve hover de brilho. Botão Secundário usa fundo de superfície com borda sutil. Destrutivos apenas para confirmação final.
*   **Inputs:** Fundo levemente contrastante com a superfície. Sem borda forte até o estado `:focus`, onde recebe um anel (ring) suave na cor primária.
*   **Badges/Pills:** Extremamente arredondadas (full-rounded). Textos pequenos, usadas para status ("Pago", "Pendente").

### Dados e Estrutura
*   **Cards:** Elemento central. Bordas de 1px (hairline), fundo opaco. Separam visualmente diferentes clusters de informação.
*   **Tables:** Sem bordas verticais, apenas linhas horizontais divisórias ultra-finas. Hover na linha inteira.
*   **Charts:** Uso de Recharts minimalista. Eixos e linhas de grade quase transparentes. Foco total na linha/barra principal. Efeitos de gradiente no preenchimento (ex: linha sólida com fundo esvanecendo para transparente).

### Navegação e Sobreposições
*   **Sidebar / Navbar:** Comportamento fixo. Na Web, Sidebar à esquerda. No Mobile, Top Navbar simples.
*   **Dialogs (Modais):** Fundo desfocado (backdrop blur). O modal deve surgir do centro com leve scale-up (95% para 100%).
*   **Bottom Sheets:** Exclusivos para Mobile. Deslizam de baixo para cima, acompanhando a física do dedo do usuário.
*   **Dropdowns / Popovers:** Menus contextuais acoplados a botões de reticências (...). Bordas arredondadas e sombras nítidas.

### Feedback e Estados
*   **Toast / Snackbars:** Notificações flutuantes temporárias que surgem no canto inferior direito (Desktop) ou topo (Mobile).
*   **Skeleton:** Estado de loading. Animação de "shimmer" (brilho passando) sobre blocos cinzas, mapeando o layout final antes dos dados chegarem. Sem spinners rotativos para carregamento de páginas inteiras.
*   **Empty States:** Centrados. Ilustração minimalista + Título curto + Texto de apoio + Botão Call to Action primário.
*   **Error States:** Contidos. Não "quebram" a tela. Exibem mensagem amigável com opção de "Tentar Novamente".

---

## 10. Dashboard

O coração do aplicativo. O layout obedece à hierarquia de escaneabilidade em "Z" e "F".

*   **Topo (KPIs):** Linha de 4 cards (Desktop) ou Grid 2x2 (Mobile). Mostram os macro-números (Saldo Total, Despesas do Mês).
*   **Meio (Gráficos):** Maior área de tela. Gráfico principal de Fluxo de Caixa ou Patrimônio.
*   **Base/Lateral (Listas):** Atividades Recentes ou Transações Pendentes.
*   **Filtros:** Dropdowns minimalistas no topo do Dashboard, afetando todos os widgets contextualmente (ex: Seletor de Mês/Ano).

---

## 11. Mobile (Adaptações)

O aplicativo React Native não será uma cópia "esmagada" da Web, possuirá UX nativa.

*   **Bottom Navigation:** Substitui a Sidebar. Abas para (Dashboard, Extrato, Adicionar, Metas, Perfil).
*   **Gestos (Swipes):** Deslizar uma transação para a esquerda revela opções de "Excluir" ou "Editar" (Swipe Actions).
*   **Safe Areas:** Respeito absoluto ao Notch/Dynamic Island do iPhone e barras de navegação do Android, utilizando paddings dinâmicos.
*   **FAB (Floating Action Button):** Botão centralizado na Bottom Navigation, em destaque, focado em "Nova Transação".

---

## 12. Acessibilidade

*   **Contraste (WCAG 2.1 AA):** Garantia de contraste mínimo de 4.5:1 para textos em relação aos fundos. Textos de placeholder terão contraste de 3:1 mínimo.
*   **Navegação por Teclado:** Total suporte ao `Tab`. Elementos focados recebem um `ring` visível de 2px, sem distorcer o layout (`outline: none`, uso de box-shadow/ring).
*   **Screen Readers:** Uso extensivo de atributos `aria-label` para botões com apenas ícones, e `aria-hidden` para elementos decorativos. Suporte a redução de movimento.

---

## 13. Motion Design

As animações comunicam estado e física, não apenas enfeite.

*   **Duração:** Rápida. Entre 150ms a 300ms. Interfaces financeiras lentas causam frustração.
*   **Transições/Easing:** Curvas Bezier (ex: `ease-out` para entrada de modais, `ease-in` para saídas, `spring` para bounce em interações de clique).
*   **Microinterações:** Botões reduzem ligeiramente o tamanho (scale 0.98) no clique. Troca de abas desliza um sublinhado (Magic Layout do Framer Motion).
*   **Transição de Páginas:** Cross-fade ultra rápido (100ms) no Next.js (Web) e animação de Slide nativa no React Navigation (Mobile).

---

## 14. UX (Regras de Experiência)

*   **Formulários:** Validação inline imediata no evento `onBlur`. Labels devem estar sempre visíveis (nunca usar apenas placeholders). Explicar ao usuário o formato esperado (ex: R$ 0,00).
*   **Destrutividade:** Ações como "Excluir Conta" ou "Excluir Lançamento Parcelado" DEVEM invocar um modal de confirmação. Ações perigosas possuem botões em cor Rose.
*   **Erros:** "Falha ao carregar transações". Ações devem ser resolvíveis, com botões de "Tentar de Novo", em vez de páginas em branco quebradas.
*   **Fluxo Feliz:** O caminho para adicionar uma transação comum não pode levar mais do que 3 toques/cliques a partir do Dashboard.

---

## 15. Roadmap do Design System

*   **V1 (Fundações):** Tokens de cor, tipografia, grid, e os 4 componentes base (Botões, Inputs, Cards, Tipografia). Suporte nativo ao Dark/Light.
*   **V2 (Formulários e Tabelas):** Construção robusta de Dropdowns, DataPickers customizados, Selects e Tabelas financeiras escaneáveis.
*   **V3 (Padrões Mobile e Layout):** Bottom Sheets, Swipe Actions e Bottom Navigation consolidada.
*   **V4 (Polimento e Motion):** Microinterações com Framer Motion (Web) e Reanimated (Mobile). Skeletons avançados e transições de página complexas.
