const fs = require('fs');

const files = [
  'src/modules/credit-cards/pages/CreditCardsPage.tsx',
  'src/modules/credit-cards/pages/CreditCardCreatePage.tsx',
  'src/modules/credit-cards/pages/CreditCardInvoicesPage.tsx',
  'src/modules/subscriptions/pages/SubscriptionsPage.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /import \{ useAuth \} from '..\/..\/auth\/contexts\/AuthContext';/g,
    "import { useUser } from '../../auth/hooks/useAuth';"
  );
  code = code.replace(/const \{ user \} = useAuth\(\);/g, "const user = useUser();");
  fs.writeFileSync(file, code);
}
