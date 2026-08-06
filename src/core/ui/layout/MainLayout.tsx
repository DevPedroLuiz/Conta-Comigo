import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Tags, Briefcase, Target, Settings, LogOut, BarChart3, Sun, Moon, Monitor, CreditCard, Repeat } from 'lucide-react';
import { useAuth, useUser } from '../../../modules/auth/hooks/useAuth';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Button } from '../components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/dropdown-menu';
import { useTheme } from '../../providers/ThemeProvider';
import { BottomNav } from '../components/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';

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
          <img src="/logo-contacomigo.jpeg" alt="Conta-Comigo Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Conta-Comigo</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
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

        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border bg-card px-4 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <img src="/logo-contacomigo.jpeg" alt="Conta-Comigo Logo" className="h-7 w-7 rounded-md object-cover shadow-sm" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Conta-Comigo</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                  {userName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:opacity-80 transition-opacity">
                      <span className="text-sm text-muted-foreground">{userName}</span>
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-card text-muted-foreground">{initial}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                      {userName}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
