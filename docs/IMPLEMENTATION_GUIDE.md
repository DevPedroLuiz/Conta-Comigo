# Guia de Implementação (Implementation Guide) - Conta Comigo

Este documento é a referência oficial para qualquer desenvolvedor, engenheiro ou agente de IA que atue no projeto **Conta Comigo**. Ele define as diretrizes arquiteturais, o processo de desenvolvimento e os rigorosos padrões de qualidade que mantêm o ecossistema escalável e coeso.

---

## 1. Fluxo Oficial de Desenvolvimento

A implementação de qualquer nova funcionalidade (Feature) deve seguir **obrigatoriamente** o ciclo abaixo. Não pule etapas.

1. **Ler a documentação:** Revise o `PRD.md`, `WIREFRAMES.md` e `BACKLOG.md` para entender o escopo exato da funcionalidade e seu valor para o usuário.
2. **Analisar dependências:** Verifique no `ARCHITECTURE.md` e `API.md` quais módulos serão impactados (ex: criar uma despesa afeta o Saldo da Conta e o Orçamento).
3. **Atualizar o banco (quando necessário):** Modele novas tabelas, ajuste relacionamentos, crie índices e, o mais importante, defina as políticas de Row Level Security (RLS) associadas.
4. **Atualizar APIs (Supabase):** Crie as *Edge Functions* ou *Triggers* caso a lógica precise rodar no servidor. Configure os *Buckets* (Storage) se envolver upload de arquivos.
5. **Implementar Repositories e Hooks:** Crie a camada de comunicação de dados (`services`, `repositories`) e construa os hooks customizados envolvendo o TanStack Query (`useQuery`, `useMutation`).
6. **Implementar Web (Next.js/React):** Desenvolva a UI (Componentes, Layouts) utilizando o Design System e conecte-os aos hooks criados.
7. **Implementar Mobile (React Native):** Replique o consumo dos mesmos *Repositories/Hooks* na interface Mobile, garantindo suporte offline via SQLite/Fila de Sincronização.
8. **Criar testes:** Desenvolva testes unitários para lógicas complexas (ex: calculadoras de juros) e testes E2E para o fluxo feliz (Happy Path).
9. **Atualizar documentação:** Mantenha os documentos refletindo a realidade. (Se o banco mudou, o `DATABASE.md` deve mudar).
10. **Validar Definition of Done:** Checar o Checklist de Qualidade e Critérios de Aceite antes do Pull Request.

---

## 2. Ordem de Implementação

A ordem de construção segue o princípio "De baixo para cima" (Bottom-Up) e "Dos Dados para a Tela":

1. **Banco de Dados (DB):** Migration SQL -> Tabelas -> Relacionamentos -> RLS (Row Level Security).
2. **Backend Services:** Triggers (PostgreSQL) -> Edge Functions (Deno).
3. **API & Tipagens:** Gerar os Tipos (TypeScript) a partir do schema do Banco -> Criar Repositories (Fetch/Mutate).
4. **Camada de Estado:** Configurar Hooks (TanStack Query) -> Estratégias de Invalidação de Cache (Optimistic Updates).
5. **Frontend Web:** Componentes burros (UI) -> Formulários (Zod) -> Telas (Pages) -> Integração com o Estado.
6. **Frontend Mobile:** Componentes Mobile-first -> Telas -> Sincronização e Cache Nativo.
7. **Testes:** Unitários -> Integração -> E2E.
8. **Deploy:** Pipeline CI/CD -> Vercel (Web) -> Expo EAS (Mobile).

---

## 3. Convenções de Código e Estrutura

*   **Organização de Arquivos (Feature-Based):**
    Agrupar arquivos por contexto, não por tipo. Exemplo: `/modules/transactions/` conterá seus próprios componentes, hooks e tipos específicos, consumindo o `/core/` apenas para itens globais.
*   **Nomenclatura:**
    *   Pastas e arquivos (Web/Componentes): `kebab-case` (ex: `transaction-card.tsx`).
    *   Pastas e arquivos (Funções/Lógica): `camelCase` (ex: `formatCurrency.ts`).
    *   Componentes e Interfaces: `PascalCase` (ex: `TransactionCard`, `IUser`).
    *   Hooks: Iniciar com `use` em `camelCase` (ex: `useTransactions`).
*   **Imports:**
    *   Priorizar imports absolutos configurados (ex: `import { Button } from '@/core/ui/button'`).
    *   Ordem de imports: Bibliotecas externas -> Contextos globais -> Componentes -> Hooks -> Utilitários -> Estilos.
*   **Estrutura de Componentes:**
    *   Separar componentes "Burros" (Apresentacionais, vivem na UI) de componentes "Inteligentes" (Conectados, contêm hooks de dados).
*   **Camadas de Lógica:**
    *   `services`: Apenas instâncias de conexão (ex: `supabaseClient.ts`).
    *   `repositories`: Funções puras que interagem com o DB e retornam Promises (ex: `createExpense`). Nenhuma lógica de UI.
    *   `hooks`: Envelopes do React (TanStack Query) sobre os repositories.

---

## 4. Regras para Novas Funcionalidades

### Checklist Obrigatório ANTES de iniciar:
- [ ] O PRD foi compreendido? A funcionalidade tem valor de negócio claro?
- [ ] Os wireframes foram analisados e os estados (Error, Loading, Empty) foram previstos?
- [ ] O impacto na estrutura do Banco de Dados foi validado? Não quebra outras features?
- [ ] Foram definidos os Schemas de Validação (Zod)?

### Checklist Obrigatório ANTES de finalizar:
- [ ] Nenhuma biblioteca ou SDK externo extra foi adicionado sem aprovação.
- [ ] Não existem lógicas de validação espalhadas pelos componentes (devem estar no Zod).
- [ ] Sem chamadas de API soltas em `useEffect` (tudo deve usar TanStack Query).
- [ ] Todos os novos estados persistidos têm políticas RLS ativas no banco.

---

## 5. Política de Refatoração

**QUANDO Refatorar (Permitido):**
*   Quando a performance começar a degradar de forma mensurável (ex: listas pesadas precisando de virtualização).
*   Quando a mesma lógica (ex: formatação de datas, cálculo de impostos) for copiada para 3 ou mais lugares (Aplicar DRY).
*   Quando as atualizações de dependências (ex: React 18 para 19, Supabase SDK) exigirem.

**Quando NÃO Refatorar (Proibido):**
*   Refatoração "fora de escopo" da tarefa atual (Scope Creep). Não altere o componente de Cartões enquanto estiver desenvolvendo o Cadastro de Usuário, a menos que seja estritamente necessário.
*   Refatoração puramente estética do código (Trocar todos os `map` por `reduce`) que não traga benefício tangível de manutenção ou performance.
*   Reescrever bibliotecas de UI base, se o Design System já atende.

---

## 6. Atualização da Documentação

A documentação é a fonte da verdade. Ela deve ser atualizada de forma sincronizada com o código.
*   **Se alterar o Banco de Dados:** Atualize o `DATABASE.md` (Diagramas, Índices, Relacionamentos).
*   **Se criar/alterar comunicação (Supabase/Functions):** Atualize o `API.md`.
*   **Se adicionar novas Telas/Fluxos:** Atualize o `WIREFRAMES.md` e `BACKLOG.md`.
*   **Se alterar ou criar novos Tokens/Padrões Visuais:** Atualize o `DESIGN_SYSTEM.md`.

---

## 7. Checklist de Qualidade

Antes de solicitar revisão, a funcionalidade deve passar pelo crivo de Qualidade:
1.  **Performance:** Nenhuma tela pode fazer requisições duplicadas. Paginação deve estar implementada para listas crescentes (Extractos). Componentes otimizados (sem re-renders infinitos).
2.  **Segurança:** Proteção total contra XSS e injeções. Tokens JWT seguros. Usuário não pode ver, sob nenhuma hipótese, dados de outro usuário (RLS testado).
3.  **Acessibilidade (A11y):** Contraste legível (WCAG AA). Uso de `aria-labels` e suporte à navegação por teclado (`Tab`).
4.  **Responsividade:** Testado em resoluções de Mobile (375px), Tablet (768px) e Desktop (1280px+). Nenhuma quebra horizontal (overflow).
5.  **Compatibilidade Web/Mobile:** Lógicas de negócio centralizadas garantem que um cálculo de juros feito no navegador bata exatamente com o cálculo do App Android.

---

## 8. Critérios para Aprovação de uma Funcionalidade

A funcionalidade (Feature) está **PRONTA (Done)** se, e somente se:
*   Os critérios de aceite definidos no Backlog / User Story foram 100% cumpridos.
*   Passou por QA técnico (Testes + Checklists de Qualidade deste guia).
*   Não gerou regressões (bugs em áreas do sistema que já funcionavam).
*   O Design foi implementado com fidelidade à filosofia descrita no `DESIGN_SYSTEM.md`.
*   A sincronização offline/online foi testada e não gerou inconsistência de estado.

---

## 9. Fluxo de Pull Request (PR)

1.  **Branching:** Crie a branch a partir da base principal (`develop` ou `main`).
    *   Padrão: `feature/nome-da-feature`, `bugfix/descrição-do-bug`, `chore/atualizacao-de-pacote`.
2.  **Commits:** Use Conventional Commits (`feat: add transfer form`, `fix: header padding on mobile`).
3.  **Abertura do PR:**
    *   Preencher o PR Template.
    *   Anexar prints/vídeos das alterações visuais.
    *   Referenciar a User Story/Task original.
4.  **Revisão (Code Review):**
    *   Revisor verifica Arquitetura, Segurança e Performance.
    *   Aprovação mínima exigida antes do Merge.
5.  **Integração:** Merge com estratégia `Squash and Merge` para manter o histórico principal limpo.

---

## 10. Roadmap de Implementação (Macro)

Conforme ditado pelo `BACKLOG.md`, a execução dos desenvolvedores deve obedecer à seguinte esteira:

*   **Fase 1:** Infraestrutura e Setup do Monorepo. (Base).
*   **Fase 2:** Autenticação, Proteção de Rotas e Perfil (Identidade).
*   **Fase 3:** Contas, Categorias e Dashboard Básico (Setup Financeiro).
*   **Fase 4:** Transações, Transferências e Extratos (Movimentação e Cache).
*   **Fase 5:** Cartões de Crédito e Recorrências (Dívida e Futuro).
*   **Fase 6:** Orçamentos, Objetivos (Planejamento) e Sincronização Mobile pesada.
*   **Fase 7:** Investimentos, Exportação de Dados e Relatórios avançados (Business Intelligence).
*   **Fase 8:** Refinamento (Polish), Notificações Push e Preparação para Lançamento.
