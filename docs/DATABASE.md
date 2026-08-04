# Documentação de Arquitetura de Banco de Dados - Conta Comigo

## 1. Filosofia do Banco

A modelagem do banco de dados do **Conta Comigo** foi desenhada para suportar uma aplicação financeira crítica, garantindo consistência absoluta dos dados, performance em escala e sincronização offline-first. As premissas filosóficas são:

*   **Normalização (3NF):** O núcleo transacional é estritamente normalizado para garantir integridade e evitar anomalias de atualização. Dados analíticos (dashboards) podem usar desnormalização através de Materialized Views no futuro.
*   **Performance:** Consultas rápidas são garantidas pelo uso estratégico de índices (B-Tree em FKs e datas) e particionamento projetado para o longo prazo.
*   **Escalabilidade:** O banco é preparado para crescer de um único usuário para um modelo SaaS multi-tenant massivo, utilizando `user_id` em quase todas as tabelas para facilitar futuro sharding ou particionamento.
*   **Segurança (Zero Trust):** Acesso direto aos dados é bloqueado por padrão. Row Level Security (RLS) é a lei. Cada query obrigatoriamente valida a identidade via JWT.
*   **Auditoria:** Toda ação destrutiva ou mutação sensível é rastreada de forma imutável.
*   **Soft Delete:** Registros financeiros nunca são fisicamente deletados para preservar o histórico. Ocultamos logicamente via `deleted_at`.
*   **Versionamento (Sincronização):** Controle rigoroso de concorrência com timestamps (`updated_at`) para suportar a arquitetura offline-first e conciliação de conflitos.

---

## 2. Diagrama ER (Lógico e Textual)

```text
auth.users (Supabase Auth)
 ├── profiles
 │    ├── settings
 │    └── currencies (Preferência do usuário)
 │
 ├── accounts (Contas Bancárias)
 │    ├── account_types
 │    ├── transactions (Receitas/Despesas Base)
 │    │    ├── attachments
 │    │    └── audit_logs
 │    └── transfers (Envolve 2 accounts)
 │
 ├── categories (Categorias Customizadas)
 │
 ├── credit_cards
 │    └── credit_card_invoices (Faturas)
 │         └── invoice_payments
 │
 ├── transations_logic (Motores de Repetição)
 │    ├── transaction_recurrences (Assinaturas/Fixas)
 │    └── transaction_installments (Parcelamentos)
 │
 ├── investments (Carteiras)
 │    ├── investment_assets (Ativos)
 │    ├── investment_movements (Compra/Venda)
 │    └── dividends (Proventos)
 │
 ├── goals (Objetivos Financeiros)
 │    └── goal_transactions (Aportes/Resgates)
 │
 ├── budgets (Orçamentos Mensais)
 │
 ├── loans (Empréstimos)
 │    └── loan_installments (Amortizações)
 │
 ├── subscriptions (Gestão Visual de Assinaturas)
 │
 └── notifications (Push e Lembretes)
```

---

## 3. Entidades

Abaixo detalhamos a estrutura lógica de todas as entidades do sistema.

### 3.1. Núcleo de Usuários
*   **users:** Tabela gerenciada pelo Supabase Auth (`auth.users`). Armazena credenciais, e-mail e hash de senhas.
*   **profiles:** Extensão pública do usuário. Responsabilidade: Dados demográficos. Obrigatórios: `id` (FK auth.users), `full_name`. Opcionais: `avatar_url`, `timezone`.
*   **settings:** Preferências do app. Obrigatórios: `user_id`, `theme`, `language`.
*   **currencies:** Dicionário de moedas disponíveis para conversão.

### 3.2. Contas e Categorias
*   **accounts:** Contas físicas/digitais. Responsabilidade: Saldo direto. Obrigatórios: `id`, `user_id`, `name`, `type_id`, `initial_balance`. Opcionais: `color`, `icon`, `bank_name`. Calculados: `current_balance`.
*   **account_types:** Tipos de conta (Corrente, Poupança, Carteira). Domínio estático.
*   **categories:** Categorias de classificação financeira. Obrigatórios: `id`, `user_id`, `name`, `type` (INCOME/EXPENSE). Opcionais: `color`, `icon`, `parent_category_id`.

### 3.3. Transações e Cartões
*   **transactions:** Coração do sistema. Lançamentos pontuais. Obrigatórios: `id`, `user_id`, `account_id` (ou `credit_card_id`), `category_id`, `type`, `amount`, `date`, `status` (PAID/UNPAID). Opcionais: `description`, `tags`, `recurrence_id`, `installment_id`.
*   **transaction_installments:** Agrupador de compras parceladas. Contém o valor total e o número de parcelas. As parcelas individuais vão para `transactions`.
*   **transaction_recurrences:** Agrupador de lançamentos fixos (mensais/anuais). Usado para projetar transações futuras.
*   **transfers:** Entidade relacional para transferências. Obrigatórios: `id`, `user_id`, `origin_transaction_id` (saída), `destination_transaction_id` (entrada).
*   **credit_cards:** Cartões do usuário. Obrigatórios: `id`, `user_id`, `name`, `limit`, `closing_day`, `due_day`. Opcionais: `brand`, `color`.
*   **credit_card_invoices:** Faturas geradas. Obrigatórios: `id`, `credit_card_id`, `month`, `year`. Calculados: `total_amount`.
*   **invoice_payments:** Pagamentos de faturas. Relaciona uma `credit_card_invoice` a uma `transaction` (saída da conta corrente).

### 3.4. Planejamento Financeiro
*   **budgets:** Orçamentos definidos pelo usuário. Obrigatórios: `id`, `user_id`, `category_id`, `month`, `year`, `limit_amount`. Regras: RLS por auth.uid(), Unique por usuário/categoria/período. Calculados dinamicamente: `spent_amount`.
*   **goals:** Objetivos (ex: Viagem). Obrigatórios: `id`, `user_id`, `name`, `target_amount`, `target_date`.
*   **goal_transactions:** Aportes para os objetivos. Obrigatórios: `id`, `goal_id`, `amount`, `date`, `transaction_id` (se debitou de uma conta).
*   **subscriptions:** Espelho visual de `transaction_recurrences` focado em assinaturas (Netflix, Academia), adicionando metadata como site e plano.

### 3.5. Investimentos e Empréstimos
*   **investments:** Carteiras/Corretoras. Obrigatórios: `id`, `user_id`, `name`.
*   **investment_assets:** Ativos individuais (PETR4, Tesouro Direto). Obrigatórios: `id`, `user_id`, `investment_id`, `ticker_or_name`, `asset_type`.
*   **investment_movements:** Compras e vendas. Obrigatórios: `id`, `asset_id`, `type` (BUY/SELL), `quantity`, `unit_price`, `date`.
*   **dividends:** Proventos recebidos. Obrigatórios: `id`, `asset_id`, `amount`, `date`.
*   **loans:** Empréstimos tomados ou concedidos. Obrigatórios: `id`, `user_id`, `name`, `principal_amount`, `interest_rate`.
*   **loan_installments:** Amortizações do empréstimo.

### 3.6. Sistema
*   **notifications:** Alertas para o usuário. Obrigatórios: `id`, `user_id`, `title`, `body`, `read_status`.
*   **attachments:** Comprovantes em PDF/Imagens. Obrigatórios: `id`, `user_id`, `transaction_id`, `storage_path`, `file_type`.
*   **audit_logs:** Rastreio de ações. Obrigatórios: `id`, `user_id`, `action` (CREATE/UPDATE/DELETE), `table_name`, `record_id`, `old_data` (JSONB), `new_data` (JSONB).

---

## 4. Relacionamentos

*   **1:1 (Um-para-Um):** `auth.users` <-> `profiles`. `profiles` <-> `settings`. Um usuário tem exatamente um perfil e uma configuração.
*   **1:N (Um-para-Muitos):** `users` -> `accounts` (Um usuário possui várias contas). `accounts` -> `transactions`. `credit_cards` -> `transactions`.
*   **N:N (Muitos-para-Muitos):** A ser implementado futuramente para *Tags* (`transactions_tags`), permitindo que uma transação tenha múltiplas tags, e uma tag pertença a várias transações.
*   **Cascade:** Quando um `user` é deletado (hard delete), o Cascade deleta todo o banco daquele usuário para cumprir a LGPD.
*   **Restrict:** Proibido deletar uma `account` ou `category` se existirem `transactions` vinculadas a ela. O usuário deve primeiro remanejar as transações ou usar inativação (Soft Delete).

---

## 5. Índices

A alta performance será garantida pela criação cirúrgica de índices:
*   **Índices B-Tree (Chaves Estrangeiras):** Todos os `user_id` e IDs de relacionamento (`account_id`, `category_id`) terão índices para garantir Joins ultra-rápidos e acelerar o RLS.
*   **Índices de Data (BRIN ou B-Tree):** A coluna `date` em `transactions` receberá índice para viabilizar agrupamentos rápidos por mês (Dashboard).
*   **Índices Compostos:** Índices como `(user_id, date)` ou `(credit_card_id, status)` para otimizar as queries exatas dos relatórios do aplicativo e telas de faturas.

---

## 6. Integridade

*   **Foreign Keys (FKs):** Fortemente amarradas para garantir que não existam registros órfãos.
*   **Unique Constraints:** Imposição de regras únicas lógicas. Exemplo: `(user_id, category_name)` garante que o usuário não cadastre duas categorias com o exato mesmo nome.
*   **Checks:** Constraints a nível de banco. Exemplo: `CHECK (amount > 0)` em transações. `CHECK (type IN ('INCOME', 'EXPENSE'))`.
*   **Triggers de Manutenção:** Triggers de atualização automática de `updated_at`.

---

## 7. Histórico e Retenção

*   **Soft Delete:** O uso da coluna `deleted_at` anula a exibição dos registros em queries regulares (todas as views e queries do app usarão `where deleted_at is null`).
*   **Audit Logs:** Implementados via PostgreSQL Triggers (usando `JSONB` para capturar o "antes" e "depois" do registro) para tabelas financeiras core (Accounts e Transactions).
*   **Versionamento:** O uso da coluna `version` (int incrementado a cada update) ou `updated_at` (timestamp precisão milissegundos) garante controle de concorrência.

---

## 8. Segurança

*   **RLS (Row Level Security):** O Supabase não retornará dados sem autenticação.
*   **Policies:** Todas as tabelas têm a seguinte policy primária: `(auth.uid() = user_id)`. Para tabelas derivadas, usa-se subqueries de verificação ou FKs diretas.
*   **Permissões:** O banco não expõe permissões `DELETE` físicas para o client side (RPC ou APIs limitadas cuidarão do Soft Delete via `UPDATE`).
*   **Isolamento:** A quebra de isolamento multitenant é impossível a nível estrutural no PostgreSQL caso o RLS seja aplicado corretamente.

---

## 9. Estratégia de IDs

**Escolha: UUIDv4**
*   **Motivo Principal:** Suporte à **Sincronização Offline**. O aplicativo Android (React Native) precisa criar e gravar transações localmente no SQLite enquanto o usuário está em modo avião (sem rede). Com UUIDv4, o celular gera o ID final imediatamente, exibe na UI e manda para o Supabase depois, garantindo 0% de chance de colisão de ID no banco central. (IDs Sequenciais/Integer impossibilitam isso sem conciliação complexa).

---

## 10. Estratégia de Datas

*   **Timestamps:** O formato oficial é `TIMESTAMPTZ` (Timestamp with Time Zone), armazenado em UTC no banco. O cliente (Next.js/React Native) formata para o fuso horário local.
*   **`created_at`:** Imutável, default `now()`.
*   **`updated_at`:** Atualizado por trigger sempre que a linha for modificada. Essencial para reconciliação.
*   **`deleted_at`:** Preenchido para inativação (Soft Delete).
*   **`last_sync`:** (Aplicável primariamente no Client SQLite) Define quando o dado local foi confirmado pelo servidor.

---

## 11. Estratégia Financeira

*   **Transferências:** Uma tela de transferência cria 1 registro na tabela `transfers` e 2 registros na tabela `transactions` (uma despesa na conta origem, uma receita na conta destino).
*   **Credit Card Invoice Flow:**
    *   `credit_card_invoices` representa o agrupamento mensal das compras.
    *   O cálculo ocorre através das transactions associadas ao `credit_card_id`.
    *   O fechamento considera `closing_day` do cartão.
    *   Pagamentos são registrados através da tabela `invoice_payments`.
    *   O pagamento de fatura gera uma transaction de despesa na conta bancária vinculada ao `invoice_payments` para abater a dívida.
*   **Parcelamentos:** Uma compra parcelada gera o registro pai `transaction_installments` (Ex: R$ 1.200) e o frontend/backend gera imediatamente N (ex: 12) transações filhas de R$ 100 com datas futuras atreladas.
*   **Recorrências e Assinaturas (`transaction_recurrences`):** Responsável por armazenar regras de recorrência (mensais/anuais). Usado em assinaturas (`subscriptions`) para projetar ou gerar transações futuras de forma automática (através de Cron Jobs / Edge Functions).

---

## 12. Sincronização e Conectividade

*   **Realtime:** O Supabase enviará payloads WebSocket para os clientes toda vez que houver `INSERT/UPDATE/DELETE` nas tabelas que o usuário assina.
*   **Offline-First & Conflitos:** O mobile utiliza banco local (ex: WatermelonDB) com uma coluna `updated_at`.
*   **Reconciliação Incremental (Last Write Wins):** Se houver conflito (duas edições no mesmo registro offline), o banco acatará o `updated_at` mais recente cronologicamente.

---

## 13. Escalabilidade

*   **Até 100 usuários:** Banco padrão compartilhado (Tier Free do Supabase).
*   **Até 10 mil usuários:** Migração para instâncias dedicadas. Criação de índices otimizados pós-análise de lentidão em `pg_stat_statements`.
*   **Até 100 mil usuários:** Habilitação do **Supavisor** (Connection Poolinger nativo do Supabase) para suportar milhares de requisições de API simultâneas. Habilitação de Read Replicas se os relatórios (OLAP) pesarem na base transacional (OLTP).
*   **Até 1 milhão de usuários:** Particionamento nativo do PostgreSQL nas tabelas `transactions` e `audit_logs` (Partição por Range de `date` ou Hash de `user_id`).

---

## 14. Roadmap do Banco

**Fase 1: Identidade e Infraestrutura (Fundação)**
*   Schema Auth, Profiles, Configurações, Segurança RLS base.
**Fase 2: Core Bancário (MVP Financeiro)**
*   Accounts, Account Types, Categories, Transactions (Simples), Transfers.
**Fase 3: Expansão de Crédito (Endividamento)**
*   Credit Cards, Invoices, Parcelamentos (Installments).
**Fase 4: Inteligência Artificial e Previsibilidade**
*   Budgets, Goals, Subscriptions (Recorrência via Cron).
**Fase 5: Patrimônio (Ecossistema Fechado)**
*   Investments, Dividends, Loans.
**Fase 6: Prontidão Corporativa (Enterprise Grade)**
*   Audit Logs em JSONB, View Materializadas, Particionamento de Histórico.
