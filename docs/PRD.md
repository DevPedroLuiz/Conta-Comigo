# Product Requirements Document (PRD) - Conta Comigo

## 1. Visão Geral do Produto

### Problema
A maioria das pessoas possui múltiplas contas bancárias, cartões de crédito e investimentos espalhados em diferentes instituições. A falta de uma visão unificada e em tempo real do patrimônio e do fluxo de caixa gera descontrole financeiro, endividamento e dificuldade em atingir metas financeiras. Além disso, a falta de sincronia perfeita entre dispositivos móveis e web frustra usuários que buscam conveniência.

### Solução
O **Conta Comigo** é um ecossistema de gestão financeira pessoal composto por uma aplicação Web e um aplicativo Android nativo. Ele atua como um hub centralizado, permitindo o acompanhamento de receitas, despesas, cartões de crédito, orçamentos e investimentos em tempo real, com sincronização instantânea entre as plataformas.

### Público-alvo
Jovens adultos, profissionais liberais, chefes de família e investidores iniciantes/intermediários (faixa etária de 20 a 55 anos) que buscam organização financeira, controle de gastos e crescimento de patrimônio, e que valorizam interfaces modernas, limpas e sem atrito.

### Objetivos
- Fornecer uma visão 360º das finanças do usuário.
- Reduzir o tempo gasto no fechamento de orçamentos mensais.
- Ajudar na previsibilidade financeira através de alertas e projeções.
- Garantir retenção de usuários através de uma experiência Multiplataforma (Web e Mobile) perfeitamente sincronizada.

### Diferenciais
- **Sincronização Real-Time:** Alterações na Web refletem no Android instantaneamente (e vice-versa).
- **Design Premium:** Interface limpa, minimalista, inspirada em produtos como Linear, Stripe e Apple.
- **Ecossistema Fechado:** Aplicativo Android verdadeiramente nativo (.apk), não apenas um WebView.
- **Gestão de Investimentos Nativa:** Diferente de apps básicos, inclui controle de rentabilidade, dividendos e evolução patrimonial.

### Benefícios
- Tranquilidade financeira através do controle absoluto dos gastos.
- Maior capacidade de poupança com o módulo de "Objetivos Financeiros".
- Prevenção contra juros de cartões de crédito por meio de lembretes e visões de limite/faturas.

---

## 2. Personas

### Persona 1: O Planejador Metódico
- **Nome:** Carlos Eduardo
- **Idade:** 35 anos
- **Profissão:** Engenheiro de Software
- **Objetivos:** Alcançar a independência financeira aos 50 anos e diversificar investimentos.
- **Dificuldades:** Cansado de atualizar planilhas manuais e consolidar dados de 4 corretoras e bancos diferentes.
- **Necessidades:** Gráficos detalhados, controle de dividendos (Ações/FIIs) e exportação de dados (Excel).

### Persona 2: A Autônoma Dinâmica
- **Nome:** Mariana Silva
- **Idade:** 28 anos
- **Profissão:** Designer Freelancer
- **Objetivos:** Separar o dinheiro pessoal do profissional e ter previsibilidade de renda.
- **Dificuldades:** Renda variável todos os meses, o que dificulta saber quanto pode gastar.
- **Necessidades:** Fluxo de caixa claro, orçamentos flexíveis por categoria e relatórios mensais fáceis de ler.

### Persona 3: O Gestor Familiar
- **Nome:** Roberto Mendes
- **Idade:** 45 anos
- **Profissão:** Gerente Comercial
- **Objetivos:** Pagar as contas da casa em dia, pagar a escola dos filhos e economizar para viagens.
- **Dificuldades:** Muitos cartões de crédito da família para gerenciar, perdendo datas de vencimento.
- **Necessidades:** Alertas de vencimento, módulo robusto de cartões (vencimento/fechamento) e visão de despesas fixas (assinaturas).

### Persona 4: A Iniciante Financeira
- **Nome:** Ana Clara
- **Idade:** 22 anos
- **Profissão:** Estudante e Estagiária
- **Objetivos:** Guardar dinheiro para um intercâmbio e comprar o primeiro carro.
- **Dificuldades:** Orçamento apertado, gasta muito com delivery e não sabe para onde o dinheiro vai.
- **Necessidades:** Criação de metas (Objetivos), orçamentos com alertas de limite e interface gamificada/intuitiva (poucos cliques).

### Persona 5: O Empreendedor Multi-Contas
- **Nome:** Fernando Costa
- **Idade:** 50 anos
- **Profissão:** Empresário
- **Objetivos:** Ter um "Raio-X" diário de seu patrimônio líquido.
- **Dificuldades:** Dificuldade em visualizar o saldo total consolidado devido à alta fragmentação bancária.
- **Necessidades:** Dashboard poderoso, alta segurança (2FA) e sincronização impecável entre o celular (na rua) e o PC (no escritório).

---

## 3. Casos de Uso

**Autenticação e Perfil**
- Fazer Cadastro (E-mail/Senha e Google).
- Fazer Login.
- Recuperar Senha.
- Editar Perfil (Foto, Nome, Moeda, Idioma, Tema).
- Ativar/Desativar Autenticação em 2 Fatores (2FA).

**Contas e Cartões**
- Cadastrar/Editar/Excluir Conta Bancária (com saldo inicial).
- Cadastrar/Editar/Excluir Cartão de Crédito (Limite, Dia de Fechamento, Vencimento).

**Transações (Receitas, Despesas e Transferências)**
- Cadastrar Receita (Simples, Parcelada, Recorrente).
- Cadastrar Despesa (Simples, Parcelada, Recorrente, via Conta ou Cartão).
- Realizar Transferência entre Contas.
- Anexar Comprovantes em Transações.
- Editar/Excluir Transações (Refletindo em parcelas futuras ou isoladamente).

**Investimentos**
- Cadastrar/Editar/Excluir Ativo (Ações, FIIs, Cripto, Renda Fixa).
- Registrar Recebimento de Dividendos/Rendimentos.

**Planejamento e Metas**
- Criar Objetivo Financeiro (Ex: "Viagem Europa").
- Adicionar/Resgatar saldo de um Objetivo.
- Criar Limite de Orçamento Mensal por Categoria.

**Visões e Relatórios**
- Visualizar Dashboard (Saldo Total, Fluxo Mensal).
- Visualizar Calendário Financeiro.
- Gerar Relatório Mensal/Anual.
- Exportar Dados (PDF, Excel).

---

## 4. Regras de Negócio

1. **Consistência de Saldo:** O "Saldo Atual" de uma conta deve ser a soma do "Saldo Inicial" com todas as transações (Receitas - Despesas + Transferências In - Transferências Out) até a data atual.
2. **Transferências Duplas:** Uma transferência sempre debita de uma conta de origem e credita em uma conta de destino. Se excluída, ambas as movimentações são desfeitas.
3. **Cartão de Crédito e Faturas:** Despesas feitas no Cartão de Crédito não afetam o saldo das contas bancárias imediatamente. Elas entram na Fatura. O saldo da conta só é impactado quando há uma transação de "Pagamento de Fatura".
4. **Fechamento de Fatura:** Lançamentos feitos no dia do fechamento do cartão (ou após) devem ser contabilizados para a fatura do mês subsequente.
5. **Transações Recorrentes:** Receitas ou Despesas marcadas como "Recorrentes" devem projetar lançamentos futuros automaticamente (infinitamente ou até um limite definido de meses).
6. **Transações Parceladas:** Uma compra de R$ 1.200 em 12x no cartão deve gerar 12 despesas vinculadas de R$ 100, alocadas nos meses respectivos. A exclusão de uma compra parcelada deve perguntar se o usuário deseja excluir apenas a atual ou todas as subsequentes.
7. **Exclusão Lógica (Soft Delete):** Dados críticos podem ser apenas inativados no banco para garantir rastreabilidade, mas ocultos para o usuário (dependerá da implementação do banco).
8. **Categorias Customizadas:** O sistema deve vir com categorias padrão, mas o usuário tem liberdade para criar, editar (cor, ícone) e excluir as suas próprias, desde que não haja transações vinculadas a elas (ou realocar transações na exclusão).
9. **Isolamento de Dados:** Usuário `A` jamais, sob nenhuma hipótese, pode acessar registros do Usuário `B` (Row Level Security restrito ao `user_id`).

---

## 5. Requisitos Funcionais

- **RF-001:** O sistema deve permitir o cadastro de contas de usuário via E-mail/Senha e OAuth (Google).
- **RF-002:** O sistema deve permitir a recuperação de senha via link de e-mail.
- **RF-003:** O sistema deve possuir um Dashboard consolidado mostrando Saldo Geral, Saldo Investido, Receitas, Despesas e Gráfico de Fluxo de Caixa.
- **RF-004:** O usuário deve poder cadastrar contas bancárias, especificando Nome, Tipo, Instituição, Cor, Ícone e Saldo Inicial.
- **RF-005:** O usuário deve poder cadastrar cartões de crédito informando Limite, Dia de Vencimento e Dia de Fechamento.
- **RF-006:** O sistema deve permitir o registro de despesas, vinculando-as a Categorias, e especificando a fonte de pagamento (Conta Bancária ou Cartão de Crédito).
- **RF-007:** O sistema deve suportar despesas e receitas parceladas, gerando múltiplos registros automaticamente no banco de dados.
- **RF-008:** O sistema deve suportar transações recorrentes mensais, anuais ou semanais.
- **RF-009:** O sistema deve permitir upload de comprovantes (arquivos/imagens) atrelados a transações.
- **RF-010:** O sistema deve possuir gestão de assinaturas recorrentes com visibilidade isolada.
- **RF-011:** O módulo de investimentos deve permitir registro manual de compras e vendas de ativos e recebimento de proventos.
- **RF-012:** O usuário deve poder definir orçamentos mensais com alertas baseados em categorias (ex: Limite de R$ 500 em Delivery).
- **RF-013:** O sistema deve ter um Calendário Financeiro onde transações futuras e passadas são plotadas nos dias do mês.
- **RF-014:** O usuário deve ser capaz de criar Metas/Objetivos financeiros, definindo um valor alvo e acompanhando o progresso através do saldo alocado.
- **RF-015:** O sistema deve emitir relatórios comparativos entre meses (Receitas vs Despesas).
- **RF-016:** O sistema deve permitir a exportação dos extratos em formatos PDF e CSV/Excel.
- **RF-017:** O usuário deve poder personalizar seu perfil (tema dark/light, idioma, moeda base).
- **RF-018:** O sistema deve enviar Lembretes e Push Notifications para contas a vencer (Mobile) e alertas in-app (Web).

---

## 6. Requisitos Não Funcionais

- **RNF-001 (Segurança - RLS):** Todas as tabelas do banco de dados (Supabase) devem possuir políticas rigorosas de Row Level Security.
- **RNF-002 (Performance):** A aplicação frontend deve utilizar lazy loading para rotas e componentes pesados. Imagens devem ser otimizadas. As respostas de API devem ocorrer, em média, abaixo de 300ms.
- **RNF-003 (Sincronização):** Alterações de dados (Web ou Mobile) devem ser sincronizadas via Supabase Realtime/Websockets e refletidas no outro cliente em menos de 2 segundos.
- **RNF-004 (Offline-first):** O aplicativo Mobile (React Native) deve possuir cache local robusto, permitindo visualização do extrato sem conexão à internet e enfileirando requisições de criação de transações quando offline.
- **RNF-005 (Responsividade):** A interface Web deve ser 100% responsiva (Mobile-first em CSS), adaptando-se a smartphones, tablets e desktops.
- **RNF-006 (Escalabilidade):** A arquitetura Serverless (Next.js Edge/Supabase Functions) deve escalar automaticamente para suportar milhares de usuários simultâneos.
- **RNF-007 (Disponibilidade):** O sistema deve visar um uptime de 99.9%.
- **RNF-008 (LGPD):** Os dados dos usuários devem ser criptografados. O sistema deve prover funcionalidade para que o usuário baixe todos os seus dados e exclua sua conta definitivamente.
- **RNF-009 (Acessibilidade):** O frontend deve garantir contraste adequado (WCAG) e suporte à navegação via teclado para as funcionalidades principais.
- **RNF-010 (Backup):** O banco de dados Supabase deve possuir rotinas automatizadas de backup PITR (Point-in-Time Recovery).

---

## 7. Fluxo Geral do Usuário

1. **Onboarding:** O usuário se cadastra (Google ou Email). É apresentado a uma tela de boas-vindas.
2. **Setup Inicial:** O sistema pede para cadastrar a primeira Conta Bancária informando o Saldo Atual.
3. **Exploração:** O usuário é levado ao Dashboard principal (ainda vazio, com Call to Actions).
4. **Primeiro Lançamento:** O usuário cadastra suas despesas fixas do mês (Aluguel, Luz) e sua renda mensal.
5. **Visualização:** Os gráficos do Dashboard ganham vida, mostrando a sobra projetada de caixa.
6. **Maturidade de Uso:** O usuário cadastra seu Cartão de Crédito. Ele começa a lançar os gastos diários (Ifood, Uber) pelo aplicativo Mobile (Android) enquanto está na rua.
7. **Fechamento:** Ao fim do mês, ele acessa o sistema Web no computador, analisa os Relatórios de Categorias para entender os gargalos, ajusta o Orçamento do mês seguinte e acompanha o avanço do seu "Objetivo" de viagem.

---

## 8. Estrutura dos Módulos

- **Autenticação:** (Login, Signup, Recovery).
- **Dashboard:** Visão consolidada, widgets e gráficos rápidos.
- **Contas Bancárias:** Gerenciamento de saldos diretos.
- **Cartões de Crédito:** Faturas, limites, dias de vencimento.
- **Transações:** Motor principal de Receitas, Despesas e Transferências.
- **Categorias & Tags:** Motor de organização.
- **Planejamento:** Orçamentos (Budgets) e Metas (Objetivos).
- **Investimentos:** Gerenciamento patrimonial.
- **Assinaturas & Contas Fixas:** Visão isolada para previsibilidade.
- **Relatórios:** Dashboards avançados, exportações.
- **Configurações & Perfil:** Temas, 2FA, LGPD.

---

## 9. Roadmap Inicial

**Fase 1: Planejamento, Arquitetura e Setup (Concluída)**
- Definição do PRD.
- Configuração do Repositório (Lógica Monorepo).
- Provisionamento do Banco e RLS (Supabase).
- Setup Vite + Tailwind + Shadcn.

**Fase 2: Autenticação e Perfil**
- Integração Supabase Auth.
- Telas de Login, Cadastro e Esqueceu a Senha.
- Componente de Layout Autenticado (Sidebar + Header protegidos).

**Fase 3: Core Financeiro (O Coração)**
- CRUD de Contas Bancárias.
- CRUD de Categorias.
- CRUD Simples de Transações (Receitas e Despesas unificadas).
- Dashboard Básico (Cálculo de Saldos).

**Fase 4: Cartões e Complexidade de Transações**
- CRUD de Cartões de Crédito.
- Lançamentos em Cartão (Vinculação a faturas).
- Parcelamentos e Recorrências.
- Transferências entre contas.

**Fase 5: Ferramentas de Visualização**
- Extrato Detalhado com Filtros e Buscas.
- Gráficos de Fluxo de Caixa (Dashboard Avançado).
- Relatórios Mensais por Categoria.

**Fase 6: Planejamento e Inteligência**
- Módulo de Objetivos Financeiros (Metas).
- Definição e acompanhamento de Orçamentos mensais.
- Calendário Financeiro.

**Fase 7: Investimentos e Exportação**
- Carteira de Investimentos básica.
- Exportação PDF/CSV.

**Fase 8: Sincronização Mobile & Polimento Final**
- Inicialização e integração do App Android (React Native).
- Setup de WebSockets/Realtime para sincronização UI imediata.
- Notificações (Push e In-App).
