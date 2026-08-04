import fs from 'fs';
const path = 'src/core/ui/layout/MainLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
  "import { LayoutDashboard, Receipt, Wallet, Tags, Target, Settings, LogOut, BarChart3 } from 'lucide-react';",
  "import { LayoutDashboard, Receipt, Wallet, Tags, Target, Settings, LogOut, BarChart3, Sun, Moon, Monitor } from 'lucide-react';"
);

content = content.replace(
  "import { Button } from '../components/button';",
  "import { Button } from '../components/button';\nimport { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/dropdown-menu';\nimport { useTheme } from '../../providers/ThemeProvider';"
);

// Add useTheme inside component
content = content.replace(
  "  const { logout } = useAuth();",
  "  const { logout } = useAuth();\n  const { theme, setTheme } = useTheme();"
);

// Add theme toggler
const themeToggler = `
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
`;

content = content.replace(
  /<div className="flex items-center gap-3 border-l border-border pl-4">/,
  `<div className="flex items-center gap-2 border-l border-border pl-4">\n${themeToggler}`
);

fs.writeFileSync(path, content);
