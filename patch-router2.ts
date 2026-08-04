import fs from 'fs';

let content = fs.readFileSync('src/app/router.tsx', 'utf8');

content = content.replace(
  "{ path: 'reports', element: <ReportsPage /> },",
  "{ path: 'reports', element: <ReportsPage /> },\n      { path: 'budgets', element: <BudgetsPage /> },\n      { path: 'budgets/new', element: <BudgetCreatePage /> },\n      { path: 'budgets/:id/edit', element: <BudgetEditPage /> },\n      { path: 'calendar', element: <CalendarPage /> },"
);

fs.writeFileSync('src/app/router.tsx', content);
console.log('patched router');
