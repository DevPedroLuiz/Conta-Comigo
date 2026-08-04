const fs = require('fs');

const report = `
# Auditoria Completa: Conta Comigo (Código vs Documentação)

Esta auditoria compara o código-fonte atual com os artefatos de documentação (\`PRD.md\`, \`ROADMAP.md\`, \`ARCHITECTURE.md\`, \`DATABASE.md\`, \`DESIGN_SYSTEM.md\`, etc.).

## 1. Funcionalidades Não Implementadas ou Parciais

### Cartões de Crédito (RF-005)
*   **Documento:** \`PRD.md\` (RF-005), \`ROADMAP.md\` (Fase 4), \`DATABASE.md\` (Tabela \`credit_cards\`)
*   **Arquivo afetado:** Ausência do módulo \`src/modules/credit-cards/\`
*   **Divergência:** A documentação especifica o gerenciamento de cartões de crédito (limite, vencimento, fechamento) e lançamentos em faturas. Não há módulo implementado.
*   **Impacto:** Usuários não podem gerenciar despesas de cartão de crédito conforme planejado.
*   **Severidade:** Alta
*   **Correção recomendada:** Implementar o CRUD de cartões de crédito e a lógica de faturas vinculadas às transações.

### Parcelamentos e Recorrências (RF-007, RF-008)
*   **Documento:** \`PRD.md\` (RF-007, RF-008), \`ROADMAP.md\` (Fase 4)
*   **Arquivo afetado:** \`src/modules/transactions/components/TransactionForm.tsx\`, \`src/modules/transactions/services/TransactionService.ts\`
*   **Divergência:** Transações parceladas e recorrentes estão mapeadas no \`DATABASE.md\` (campos \`is_recurring\`, \`recurrence_interval\`, \`installment_id\`), mas não há fluxo implementado no formulário de criação nem no serviço backend.
*   **Impacto:** Lançamentos complexos de faturas e pagamentos mensais fixos precisam ser feitos manualmente.
*   **Severidade:** Alta
*   **Correção recomendada:** Adicionar opções de recorrência e parcelamento na criação de transações, com geração em lote ou projeção.

### Gestão de Assinaturas (RF-010)
*   **Documento:** \`PRD.md\` (RF-010)
*   **Arquivo afetado:** Ausência do módulo ou view de assinaturas.
*   **Divergência:** Visão isolada para assinaturas recorrentes não foi implementada.
*   **Impacto:** Perda de previsibilidade das contas fixas.
*   **Severidade:** Média
*   **Correção recomendada:** Implementar um dashboard ou aba específica filtrando transações recorrentes/assinaturas.

### Investimentos (RF-011) e Saldo Investido (RF-003)
*   **Documento:** \`PRD.md\` (RF-003, RF-011), \`ROADMAP.md\` (Fase 7)
*   **Arquivo afetado:** \`src/modules/dashboard/components/BalanceCard.tsx\` e ausência de módulo \`investments\`.
*   **Divergência:** Não existe módulo de investimentos, e o Dashboard não exibe o "Saldo Investido" conforme exigido.
*   **Impacto:** Funcionalidade de gestão patrimonial está ausente.
*   **Severidade:** Baixa (Fase avançada do roadmap)
*   **Correção recomendada:** Criar tabelas e CRUD para investimentos, atualizar o \`BalanceCard\` para mostrar o saldo investido separadamente.

### Orçamentos e Calendário (RF-012, RF-013)
*   **Documento:** \`PRD.md\` (RF-012, RF-013), \`ROADMAP.md\` (Fase 6)
*   **Arquivo afetado:** Ausência dos módulos \`budgets\` e \`calendar\`.
*   **Divergência:** Não é possível definir limites mensais por categoria nem visualizar lançamentos futuros num calendário.
*   **Impacto:** Prejudica o planejamento financeiro proativo.
*   **Severidade:** Média
*   **Correção recomendada:** Implementar módulo de orçamentos (Budgets) e um visualizador tipo calendário.

### Configurações de Perfil (RF-017)
*   **Documento:** \`PRD.md\` (RF-017)
*   **Arquivo afetado:** Ausência de módulo \`settings\` ou \`profile\`.
*   **Divergência:** Falta tela para customizar idioma e moeda base, embora haja seletor de tema (Dark/Light).
*   **Impacto:** UX incompleta para configurações do usuário e LGPD.
*   **Severidade:** Média
*   **Correção recomendada:** Criar tela de Configurações para edição do perfil, moeda, idioma e exclusão de conta.

## 2. Banco de Dados e RLS

### Regras RLS Incompletas
*   **Documento:** \`PRD.md\` (RNF-001) e \`DATABASE.md\`
*   **Arquivo afetado:** \`supabase/migrations/...\` (não disponível diretamente no escopo de frontend, assumindo com base no que não está aplicado).
*   **Divergência:** É necessário verificar se todas as tabelas (como as faltantes \`credit_cards\`, \`budgets\`, \`investments\`) possuem RLS. As tabelas atuais presumidamente têm, mas as omitidas não estão no schema de código.
*   **Impacto:** Risco de vazamento de dados caso as tabelas futuras não sigam a mesma regra.
*   **Severidade:** Crítica
*   **Correção recomendada:** Garantir RLS \`user_id = auth.uid()\` em todas as novas tabelas da fase 4 a 7.

## 3. Arquitetura e Estrutura de Módulos

### Abordagem Monorepo
*   **Documento:** \`ARCHITECTURE.md\` (Seção 2)
*   **Arquivo afetado:** Estrutura da raiz do projeto.
*   **Divergência:** A documentação prescreve um Monorepo (apps/web, apps/mobile, packages/ui). O projeto atual está estruturado como um SPA padrão (\`src/\` direto na raiz, sem \`apps/\` ou \`packages/\`).
*   **Impacto:** Dificuldade futura de integrar o aplicativo React Native compartilhando código (\`packages/ui\`, tipagens, schemas Zod).
*   **Severidade:** Alta
*   **Correção recomendada:** Refatorar a estrutura do repositório para Turborepo, movendo o app atual para \`apps/web\` e extraindo os schemas e componentes UI para \`packages/\`.

### Sincronização WebSockets / Realtime (RNF-003)
*   **Documento:** \`PRD.md\` (RNF-003), \`ARCHITECTURE.md\`
*   **Arquivo afetado:** \`src/core/services/supabase.ts\` e repositórios.
*   **Divergência:** Não há evidência de *subscriptions* do Supabase Realtime escutando alterações no banco para atualizar o estado da UI instantaneamente em múltiplas abas.
*   **Impacto:** Alterações feitas em um dispositivo não refletem no outro em tempo real.
*   **Severidade:** Média
*   **Correção recomendada:** Implementar \`supabase.channel(...).on('postgres_changes', ...).subscribe()\` nos contextos principais (Dashboard, Transações).

## 4. Design System e UX

### Upload de Comprovantes (RF-009)
*   **Documento:** \`PRD.md\` (RF-009)
*   **Arquivo afetado:** \`src/modules/transactions/components/TransactionForm.tsx\`
*   **Divergência:** Falta input para upload de arquivos/comprovantes. O bucket do Supabase Storage não está sendo integrado no formulário.
*   **Impacto:** Impossibilidade de anexar recibos às despesas.
*   **Severidade:** Média
*   **Correção recomendada:** Adicionar componente de Dropzone para upload de imagem/PDF ligado ao Supabase Storage.

### Cores Base (Design System)
*   **Documento:** \`DESIGN_SYSTEM.md\` (Seção 3)
*   **Arquivo afetado:** \`tailwind.config.ts\` / CSS
*   **Divergência:** O documento exige Indigo/Violeta como primária, Zinc como neutra, Emerald para sucesso e Rose para erro. Verificando o \`App.tsx\` ou as configurações, a aderência parece estar OK, porém vale validar se não está usando apenas os defaults do shadcn (slate/blue).
*   **Impacto:** Inconsistência visual em relação ao branding.
*   **Severidade:** Baixa
*   **Correção recomendada:** Confirmar variáveis CSS em \`index.css\` para espelhar exato os tons do documento.

## Conclusão
O sistema concluiu com êxito as Fases 1, 2, 3 e partes da Fase 5 (Extrato e Relatórios), além de uma implementação não prevista na documentação inicial: o módulo de Metas (Objetivos) que parece estar adiantado (Fase 6). Contudo, a **Arquitetura Monorepo** prescrita não foi adotada, e funcionalidades cruciais das **Fases 4 e 6** (Cartões de crédito, Recorrências, Orçamentos) ainda precisam ser desenvolvidas para cumprimento total do PRD.
`;
console.log(report);
