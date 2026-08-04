import fs from 'fs';

let content = fs.readFileSync('src/app/router.tsx', 'utf8');

if (!content.includes('BudgetsPage')) {
  content = content.replace(
    "import { SettingsPage } from '../modules/settings/pages/SettingsPage';",
    "import { SettingsPage } from '../modules/settings/pages/SettingsPage';\nimport { BudgetsPage } from '../modules/budgets/pages/BudgetsPage';\nimport { BudgetCreatePage } from '../modules/budgets/pages/BudgetCreatePage';\nimport { BudgetEditPage } from '../modules/budgets/pages/BudgetEditPage';\nimport { CalendarPage } from '../modules/calendar/pages/CalendarPage';"
  );
  
  content = content.replace(
    "<Route path=\"reports\" element={<ReportsPage />} />",
    "<Route path=\"reports\" element={<ReportsPage />} />\n          <Route path=\"budgets\" element={<BudgetsPage />} />\n          <Route path=\"budgets/new\" element={<BudgetCreatePage />} />\n          <Route path=\"budgets/:id/edit\" element={<BudgetEditPage />} />\n          <Route path=\"calendar\" element={<CalendarPage />} />"
  );
  
  fs.writeFileSync('src/app/router.tsx', content);
  console.log('patched router');
}
