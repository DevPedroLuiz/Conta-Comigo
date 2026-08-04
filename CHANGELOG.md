# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Sprint 8:** Relatórios Financeiros.
- Módulo `reports` criado com `ReportService`, `ReportRepository`, e `Types` para consolidar o fluxo de caixa.
- `ReportsPage`: Página dedicada a relatórios financeiros avançados.
- Filtros dinâmicos (`ReportFiltersComponent`) por período (Data Inicial/Final), Tipo (Receita/Despesa), Conta e Categoria.
- Visualização de fluxo de caixa em gráfico de área preenchida (`CashFlowChart`).
- Distribuição percentual em gráficos de rosca para Receitas e Despesas (`CategoryBreakdownChart`).
- Funcionalidade de exportação em lote para formato CSV utilizando `papaparse`.
- Funcionalidade de exportação em PDF utilizando `jspdf` e `jspdf-autotable`.
- Atualização do `MainLayout` para incluir link de navegação da página de Relatórios.
- Testes unitários para regras de cálculo do `ReportService`.
- **Sprint 7:** Metas Financeiras.
- Migration `goals` criada (`supabase/migrations/20260803140000_create_goals.sql`) com Constraints e Políticas RLS.
- CRUD de Metas no módulo `goals` (GoalService, GoalRepository, Schema e Types).
- Páginas e componentes para gestão de metas:
  - Componente de lista e cards (`GoalList`, `GoalCard`).
  - Formulário para criação/edição (`GoalForm`).
  - Progress bar (`GoalProgress`).
  - Lógica para adicionar progresso (`GoalAddProgressDialog`).
- Fechamento automático de status para `completed` quando a meta é alcançada.
- Integração da métrica de metas ativas e resumo de progresso ao painel do `DashboardPage`.
- Proteção RLS garantindo que metas pertençam apenas aos seus usuários.
- Testes unitários para `GoalService` incluindo cálculo de progresso e regras de negócio.
- **Sprint 6:** Gestão de Categorias Financeiras.
- Migration `categories` atualizada (`supabase/migrations/20260803130000_categories_update.sql`) com Constraints, Índices e RLS.
- CRUD de Categorias Personalizadas no módulo `categories` com Zod e React Hook Form.
- Adicionado tipo de categoria para suportar "Receita" (INCOME) e "Despesa" (EXPENSE).
- Adicionado campo `is_default` para categorias pré-existentes.
- Componentes visuais para exibição de categorias separadas por tipo (`CategoryList`, `CategoryCard`).
- Testes unitários para `CategoryService` garantindo restrições de edição de categorias padrão.
- **Sprint 5:** Gestão de Contas Financeiras.
- Migration `accounts` atualizada (`supabase/migrations/20260803121500_accounts_update.sql`) com Constraints, Índices e RLS (Segurança por usuário).
- CRUD de Contas no módulo `accounts` com React Hook Form e Zod.
- Componentes visuais para listar contas, visualizar Patrimônio Total (`AccountSummary`) e gerenciar formulários.
- Integração do card "Patrimônio Total" atualizado no Dashboard.
- `AccountService` e `AccountRepository` implementando regras de negócio e camada de acesso.
- Testes unitários para `AccountService` garantindo regras e cálculos de saldo.
- **Sprint 4:** Gestão de Transações.
- Migration `transactions` criada (`supabase/migrations/20260803120000_create_transactions.sql`) com Constraints, Foreign Keys e Índices apropriados.
- RLS configurado e Segurança por usuário implementada (SELECT, INSERT, UPDATE, DELETE atrelados ao auth.uid()).
- `TransactionsPage`: Listagem de transações com filtros por tipo, período e categoria, além de tabela contendo histórico e ações.
- `TransactionCreatePage` e `TransactionEditPage`: Páginas utilizando `TransactionForm` para operações de CRUD de transações financeiras.
- Validação no frontend utilizando Zod (`transactionSchema`) com restrições rigorosas (valor positivo obrigatório).
- `TransactionRepository`: Padrão de acesso a dados integrado com Supabase contendo RLS policies, limitando o usuário a ver/gerenciar apenas suas movimentações.
- `TransactionService`: Centralização das regras de negócios com validações antes da persistência de receitas e despesas.
- Integração do roteamento `/transactions`, `/transactions/new` e `/transactions/:id/edit` acoplado ao `MainLayout` e `OnboardingGuard`.
- Testes unitários para regras de negócios do serviço de transações (`TransactionService.test.ts`).
- **Sprint 3:** Dashboard Financeiro.
- `DashboardPage`: Página principal exibindo visão geral financeira.
- Resumo financeiro com componentes `BalanceCard`, `IncomeCard` e `ExpenseCard`.
- Exibição de transações recentes através do componente `RecentTransactions`.
- Gráfico de distribuição de despesas por categoria via `ExpenseChart` utilizando `recharts`.
- Integração de `DashboardRepository` focado na conexão Supabase para sumarização de gastos e despesas e `DashboardService` para regras de negócios.
- Testes unitários para regras de negócio do Dashboard (`DashboardService.test.ts`).
- Atualização do `MainLayout` para suportar sidebar e topbar com navegação ativa e avatar do usuário logado.
- Inclusão do `OnboardingGuard` no pipeline de roteamento (`router.tsx`) assegurando que usuários passem pelo setup antes de acessar o Dashboard.
- **Sprint 2:** Onboarding e Configuração Inicial.
- Fluxo de `OnboardingPage` utilizando um formulário multi-step (`react-hook-form` + `zod`).
- Tela de boas-vindas com botão "Começar".
- Configuração Inicial (Moeda, Idioma, Formato de Data, Primeiro dia, Tema).
- Perfil Inicial (Nome, Foto, Fuso Horário).
- Conta Financeira Inicial (Nome, Tipo, Saldo).
- Categorias Padrão listadas por padrão.
- Integração de UI via `components.json` e Radix/Shadcn (Select, Input, Card, Badge, etc).
- `OnboardingService` e `OnboardingRepository` utilizando o padrão Repository Pattern.
- Testes unitários para regras de negócio do Onboarding (`OnboardingService.test.ts`).
- **Sprint 1D:** Authentication Screens.
- Telas de Autenticação utilizando os componentes criados na Sprint 1C.
- `LoginPage`: Formulário de login, exibir/ocultar senha, remember me.
- `RegisterPage`: Formulário de cadastro com nome, e-mail, senhas, e checkbox de termos.
- `ForgotPasswordPage`: Recuperação de senha com estado de sucesso inline.
- `ResetPasswordPage`: Tela para definir nova senha.
- `VerifyEmailPage`: Tela estática de feedback instruindo o usuário a verificar o e-mail.
- Integração total de todas as telas com `react-hook-form` e zod schemas estendidos.
- Fluxos integrados com `AuthService` e exibição de erro/sucesso via `sonner` (Toast) e `Alert`.
- Atualização do `router.tsx` roteando a árvore `/` para as novas páginas.
- **Sprint 1C:** Foundation UI.
- Implementação de todos os componentes base visuais da aplicação em `src/core/ui/components`.
- Componentes interativos baseados em Radix UI: `Avatar`, `Checkbox`, `Dialog`, `DropdownMenu`, `RadioGroup`, `Select`, `Switch`, `Tooltip`.
- Componentes de layout e estrutura: `Card`, `Separator`, `Drawer` (via Vaul).
- Elementos de formulário: `Button`, `Input`, `Label`, `Textarea`.
- Elementos de tipografia e display: `Typography`, `Badge`, `Spinner`, `Skeleton`.
- Componentes de Feedback Visual: `Alert`, `EmptyState`, `ErrorState`, `SuccessState`, `Toast` (via Sonner).
- Layouts de página estruturados: `Container`, `PageLayout`, `ContentLayout` em `src/core/ui/layout`.
- Todos os componentes possuem suporte a tema claro/escuro, responsividade, variantes dinâmicas via `cva` e acessibilidade seguindo WCAG.
- **Sprint 1B:** Infraestrutura de Autenticação completa.
- Schemas Zod robustos (`LoginDTO`, `SignupDTO`, `ResetPasswordDTO`, `UpdatePasswordDTO`) em `src/core/utils/schemas/auth.schemas.ts`.
- Repositório base de acesso ao banco (`AuthRepository`) e Serviço lógico com tratamento de erros (`AuthService`).
- Hooks customizados reativos para a UI: `useAuth`, `useSession`, `useUser`.
- `AuthProvider` reescrito para persistência e sincronização de sessão cross-tab com `authState` explícito (Loading, Offline, ExpiredSession, etc).
- Guardas de Rota: `AuthGuard` para páginas privadas e `GuestGuard` para públicas.
- Implementação dos testes unitários para Services, Hooks e Validações Zod (Vitest pattern).
- Separação forte da arquitetura entre Domínio, Repositório e View (Clean Architecture).

- **Sprint 1A:** Configuração inicial da arquitetura do projeto.
- Estrutura de pastas Monorepo simulado (`/src/modules`, `/src/core`, `/src/app`).
- Cliente do Supabase (`/src/core/services/supabase.ts`).
- React Context Providers (`AppProvider`, `AuthProvider`, `ThemeProvider`).
- Configurações do ambiente (`.env.example`).
- Layouts base (`MainLayout`, `AuthLayout`).
- Configurações de Linting e Code Quality (`eslint.config.js`, `.prettierrc`, `commitlint.config.js`, Husky dependencies).
- Instalação e base estrutural para Shadcn UI (`components.json`, `index.css` Tailwind variables, `utils/index.ts`).
- Estrutura base de rotas via React Router.
- Utilitários Zod + React Hook Form base (`schemas.ts` removido em 1B e migrado para escopos locais).

