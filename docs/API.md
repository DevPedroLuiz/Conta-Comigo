# Documentação da Camada de Comunicação (API e Serviços) - Conta Comigo

## 1. Filosofia da API

O Conta Comigo não utiliza uma API REST tradicional desenvolvida do zero (ex: Node.js/Express). Em vez disso, adota a filosofia de **Backend as a Service (BaaS)** impulsionada pelo Supabase. Toda a comunicação ocorre diretamente entre os clientes (Web/Mobile) e a infraestrutura do Supabase.

*   **Supabase Client (SDK):** Principal método de comunicação. O frontend fará chamadas diretas ao banco (via PostgREST under the hood), garantindo respostas ultrarrápidas.
*   **Edge Functions:** Serão utilizadas APENAS para lógicas restritas que não podem ocorrer no cliente (ex: Webhooks bancários, agendamentos/cron jobs para recorrências, disparo em massa de emails, integrações externas sensíveis).
*   **Realtime:** Padrão Pub/Sub. Clientes assinam canais baseados no banco de dados para receber mutações (INSERTS/UPDATES) de forma passiva, atualizando a interface sem polling.
*   **Storage:** APIs específicas do Supabase para upload e gerenciamento de mídias (comprovantes e avatares), utilizando buckets protegidos por Row Level Security (RLS).

---

## 2. Fluxo de Comunicação

```text
[Cliente Web / Mobile] 
   |
   | (1) Login/OAuth (Supabase Client Auth)
   v
[Supabase Auth] ---> Retorna JWT (Acesso e Refresh Token)
   |
   | (2) Requisições de Dados (SDK injetando JWT)
   v
[PostgREST / Supabase] ---> Valida JWT + Row Level Security (RLS)
   |
   |---> (Sucesso) Retorna Dados do PostgreSQL
   |
   | (3) Subscrição de Websockets (Supabase Realtime)
   v
[Cliente escuta eventos] <--- PostgreSQL dispara mutações
   |
   | (4) Upload de Arquivos (Storage API)
   v
[Supabase Storage] ---> Valida RLS e salva arquivo no Bucket S3
```

---

## 3. Organização da Camada de Serviços

No frontend (simulando estrutura de Monorepo), a camada de dados será isolada da interface visual.

*   **`services/`:** Configuração base dos clientes (instância do `supabase` client). Define a base de conexão.
*   **`repositories/`:** Funções puras que encapsulam as consultas diretas ao Supabase (ex: `fetchTransactions`, `createAccount`). Separam o SDK da inteligência de estado.
*   **`hooks/`:** Abstrações customizadas do React (ex: `useTransactions`, `useProfile`) que combinam os repositories com o TanStack Query.
*   **`queries/` (TanStack Query):** Responsáveis pela leitura (GET). Definem as chaves de cache (Query Keys) e tempos de Stale.
*   **`mutations/` (TanStack Query):** Responsáveis pela escrita (POST/PUT/DELETE). Onde configuramos os *Optimistic Updates* e as invalidações de cache (`queryClient.invalidateQueries`).
*   **`providers/`:** Contextos React para injetar estados globais críticos (como o status de Autenticação e a Sessão ativa do usuário).

---

## 4. Especificação dos Módulos

### Autenticação & Perfil
*   **Objetivo:** Identificar o usuário, manter sessões seguras e armazenar preferências.
*   **Operações:** Sign Up, Sign In (Email/Senha, Google OAuth), Sign Out, Reset de Senha, Atualizar Perfil.
*   **Fluxo de comunicação:** Client -> Supabase Auth -> Tabela `profiles` via Triggers de criação de usuário.
*   **Validações:** Regras robustas com Zod (força de senha, regex de e-mail).
*   **Erros esperados:** "Credenciais inválidas", "E-mail já cadastrado", "Token expirado".

### Contas & Categorias
*   **Objetivo:** Estrutura base onde os saldos existem e como as transações são classificadas.
*   **Operações:** Listar, Criar, Editar, Inativar (Soft Delete).
*   **Eventos Realtime:** Se o saldo da conta for atualizado via Mobile, a tela Web reflete imediatamente.
*   **Validações:** Nome não pode ser vazio, Saldo Inicial deve ser um número válido.
*   **Erros esperados:** "Conta vinculada a transações não pode ser excluída fisicamente."

### Transações (Receitas, Despesas e Transferências)
*   **Objetivo:** O motor principal de finanças. Registro do fluxo de caixa e movimentações financeiras.
*   **Operações:** Criar (única, parcelada, recorrente), Listar com paginação/filtros, Atualizar status, Transferir saldos.
*   **Fluxo de comunicação:** Mutações no cliente são despachadas pro Supabase via SDK. Transações complexas (Transferências) executam RPCs (Remote Procedure Calls) no banco para garantir atomicidade.
*   **Eventos Realtime:** Inserções e exclusões engatilham atualização de saldos e gráficos.
*   **Erros esperados:** "Data inválida", "Conta não encontrada".

### Cartões & Faturas
*   **Objetivo:** Gerenciamento do crédito rotativo do usuário.
*   **Operações:** Criar cartão, Listar faturas por mês, Lançar despesa no crédito, Pagar Fatura.
*   **Fluxo de comunicação:** Transações atreladas a cartões são agrupadas lógicamente nas faturas através de agrupamento no banco de dados.

### Investimentos & Dividendos
*   **Objetivo:** Gerenciamento macro do patrimônio do usuário e rentabilidade.
*   **Operações:** Cadastrar ativo financeiro, Registrar Compra/Venda, Receber provento.
*   **Validações:** Quantidades e Valores não podem ser negativos.

### Orçamentos, Objetivos e Assinaturas
*   **Objetivo:** Gamificação da poupança e estabelecimento de limites de gastos, bem como previsibilidade.
*   **Operações:** Criar metas, Alocar/resgatar saldos de metas, Definir limites orçamentários por categoria.
*   **Eventos Realtime:** O orçamento emite notificação quando uma despesa excede a margem (ex: 90% do orçamento de Alimentação atingido).

### Empréstimos, Relatórios e Notificações
*   **Objetivo:** Visões detalhadas do fluxo de dados e acompanhamento de obrigações de longo prazo.
*   **Operações:** Extrair JSON estruturado para renderizar gráficos, Configurar alertas.
*   **Fluxo de comunicação:** Consultas muito densas e complexas poderão utilizar Views Materializadas ou Edge Functions para poupar processamento no navegador/aparelho.

---

## 5. Upload de Arquivos

*   **Comprovantes e Fotos:** Transações poderão ter notas fiscais ou fotos anexadas. Usuários poderão ter avatares.
*   **Storage:** Uso do Supabase Storage. Serão criados dois *Buckets*:
    *   `avatars` (Público, fácil acesso via URL gerada)
    *   `receipts` (Privado, restrito via RLS).
*   **Permissões:** Para baixar um comprovante do bucket privado, a requisição passa pelas políticas RLS que verificam se o `auth.uid()` é dono do comprovante.
*   **Versionamento:** A API do cliente gerará UUIDs aleatórios na subida do arquivo (`/receipts/{user_id}/{uuid}.jpg`), evitando sobrescrita acidental ou cache estagnado em CDNs.

---

## 6. Sincronização

A sincronização entre Web e Android ocorrerá seguindo princípios de reatividade local e remota.

*   **Realtime:** Através de canais WebSocket assinados na inicialização do aplicativo (Supabase Realtime `postgres_changes`).
*   **Offline:** O Mobile implementa modo Offline. A camada de serviços escreverá num SQLite local, de forma instantânea (permitindo uso imediato do aplicativo na rua sem 4G/5G).
*   **Fila de sincronização:** Mutacões offline vão para uma Fila Local (Sync Queue). Um Job em background (Worker) monitora o status de rede, esvaziando a fila quando conectado.
*   **Conflitos e Reconciliação:** A reconciliação será resolvida no Supabase através da estratégia **Last Write Wins** (LWW) baseada em um payload com a data da modificação no dispositivo. Em caso de edição simultânea sem internet, vence quem enviar a atualização mais recente.
*   **Retry Automático:** TanStack Query gerencia *retries* exponenciais padrão caso a conexão oscile durante o envio de informações não-críticas na Web.

---

## 7. Segurança

*   **JWT & Refresh Token:** Supabase emite JWT de curta duração. O SDK renova em background automaticamente utilizando o Refresh Token salvo nos cookies seguros (Web) ou Keychain (Mobile).
*   **RLS (Row Level Security):** Única e definitiva camada de proteção. Os endpoints "livres" do SDK rejeitarão comandos e selects para tudo que não tiver relação explícita com o JWT enviado no header (`Authorization: Bearer <jwt>`).
*   **Rate Limit:** Defesas nativas de DDOS e rate limit aplicadas na Edge (Vercel e Gateway do Supabase).
*   **Validação:** Inputs obrigatoriamente passados pelo Zod no Client antes de acionar a camada HTTP para reduzir overhead e proteger contra dados malformados.

---

## 8. Tratamento de Erros

*   **Padronização:** Exceções do SDK Supabase (PostgREST errors) serão envelopadas e parseadas por funções utilitárias (ex: `handleApiError()`).
*   **Códigos:** Traduções padronizadas. O código "23505" de violação *Unique Constraint* vira um erro legível do tipo `DuplicateRecordError` na UI.
*   **Feedback para usuário:** Componentes padronizados: Toasts vermelhos para erros em Background, formulários com estados de erro amigáveis para campos inválidos (Zod resolver).
*   **Logs:** Utilização de `console.error` em dev. Estrutura desenhada para ser "pluggable" num Sentry da vida caso a escala chegue ao nível corporativo.

---

## 9. Estratégia de Cache

O `TanStack Query` será o motor dominante para evitar repetições desnecessárias.

*   **Invalidation:** Ações como `createTransaction` chamam `queryClient.invalidateQueries(['transactions'])`, forçando refetch do que for afetado de modo transparente ao usuário.
*   **Prefetch:** Interações preditivas (hover no botão de Configurações, scroll chegando perto de relatórios de um ano anterior) dispararão o `queryClient.prefetchQuery`.
*   **Optimistic Updates:** Excluir um Cartão removerá ele da lista na UI instantaneamente. O request é feito silenciosamente. Em caso de falha de rede, a interface fará um Rollback e recolocará o cartão na tela emitindo o alerta.
*   **Persistência Offline (Web/Mobile):** Utilização do plugin `persister` do TanStack Query para despejar o cache no AsyncStorage/IndexedDB, acelerando o tempo do "Primeiro Render" (TTFB perceptivo zero).

---

## 10. Roadmap da API

*   **Fase 1:** Setup dos Clientes, Providers de Autenticação, Proteção RLS de Auth e Sessões (Tratamento de JWT).
*   **Fase 2:** Desenvolvimento das Repositories CRUD iniciais (Contas e Categorias). Modelagem do Cache TanStack.
*   **Fase 3:** Motor Transacional (Repositories complexas, Paginação Cursor, Filtros). Otimistic Updates aplicados.
*   **Fase 4:** Modelagem de Buckets (Storage) e implementação do serviço de upload (Comprovantes e Perfil).
*   **Fase 5:** Implementação dos canais Supabase Realtime para notificação de atualizações cruzadas.
*   **Fase 6:** Estruturação pesada para Sincronização Mobile Offline (Adaptações React Native) e Fila de Mutação.
*   **Fase 7:** Edge Functions (Módulos de agendamento e faturas complexas).
