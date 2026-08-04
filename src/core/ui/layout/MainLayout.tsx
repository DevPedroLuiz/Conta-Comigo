import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Tags, Briefcase, Target, Settings, LogOut, BarChart3, Sun, Moon, Monitor, CreditCard, Repeat } from 'lucide-react';
import { useAuth, useUser } from '../../../modules/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Button } from '../components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/dropdown-menu';
import { useTheme } from '../../providers/ThemeProvider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Contas', href: '/accounts', icon: Wallet },
  { name: 'Cartões', href: '/credit-cards', icon: CreditCard },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Assinaturas', href: '/subscriptions', icon: Repeat },
  { name: 'Investimentos', href: '/investments', icon: Briefcase },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const user = useUser();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const userName = user?.userMetadata?.name || user?.userMetadata?.full_name || 'Usuário';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="h-screen w-full bg-background text-muted-foreground font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex md:flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Conta Comigo</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
           <div className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Menu Principal</div>
           {navigation.map((item) => {
             const isActive = location.pathname.startsWith(item.href);
             return (
               <Link
                 key={item.name}
                 to={item.href}
                 className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                   isActive 
                     ? 'bg-card text-foreground' 
                     : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                 }`}
               >
                 <item.icon className="w-4 h-4" />
                 {item.name}
               </Link>
             );
           })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Mobile Header (Fallback) */}
        <header className="md:hidden border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Conta Comigo</h1>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </header>
        
        {/* Top Header */}
        <header className="hidden md:flex h-16 border-b border-border items-center justify-between px-8 bg-card/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 border-l border-border pl-4">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Alternar tema</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Escuro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>Sistema</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-sm text-muted-foreground">{userName}</span>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-card text-muted-foreground">{initial}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-foreground ml-2">
                  <LogOut className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
