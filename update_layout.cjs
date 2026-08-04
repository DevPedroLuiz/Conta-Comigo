const fs = require('fs');

let code = fs.readFileSync('src/core/ui/layout/MainLayout.tsx', 'utf8');

const importToReplace = "import { LayoutDashboard, Receipt, Wallet, Tags, Target, Settings, LogOut, BarChart3, Sun, Moon, Monitor } from 'lucide-react';";
const replacementImport = "import { LayoutDashboard, Receipt, Wallet, Tags, Target, Settings, LogOut, BarChart3, Sun, Moon, Monitor, CreditCard, Repeat } from 'lucide-react';";
code = code.replace(importToReplace, replacementImport);

const navToReplace = `  { name: 'Contas', href: '/accounts', icon: Wallet },
  { name: 'Categorias', href: '/categories', icon: Tags },`;
const replacementNav = `  { name: 'Contas', href: '/accounts', icon: Wallet },
  { name: 'Cartões', href: '/credit-cards', icon: CreditCard },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Assinaturas', href: '/subscriptions', icon: Repeat },`;
code = code.replace(navToReplace, replacementNav);

fs.writeFileSync('src/core/ui/layout/MainLayout.tsx', code);
