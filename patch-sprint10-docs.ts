import * as fs from 'fs';

// 1. Update CHANGELOG.md
const changelogPath = 'CHANGELOG.md';
let changelogContent = fs.readFileSync(changelogPath, 'utf8');

const sprint10Entry = `- **Sprint 10:** Orçamentos e Calendário Financeiro.
- CRUD de orçamentos (budgets).
- Controle de limite por categoria.
- Cálculo dinâmico de gastos no mês.
- Barra de progresso de consumo de orçamento (Progress component).
- Calendário financeiro mostrando fluxo passado e previsão de gastos futuros e assinaturas.
- Débito Técnico: Evolução futura da projeção de parcelamentos e faturas de cartão no calendário.\n`;

changelogContent = changelogContent.replace('### Added\n', '### Added\n' + sprint10Entry);
fs.writeFileSync(changelogPath, changelogContent);


// 2. Update docs/ROADMAP.md
const roadmapPath = 'docs/ROADMAP.md';
let roadmapContent = fs.readFileSync(roadmapPath, 'utf8');

// Update Sprint 10 status and prepare Sprint 11
roadmapContent = roadmapContent.replace(
  '- **Sprint 10 — Orçamentos (Budgets) e Calendário Financeiro:** Definição de limites de gastos por categoria e alertas visuais de estouro, e calendário.',
  '- **Sprint 10 — Orçamentos e Calendário Financeiro (CONCLUÍDA):** Gestão de Budgets com limites e progresso. Calendário financeiro com integração de transações e assinaturas.\n- **Sprint 11 — Investimentos e Patrimônio:** Cadastro de carteiras, ativos (bolsa/renda fixa) e consolidação de rendimentos.'
);
fs.writeFileSync(roadmapPath, roadmapContent);

// 3. Update docs/BACKLOG.md
const backlogPath = 'docs/BACKLOG.md';
let backlogContent = fs.readFileSync(backlogPath, 'utf8');

backlogContent = backlogContent.replace(
  '### Épico 6: Inteligência e Planejamento\n*   **Feature 6.1:** Objetivos Financeiros (Metas).\n*   **Feature 6.2:** Orçamentos por Categoria.',
  '### Épico 6: Inteligência e Planejamento\n*   **Feature 6.1:** Objetivos Financeiros (Metas).\n*   **Feature 6.2:** Orçamentos por Categoria. [DONE]\n*   **Feature 6.3:** Calendário financeiro. [DONE]\n*   *Nota:* Melhorias futuras de projeção avançada de parcelamentos e cartões no calendário.'
);
fs.writeFileSync(backlogPath, backlogContent);


// 4. Update docs/DATABASE.md
const databasePath = 'docs/DATABASE.md';
let databaseContent = fs.readFileSync(databasePath, 'utf8');

if (!databaseContent.includes('**budgets:** Orçamentos definidos pelo usuário. Obrigatórios: `id`, `user_id`, `category_id`, `month`, `year`, `limit_amount`. Regras: RLS por auth.uid(), Unique por usuário/categoria/período. Calculados dinamicamente: `spent_amount`.')) {
  databaseContent = databaseContent.replace(
    '*   **budgets:** Orçamentos definidos pelo usuário. Obrigatórios: `id`, `user_id`, `category_id`, `month`, `year`, `limit_amount`. Calculados: `spent_amount`.',
    '*   **budgets:** Orçamentos definidos pelo usuário. Obrigatórios: `id`, `user_id`, `category_id`, `month`, `year`, `limit_amount`. Regras: RLS por auth.uid(), Unique por usuário/categoria/período. Calculados dinamicamente: `spent_amount`.'
  );
  fs.writeFileSync(databasePath, databaseContent);
}

console.log('patched docs');
