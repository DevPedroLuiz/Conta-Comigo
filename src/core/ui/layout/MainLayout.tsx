import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Tags, Target, Settings, LogOut, BarChart3 } from 'lucide-react';
import { useAuth, useUser } from '../../../modules/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../components/avatar';
import { Button } from '../components/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Contas', href: '/accounts', icon: Wallet },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const user = useUser();
  const { logout } = useAuth();
  
  const userName = user?.userMetadata?.name || user?.userMetadata?.full_name || 'Usuário';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="h-screen w-full bg-[#09090b] text-zinc-100 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-[#0c0c0e] hidden md:flex md:flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Conta Comigo</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
           <div className="px-2 py-2 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Menu Principal</div>
           {navigation.map((item) => {
             const isActive = location.pathname.startsWith(item.href);
             return (
               <Link
                 key={item.name}
                 to={item.href}
                 className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                   isActive 
                     ? 'bg-zinc-800 text-white' 
                     : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
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
      <main className="flex-1 flex flex-col bg-[#09090b]">
        {/* Mobile Header (Fallback) */}
        <header className="md:hidden border-b border-zinc-800 bg-[#0c0c0e] px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-white">Conta Comigo</h1>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </header>
        
        {/* Top Header */}
        <header className="hidden md:flex h-16 border-b border-zinc-800 items-center justify-between px-8 bg-[#0c0c0e]/50">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
                <span className="text-sm text-zinc-300">{userName}</span>
                <Avatar className="h-8 w-8 border border-zinc-800">
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">{initial}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={() => logout()} className="text-zinc-400 hover:text-white ml-2">
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
