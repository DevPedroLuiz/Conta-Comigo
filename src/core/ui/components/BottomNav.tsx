import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Target, Settings, Plus } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Ajustes', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => navigate('/transactions/new')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-background border-t border-border flex items-center justify-around px-2 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-indigo-600/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
