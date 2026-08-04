const fs = require('fs');
let code = fs.readFileSync('src/app/router.tsx', 'utf8');

const importsToAdd = `
import { CreditCardsPage } from '../modules/credit-cards/pages/CreditCardsPage';
import { CreditCardCreatePage } from '../modules/credit-cards/pages/CreditCardCreatePage';
import { CreditCardInvoicesPage } from '../modules/credit-cards/pages/CreditCardInvoicesPage';
import { SubscriptionsPage } from '../modules/subscriptions/pages/SubscriptionsPage';
`;

code = code.replace(
  "import { SettingsPage } from '../modules/settings/pages/SettingsPage';",
  "import { SettingsPage } from '../modules/settings/pages/SettingsPage';" + importsToAdd
);

const routesToAdd = `
      { path: 'credit-cards', element: <CreditCardsPage /> },
      { path: 'credit-cards/new', element: <CreditCardCreatePage /> },
      { path: 'credit-cards/:id/invoices', element: <CreditCardInvoicesPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
`;

code = code.replace(
  "{ path: 'settings', element: <SettingsPage /> },",
  "{ path: 'settings', element: <SettingsPage /> }," + routesToAdd
);

fs.writeFileSync('src/app/router.tsx', code);
