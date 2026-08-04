# Documentação de Wireframes e Estrutura Visual - Conta Comigo

Este documento descreve a estrutura visual, a disposição dos elementos e o fluxo de interação das telas do ecossistema Conta Comigo (Web e Mobile), sem detalhar implementações em código.

---

## 1. Layout Base (Estruturas Globais)

### 1.1. Desktop (Web)
*   **Objetivo:** Prover navegação rápida para usuários com telas maiores.
*   **Componentes:** Sidebar fixa (à esquerda), Top Header, Área de Conteúdo principal.
*   **Layout:**
    *   **Sidebar:** Logotipo no topo. Lista de links de navegação com ícones (Dashboard, Extrato, Contas, Cartões, Investimentos, Relatórios, etc.). No final, atalho de Configurações e mini-perfil do usuário.
    *   **Header:** Breadcrumb (migalhas de pão) indicando a página atual. Barra de busca global, ícone de notificação e botão primário "Nova Transação".
*   **Responsividade:** No Tablet, a Sidebar retrai e exibe apenas ícones (Collapsed).

### 1.2. Mobile (Android / Web Mobile)
*   **Objetivo:** Acesso rápido e prático com uma mão (Thumb Zone).
*   **Componentes:** Bottom Navigation Bar, Top App Bar simplificada, Floating Action Button (FAB).
*   **Layout:**
    *   **Bottom Navigation:** 4 a 5 abas principais (Ex: Início, Extrato, Metas, Perfil).
    *   **FAB:** Posicionado no centro da Bottom Navigation ou flutuando à direita, dedicado à ação "Nova Transação".
    *   **Bottom Sheets:** Usados para criação/edição e filtros complexos, deslizando de baixo para cima.

---

## 2. Autenticação (Login, Cadastro, Recuperação)

### Telas: Login, Cadastro, Recuperação de Senha, Verificação
*   **Objetivo:** Permitir a entrada segura do usuário no sistema.
*   **Layout:**
    *   Split-screen em Desktop: Lado esquerdo com formulário centralizado. Lado direito com arte abstrata da marca, ou padrão geométrico.
    *   Em Mobile: Formulário centralizado ocupando a tela toda.
*   **Componentes:** Inputs de E-mail e Senha, Botão Primário de Ação, Botão Secundário "Entrar com Google", Links de "Esqueci a senha".
*   **Navegação:** Redirecionamento automático para o Dashboard após sucesso.
*   **Estados:**
    *   **Loading:** Botão principal exibe spinner e desabilita campos.
    *   **Error:** Inputs ficam com borda vermelha (Danger) e mensagem inline de texto. Toast superior para erro de servidor.
    *   **Offline:** Desabilita formulário e exibe aviso "Sem conexão".
*   **Responsividade:** O painel de arte do lado direito desaparece no Tablet e Mobile, focando apenas no formulário.

---

## 3. Dashboard

### Telas: Dashboard Principal, Dashboard Mobile
*   **Objetivo:** Visão panorâmica imediata da saúde financeira.
*   **Layout:**
    *   **Topo:** Seletor de mês.
    *   **Primeira Linha (KPIs):** 4 Cards exibindo Saldo Total, Investimentos, Total de Receitas (mês) e Total de Despesas (mês).
    *   **Meio:** Gráfico de Fluxo de Caixa (Barras ou Linha).
    *   **Inferior/Lado:** Lista de "Últimas Transações" (Atividades recentes).
*   **Navegação:** Clicar nos KPIs leva para os relatórios detalhados correspondentes. Clicar numa transação abre seus Detalhes.
*   **Estados:**
    *   **Loading:** Skeletons piscantes sobre os cartões de KPI e gráficos.
    *   **Empty:** Se não houver dados, o gráfico é substituído por uma ilustração amigável: "Sua jornada começa aqui. Adicione seu primeiro lançamento."
    *   **Success:** Exibição normal.
    *   **Offline:** Mostra dados do último cache, com uma badge amarela "Você está offline" no Header.

---

## 4. Contas Bancárias

### Telas: Lista de Contas, Detalhes da Conta, Nova Conta, Editar, Excluir
*   **Objetivo:** Gerenciar as fontes de saldo real do usuário.
*   **Layout (Lista):** Grid de Cards (Desktop) ou Lista Vertical (Mobile). Cada card exibe: Ícone/Logo do banco, Nome da Conta, Tipo e Saldo atual em destaque.
*   **Layout (Detalhes):** Header com os dados da conta. Abaixo, uma tabela restrita às transações daquela conta específica.
*   **Layout (Nova/Editar):** Modal (Web) ou Bottom Sheet (Mobile) com formulário: Nome, Banco, Saldo Inicial, Cor e Ícone.
*   **Estados:**
    *   **Empty (Lista):** "Nenhuma conta cadastrada". Botão CTA primário evidente.
    *   **Error (Exclusão):** "Não é possível excluir uma conta que possui transações".

---

## 5. Cartões de Crédito e Faturas

### Telas: Lista de Cartões, Novo, Editar, Faturas (Timeline), Pagamento
*   **Objetivo:** Controlar limite de crédito rotativo e vencimentos de fatura.
*   **Layout (Lista):** Exibição de cards simulando cartões físicos (proporção 1.58:1). Exibe Limite Disponível, Limite Utilizado (barra de progresso) e Valor da Fatura Atual.
*   **Layout (Fatura):** Timeline vertical. Seletor de meses no topo. Lista detalhada dos lançamentos parcelados e pontuais da fatura selecionada. Botão "Pagar Fatura".
*   **Layout (Pagamento):** Um modal onde o usuário escolhe a "Conta de Origem" que debitará o valor da fatura.
*   **Estados:**
    *   **Warning:** Barra de limite perto de 100% fica na cor Laranja/Vermelha.
    *   **Empty (Fatura):** Ilustração minimalista: "Nenhuma compra neste mês".

---

## 6. Transações (Receitas, Despesas e Transferências)

### Telas: Lista de Extrato, Novo Lançamento, Detalhes, Filtros
*   **Objetivo:** Visualização detalhada e entrada de caixa.
*   **Layout (Lista/Extrato):** Tabela (Desktop) ou Lista densa (Mobile). Colunas/Dados: Data, Descrição, Categoria, Conta e Valor. Valores positivos em verde (Emerald), negativos em texto padrão.
*   **Layout (Filtros):** Na Web, um painel superior expansível. No Mobile, um Bottom Sheet com opções de Filtrar por Categoria, Conta, Período e Tipo.
*   **Layout (Cadastro de Despesa/Receita):**
    *   Input gigante para Valor no topo (como uma calculadora).
    *   Campos para Descrição, Data, Categoria, Conta Origem/Cartão.
    *   Toggle para "Repetir" (abre opções de Parcelamento ou Recorrência mensal).
*   **Layout (Transferência):** Exige duas contas. "De (Conta A)" para "Para (Conta B)".
*   **Navegação:** Ações em lote (Desktop) ao selecionar checkboxes na tabela (Excluir vários).
*   **Estados (Offline):** Badge "Sincronização pendente" num lançamento criado sem internet.

---

## 7. Categorias

### Telas: Lista, Nova Categoria, Editar
*   **Objetivo:** Gerenciar as gavetas organizacionais do sistema.
*   **Layout:** Lista simples com Ícone, Cor correspondente, Nome e Tipo (Despesa/Receita).
*   **Layout (Formulário):** Picker de cor (paleta pré-definida) e Grid de ícones (Lucide) selecionáveis.

---

## 8. Objetivos Financeiros (Metas)

### Telas: Lista de Objetivos, Detalhes, Criar, Editar
*   **Objetivo:** Gamificar o acúmulo de patrimônio.
*   **Layout (Lista):** Cards de progresso. Nome do objetivo, ícone, "R$ Guardado de R$ Meta". Barra de progresso circular ou horizontal grossa.
*   **Layout (Detalhes):** Gráfico de linha mostrando a evolução do saldo reservado. Botões de ação rápida: "Adicionar Dinheiro" e "Resgatar".
*   **Estados (Success):** Quando o objetivo atinge 100%, exibe badge dourada/emerald e confetes contidos na animação de conclusão.

---

## 9. Investimentos

### Telas: Carteira (Visão Geral), Detalhes do Ativo, Dividendos
*   **Objetivo:** Acompanhamento patrimonial avançado.
*   **Layout (Carteira):** Gráfico de Pizza/Donut (Alocação da carteira). Tabela de ativos com colunas: Ticker, Quantidade, Preço Médio, Cotação Atual, Lucro/Prejuízo (%).
*   **Layout (Dividendos):** Calendário anual ou tabela de eventos corporativos mostrando pagamentos.
*   **Navegação:** Tabelas ricas que permitem ordenação clicando no cabeçalho das colunas (ex: ordenar por maior lucro).

---

## 10. Relatórios

### Telas: Visão Mensal, Anual, Por Categorias, Exportação
*   **Objetivo:** Análise profunda e cruzamento de dados.
*   **Layout (Dashboard de Relatórios):**
    *   Gráfico de Barras Sobrepostas (Receitas vs Despesas do ano inteiro).
    *   Gráfico de Pizza interativo (Despesas por Categoria).
    *   Módulo de Exportação: Área com botões visíveis para baixar PDF e CSV/Excel.
*   **Responsividade:** Gráficos no mobile ganham scroll horizontal se a janela de tempo for muito longa (ex: 12 meses).

---

## 11. Perfil e Configurações

### Telas: Preferências, Segurança, Backup
*   **Objetivo:** Ajustar preferências pessoais do sistema.
*   **Layout:** Estrutura de ListSettings (Listas de opções comuns no iOS/Android).
    *   Avatar editável no topo.
    *   Seções separadas por agrupamentos: "Geral" (Tema, Idioma, Moeda), "Segurança" (Alterar Senha, 2FA), "Dados" (Exportar tudo, Excluir conta).
*   **Navegação:** Menus que abrem páginas subsequentes em slide-in.

---

## 12. Notificações

### Telas: Lista de Notificações, Detalhes
*   **Objetivo:** Central de alertas (vencimentos e orçamentos estourados).
*   **Layout:** Drawer (Desktop) que desliza da direita para a esquerda ao clicar no ícone de sino. No Mobile, uma página dedicada. Lista de itens com "bolinha azul" para não-lidos.

---

## 13. Mapas de Navegação e Fluxos

### 13.1. Mapa Completo de Navegação (Sitemap)
```text
(Auth)
 ├── Login
 ├── Cadastro
 └── Recuperar Senha

(App)
 ├── Dashboard
 ├── Extrato (Transações)
 │    ├── Nova Receita
 │    ├── Nova Despesa
 │    └── Nova Transferência
 ├── Contas e Cartões
 │    ├── Gerenciar Contas
 │    └── Faturas do Cartão
 ├── Planejamento
 │    ├── Orçamentos Mensais
 │    └── Objetivos (Metas)
 ├── Investimentos
 │    ├── Carteira
 │    └── Proventos
 ├── Relatórios
 └── Configurações
      ├── Perfil
      ├── Categorias
      └── Segurança
```

### 13.2. Fluxo Principal do Usuário (Happy Path Financeiro)
1.  Usuário visualiza **Dashboard**.
2.  Toca no **FAB (Floating Action Button)**.
3.  Abre o Bottom Sheet de **Adicionar Despesa**.
4.  Digita valor "150,00".
5.  Seleciona categoria "Supermercado".
6.  Seleciona a conta "Conta Corrente" ou "Cartão de Crédito".
7.  Clica em "Salvar".
8.  Bottom sheet fecha, **Toast** verde de sucesso é exibido.
9.  Os gráficos do **Dashboard** são recalculados instantaneamente na tela.

### 13.3. Fluxo de Autenticação e Onboarding
1.  Abre o App -> Tela de Splash.
2.  Tela de Login -> Clica em "Criar Conta".
3.  Preenche E-mail, Senha e Nome.
4.  Redirecionado ao App vazio.
5.  Modal Interceptador "Onboarding": "Bem-vindo. Vamos cadastrar sua primeira conta."
6.  Preenche saldo inicial -> Pronto para uso.

### 13.4. Fluxo de Exportação e Relatórios
1.  Acessa o menu **Relatórios**.
2.  Visualiza gráfico Anual.
3.  Clica em botão secundário **Exportar**.
4.  Modal: "Selecione o período e o formato".
5.  Seleciona "Ano 2024" e formato "PDF".
6.  Clica "Baixar" -> Estado **Loading** -> Download inicia -> Estado **Success** (Toast).
