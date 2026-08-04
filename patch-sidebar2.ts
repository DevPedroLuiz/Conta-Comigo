import fs from 'fs';

let content = fs.readFileSync('src/core/ui/layout/MainLayout.tsx', 'utf8');

if (!content.includes('CalendarDays')) {
  content = content.replace(
    "import { LayoutDashboard, Receipt, Wallet, Tags, Target, FileBarChart, Settings, LogOut, Menu, CreditCard, Repeat } from 'lucide-react';",
    "import { LayoutDashboard, Receipt, Wallet, Tags, Target, FileBarChart, Settings, LogOut, Menu, CreditCard, Repeat, CalendarDays, PieChart } from 'lucide-react';"
  );
  
  content = content.replace(
    "{ icon: Repeat, label: 'Assinaturas', path: '/subscriptions' },",
    "{ icon: Repeat, label: 'Assinaturas', path: '/subscriptions' },\n  { icon: CalendarDays, label: 'Calendário', path: '/calendar' },\n  { icon: PieChart, label: 'Orçamentos', path: '/budgets' },"
  );
  
  fs.writeFileSync('src/core/ui/layout/MainLayout.tsx', content);
  console.log('patched sidebar');
}
