# Documento de Arquitetura de Software (SAD) - Conta Comigo

## 1. Visão Geral da Arquitetura

O ecossistema do **Conta Comigo** baseia-se em uma arquitetura distribuída, orientada a serviços gerenciados (BaaS - Backend as a Service) e Serverless. O objetivo principal é garantir alta disponibilidade, escalabilidade instantânea e sincronização em tempo real entre os clientes Web e Mobile, mantendo uma base de código organizada e compartilhável.

### Diagrama Textual de Comunicação

```text
[Repositório: GitHub] 
       | (CI/CD / Webhooks)
       v
+------------------+         +---------------------------------------+
|  Vercel (Host)   |         |         Supabase (Backend BaaS)       |
|                  |         |                                       |
| [Web / Next.js]  |<--API-->|  [Auth] (JWT / Sessões / Google)      |
+------------------+   WSS   |  [PostgreSQL] (Dados / RLS)           |
          ^             |    |  [Storage] (Comprovantes / Avatares)  |
          |             |    |  [Realtime] (WebSockets Sync)         |
          |             |    |  [Edge Functions] (Lógicas complexas) |
     (Navegador)        |    +---------------------------------------+
                        |                      ^
                        |                      | API / WSS
                        v                      |
                 +---------------------------------------+
                 | [Mobile / React Native + Expo]        |
                 | (Cache Local / SQLite / UI Nativa)    |
                 +---------------------------------------+
                          (Dispositivo Android)
```

---

## 2. Arquitetura Monorepo

Para garantir a coesão do ecossistema e evitar duplicação de regras de negócio ou tipagens, adotaremos a abordagem de **Monorepo** (utilizando ferramentas como Turborepo, Nx ou Yarn Workspaces).

**Por que Monorepo?**
- Permite o compartilhamento de tipos (TypeScript), funções utilitárias e validações (Zod) entre Web e Mobile.
- Facilita a manutenção: uma alteração no schema do banco atualiza imediatamente as interfaces de ambas as plataformas.
- Unifica o CI/CD.

### Estrutura de Diretórios
```text
/
├── apps/
│   ├── web/               # Aplicação Next.js (React)
│   └── mobile/            # Aplicativo React Native (Expo)
├── packages/
│   ├── ui/                # Componentes compartilhados (Design System / Shadcn adaptado)
│   ├── types/             # Tipagens globais do TypeScript (Interfaces, DTOs)
│   ├── utils/             # Funções utilitárias e formatadores
│   └── validations/       # Schemas do Zod para validação universal
├── docs/                  # PRD, Documentação de Arquitetura, ERD
└── package.json
```

---

## 3. Arquitetura do Frontend Web

A aplicação Web será construída com foco em performance e SEO (onde aplicável), utilizando renderização híbrida.

- **Framework:** Next.js utilizando o **App Router**.
- **Padrão Arquitetural:** Feature-Based Architecture. O código é agrupado por domínios de negócio (ex: `/features/transactions`, `/features/accounts`) e não por tipo de arquivo.
- **Gerenciamento de Estado/Dados:** TanStack Query para server-state (caching, deduplicação, otimistas updates) e Zustand/Context API para client-state global simples (ex: tema, estado da sidebar).
- **Formulários e Validação:** React Hook Form integrado ao Zod para validação client-side robusta, sem re-renders desnecessários.
- **Componentização e UI:** Shadcn/UI combinado com TailwindCSS. Componentes base (`/packages/ui`) puros, burros e altamente reutilizáveis.
- **Comunicação:** `Supabase-js` encapsulado em Services/Hooks customizados.
- **Lazy Loading:** Utilização massiva de `next/dynamic` e React Suspense para dividir o bundle (Code Splitting), carregando gráficos e modais pesados sob demanda.

---

## 4. Arquitetura Mobile

O aplicativo Android focará na experiência fluida, responsividade nativa e suporte a cenários de baixa conectividade.

- **Core:** React Native provido pelo Expo (Bare workflow/Custom Dev Client se necessário para pacotes nativos pesados).
- **Navegação:** React Navigation (Stack, Tabs e Drawers).
- **Offline & Storage:** Utilização de bibliotecas como MMKV (para chave/valor ultra rápido) ou WatermelonDB/Expo SQLite para persistência estruturada offline, garantindo que o app abra instantaneamente sem rede.
- **Sincronização:** O app escutará mudanças locais e gerenciará uma fila de requisições offline (Offline-first approach), enviando-as ao Supabase assim que a conexão for reestabelecida.
- **Atualizações:** Expo OTA (Over-the-Air) updates para correções de UI e regras de negócio sem necessidade de passar pela Play Store. Build do APK/AAB gerenciado pelo Expo EAS.

---

## 5. Backend (Supabase)

Adotaremos o Supabase como BaaS, evitando a criação e manutenção de uma API REST tradicional em Node/Java. O frontend comunica-se diretamente com o banco, mas de forma segura.

- **PostgreSQL:** O coração do sistema. Todas as relações e constraints ficam aqui.
- **Edge Functions:** Funções serverless escritas em Deno/TypeScript, utilizadas APENAS para integrações sensíveis que não podem rodar no cliente (ex: Webhooks de pagamento bancário futuro, envio de e-mails em massa).
- **Storage:** Buckets configurados para armazenamento de comprovantes (privado) e fotos de perfil (público).
- **Realtime:** Broadcasters e Presence do Supabase habilitados em tabelas críticas (como `transactions` e `accounts`) para empurrar atualizações para os clientes Web e Mobile.
- **Triggers e Functions (RPC):** Cálculos pesados (ex: recalcular saldos consolidados de 5 anos) ou atualizações em cascata ocorrerão via Triggers diretamente no banco para máxima performance.

---

## 6. Banco de Dados

- **Estratégia:** Relacional, fortemente tipado, com alta normalização nas tabelas core para evitar anomalias de atualização, desnormalizando apenas em views materializadas para dashboards de alta performance.
- **Relacionamentos:** Uso rigoroso de Foreign Keys (FK) e restrições de exclusão (ON DELETE CASCADE ou RESTRICT, dependendo da regra de negócio).
- **Índices:** Índices B-Tree aplicados nas chaves estrangeiras (`user_id`, `account_id`) e em colunas de filtro frequente (`date`, `category_id`).
- **Versionamento e Migrações:** Gerenciados via Supabase CLI (`supabase db diff` e `supabase db push`). O schema evolui de forma controlada através de arquivos SQL na pasta `supabase/migrations`.

---

## 7. Autenticação

A identidade do usuário é central para a segurança do sistema multitenant.

- **Mecanismo:** Supabase Auth emitindo JWTs (JSON Web Tokens).
- **Provedores:** Login Nativo (E-mail/Senha) e OAuth (Google).
- **Sessão:** 
  - **Web:** Sessões mantidas via HttpOnly Cookies (preferencial para SSR no Next.js) ou local storage com atualização silenciosa de Refresh Token.
  - **Mobile:** Sessão armazenada no SecureStorage/Keychain.
- **Fluxos:** Recuperação de senha baseada em Deep Links e Magic Links.
- **Evolução:** Arquitetura já preparada para adoção de 2FA (TOTP) utilizando a API nativa do Supabase Auth no futuro.

---

## 8. Sincronização

A sincronização entre plataformas é o maior diferencial do sistema.

- **Web:** TanStack Query gerencia o cache. Ao criar uma transação no celular, um evento Supabase Realtime notifica o Web. O TanStack Query invalida a query de `transactions` e refaz o fetch (ou aplica o payload diretamente no cache), atualizando a tela sem refresh.
- **Android (Offline-First):**
  - **Leitura:** O app lê primeiramente do cache local.
  - **Escrita (Optimistic UI):** O usuário adiciona uma despesa. A UI reflete instantaneamente, o saldo é recalculado localmente.
  - **Fila:** A mutação entra em uma fila de sincronização. Se online, envia para o Supabase. Se offline, aguarda.
- **Conflitos:** A reconciliação adotará a estratégia *Last Write Wins* (A última gravação vence) baseada em `updated_at`, aliada à rastreabilidade de concorrência.
- **Cache:** Configurações de Stale Time longas para dados imutáveis e curtas para fluxos financeiros dinâmicos.

---

## 9. Segurança

- **Row Level Security (RLS):** É a barreira definitiva. Nenhuma query REST/GraphQL contorna o banco. Cada tabela terá políticas baseadas no JWT. Exemplo: `CREATE POLICY "Garantir posse" ON accounts FOR ALL USING (auth.uid() = user_id);`
- **Rate Limit:** Limitadores de taxa no Supabase e na camada de borda (Vercel Edge) para prevenir abusos de endpoints.
- **XSS & CSRF:** 
  - O React anula a maior parte do XSS fazendo escaping automático.
  - Políticas rigorosas de CORS.
  - Formulários protegidos contra CSRF por design de JWT/Cookies no Next.js App Router.
- **SQL Injection:** Totalmente mitigado pelas bibliotecas ORM/Query Builders (Supabase SDK), que utilizam prepared statements.
- **Auditoria:** Tabelas sensíveis terão Triggers para salvar logs em uma tabela `audit_logs` separada (ex: alterações grandes em saldos iniciais).

---

## 10. Performance

- **Web (Next.js):** 
  - **SSR/CSR:** O Dashboard principal utilizará SSR para o carregamento inicial ultra-rápido, passando o estado hidratado para o CSR, que assume a responsividade com TanStack Query.
  - **Paginação / Virtualização:** Listas de extratos com milhares de itens (ex: 5 anos de histórico) utilizarão paginação via cursor (Infinite Scroll) e virtualização de lista (ex: `@tanstack/react-virtual`) para manter o DOM leve e garantir 60fps na rolagem.
  - **Memoização:** Uso consciente de `React.memo`, `useMemo` e `useCallback` estritamente em componentes de alta frequência de re-render (ex: gráficos e listas pesadas).

---

## 11. Escalabilidade

- **Crescimento de Usuários:** A arquitetura Serverless (Next.js Edge + Vercel) suporta picos de tráfego instantâneos. O Supabase, baseado no PostgreSQL, utiliza Connection Poolers nativos (Supavisor) para aguentar dezenas de milhares de conexões simultâneas sem derrubar o banco de dados.
- **Crescimento de Código:** A estrutura Monorepo e o padrão Feature-Based permitem que a equipe cresça e adicione módulos (ex: Seguros, Cripto, Consórcios) de forma isolada, sem tocar no código das Features existentes (Open-Closed Principle).

---

## 12. Convenções do Projeto

- **Nomenclatura:** 
  - Arquivos e pastas: `kebab-case` (ex: `transaction-list.tsx`).
  - Componentes React: `PascalCase` (ex: `TransactionList`).
  - Funções/Hooks/Variáveis: `camelCase` (ex: `useTransactions`).
  - Banco de dados (Tabelas/Colunas): `snake_case` (ex: `account_balance`).
- **Commits:** Conventional Commits (ex: `feat: add transaction form`, `fix: header layout on mobile`).
- **Versionamento:** Git Flow simplificado. `main` (produção), `develop` (staging/integração) e branches por feature `feature/nome-da-feature`.
- **Imports:** Utilização de Path Aliases absolutos (ex: `@/features/...`, `@repo/ui/...`).

---

## 13. Fluxo de Desenvolvimento

A criação de qualquer nova funcionalidade (ex: Módulo de Empréstimos) deverá seguir rigorosamente o pipeline abaixo:

1. **Planejamento:** Revisão do PRD, entendimento do fluxo de tela e regras de negócio.
2. **Banco e Tipagens:** Criação da Migração SQL (Supabase) + Atualização do RLS. Geração e exportação dos novos Tipos/Interfaces TypeScript no pacote `@packages/types`.
3. **Backend Lógico:** Criação de Edge Functions ou Triggers no PostgreSQL (se houver regras de negócio pesadas, ex: cálculo de juros compostos).
4. **Camada de Dados (Hooks):** Criação dos hooks com TanStack Query (`useLoans.ts`) consumindo o SDK do Supabase.
5. **Frontend (Web/Mobile):** Criação da UI isolada, integrando com os hooks criados.
6. **Testes e Validações:** Testes unitários das funções complexas de cálculo e testes E2E básicos no fluxo feliz.
7. **Documentação:** Atualização do `ROADMAP.md` e Changelog.
8. **Code Review & Deploy:** Pull Request para `develop`, revisão de arquitetura e deploy automático pela Vercel/Expo.

---

## 14. Roadmap Técnico

O desenvolvimento será segmentado em ciclos técnicos evolutivos para mitigar riscos precocemente.

- **Fase 1: Infraestrutura e Fundações (Em Andamento)**
  - Setup do Monorepo (Turborepo).
  - Setup Next.js, React Native e Pacotes (UI, Types).
  - Provisionamento de Banco e Configuração do Supabase (Auth, RLS default).
  - CI/CD Pipelines Base.

- **Fase 2: Identidade e Autenticação**
  - Modelagem da Tabela de Profiles.
  - Telas de Autenticação Web e Mobile.
  - Proteção de Rotas (Middlewares Next.js e Auth Context no Mobile).

- **Fase 3: Core Domain (Cadastros Base)**
  - Tabelas de Accounts e Categories com RLS refinado.
  - CRUD de Contas e Categorias (Web/Mobile).
  - Validações globais com Zod.

- **Fase 4: Motor Transacional e Sincronização**
  - Tabela Transactions.
  - Implementação do Caching e Optimistic Updates no TanStack Query.
  - Setup do Supabase Realtime (WebSockets) para sincronização da tela de histórico.

- **Fase 5: Inteligência e Dashboards**
  - Triggers para consolidação de balanços mensais.
  - Implementação de Recharts (Web) para gráficos.
  - Componentes de Calendário e Relatórios.

- **Fase 6: Complexidades de Domínio**
  - Módulos paralelos: Objetivos Financeiros e Lançamentos em Cartão de Crédito (Parcelamentos lógicos).

- **Fase 7: Polimento Mobile e Offline**
  - Implementação pesada do SQLite/WatermelonDB.
  - Fila de sincronização (Sync Queue) em Background.
  - Push Notifications para vencimentos (FCM/Expo Notifications).

- **Fase 8: Produção e Escalabilidade**
  - Load Testing, refinamento de Índices SQL.
  - Exportação de Dados e Funcionalidades LGPD.
  - Lançamento Oficial (Vercel Prod / Play Store).
