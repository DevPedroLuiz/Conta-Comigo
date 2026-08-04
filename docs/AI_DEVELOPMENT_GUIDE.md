# Guia de Desenvolvimento Orientado por IA (AI Development Guide)

Este documento atua como o manual definitivo e conjunto de regras estritas (System Prompts/Constraints) para qualquer agente de Inteligência Artificial, LLM ou assistente virtual que atue no desenvolvimento do ecossistema **Conta Comigo**. 

A leitura e obediência a este documento são **obrigatórias** antes da execução de qualquer alteração no código-fonte.

---

## 1. Regras de Ouro (Obrigações Primárias)
* **Sempre consulte a documentação fundacional:** Antes de escrever a primeira linha de código, você deve obrigatoriamente ler o contexto da funcionalidade nos arquivos `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DESIGN_SYSTEM.md`, `WIREFRAMES.md` e `BACKLOG.md`.
* **Atualize a documentação continuamente:** Ao finalizar qualquer funcionalidade, atualização de banco de dados ou mudança de arquitetura, atualize imediatamente a documentação correspondente. A documentação deve refletir 100% da realidade do código.
* **Nunca altere arquivos fora do escopo:** Respeite rigorosamente a solicitação do usuário. Modifique apenas os arquivos necessários para entregar a funcionalidade exigida, minimizando o risco de efeitos colaterais.
* **Pare em caso de ambiguidade:** Se a solicitação do usuário conflitar com a documentação oficial ou se faltarem detalhes críticos, não adivinhe. Pare a execução e peça esclarecimentos ao usuário.

---

## 2. Qualidade e Padrões de Código
* **Tipagem Forte e Estrita:** Nunca utilize `any` em TypeScript. Tipos, Interfaces e Schemas (Zod) devem ser exatos, utilizando Generics quando necessário e protegendo contra nulos e indefinidos (`strict: true`).
* **Clean Architecture e SOLID:** O código deve respeitar a separação de responsabilidades (Componentes de UI, Hooks lógicos, Repositories de dados). Aplique os princípios SOLID rigorosamente (Especialmente Responsabilidade Única e Inversão de Dependência).
* **DRY (Don't Repeat Yourself):** Nunca duplique lógica. Se um cálculo ou regra for utilizada em mais de um lugar, abstraia para uma função utilitária global (`/core/utils/`).
* **KISS (Keep It Simple, Stupid):** Escreva código claro, legível e direto. Evite abstrações prematuras ou engenharia excessiva (Overengineering).

---

## 3. Ecossistema e Arquitetura Monorepo
* **Compatibilidade Web e Mobile:** O ecossistema compartilha a mesma inteligência. Nunca introduza bibliotecas exclusivas de DOM (ex: `window.localStorage`) na camada de Serviços/Hooks sem o devido isolamento, pois isso quebrará o aplicativo React Native.
* **Reaproveitamento de Componentes:** Verifique sempre o pacote de UI compartilhado (`/core/ui`) antes de criar um novo botão, modal ou input. Sempre reutilize componentes compartilhados.
* **Nunca remova funcionalidades existentes sem documentação:** Nenhuma feature atual deve ser deletada ou comentada sem que isso seja uma ordem explícita do usuário e esteja documentado.

---

## 4. Banco de Dados e APIs
* **Atualização Obrigatória do `DATABASE.md`:** É estritamente proibido alterar estruturas de tabelas, criar índices, ou modificar Triggers no Supabase sem atualizar a modelagem no documento `DATABASE.md`.
* **Segurança por Default (RLS):** Toda nova tabela DEVE ter suas políticas de Row Level Security (RLS) configuradas para proteger o isolamento dos dados do usuário. O backend nunca deve confiar no input do cliente sem validação.
* **Validação em Duas Camadas:** Zod no Frontend (para UX rápida) e Tipagem forte/Constraints no PostgreSQL (para garantia de integridade).

---

## 5. Design System e Interface Visuais
* **Fidelidade ao Design System:** Nunca crie telas, cores, espaçamentos ou tipografias fora dos padrões estipulados no `DESIGN_SYSTEM.md`. O uso de Tailwind classes deve refletir os *design tokens* oficias da aplicação.
* **Responsividade Absoluta:** O frontend Web deve ser construído seguindo `Mobile-First`. Use os breakpoints do Tailwind (`sm:`, `md:`, `lg:`) para garantir compatibilidade impecável em qualquer tela.
* **Acessibilidade (A11y):** Sempre preserve a acessibilidade. Adicione `aria-labels` a botões icônicos, mantenha alto contraste e garanta suporte à navegação por teclado (`focus:ring`).

---

## 6. Performance, Segurança e Testes
* **Testes para Regras Críticas:** Lógicas matemáticas (ex: calculadoras de parcelamento, consolidação de juros) DEVEM ser cobertas por testes unitários robustos (Jest/Vitest) antes de serem integradas.
* **Performance Consciente:** Evite renderizações desnecessárias. Use paginação e scroll virtual para listas longas. Faça cache agressivo (via TanStack Query) para dados estáticos.
* **Prevenção contra Falhas de Rede:** Considere que o usuário sempre pode ficar offline. Prepare os componentes para lidar com `Error States` e `Loading States` de forma elegante (Skeleton loading).

---

## 7. Controle de Versão e Operações no Código
* **Edições Cirúrgicas (Surgical Edits):** Como IA, utilize ferramentas de edição precisa de arquivos em vez de tentar sobrescrever arquivos inteiros e causar perdas de código.
* **Conventional Commits:** Todas as mensagens de commit ou resumos de alteração devem seguir o padrão: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## 8. Regras Adicionais para o Agente IA
* **Sem Código "Mockado" ou Placeholders Temporários:** Quando construir integrações, faça integrações reais. Nunca adicione "TODO: Implementar API" a menos que solicitado. Conecte-se aos SDKs oficiais indicados.
* **Logs e Auditoria Silenciosa:** Siga os padrões de erro do projeto, sem sujar o console (`console.log`) do navegador desnecessariamente na versão final. Use ferramentas apropriadas de Error Boundary.
