import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/--color-background: #ffffff;/g, '--color-background: hsl(var(--background));');
css = css.replace(/--color-foreground: #09090b;/g, '--color-foreground: hsl(var(--foreground));');
css = css.replace(/--color-card: #fafafa;/g, '--color-card: hsl(var(--card));');
css = css.replace(/--color-card-foreground: #09090b;/g, '--color-card-foreground: hsl(var(--card-foreground));');
css = css.replace(/--color-popover: #ffffff;/g, '--color-popover: hsl(var(--popover));');
css = css.replace(/--color-popover-foreground: #09090b;/g, '--color-popover-foreground: hsl(var(--popover-foreground));');
css = css.replace(/--color-primary: #4f46e5;/g, '--color-primary: hsl(var(--primary));');
css = css.replace(/--color-primary-foreground: #ffffff;/g, '--color-primary-foreground: hsl(var(--primary-foreground));');
css = css.replace(/--color-secondary: #f4f4f5;/g, '--color-secondary: hsl(var(--secondary));');
css = css.replace(/--color-secondary-foreground: #18181b;/g, '--color-secondary-foreground: hsl(var(--secondary-foreground));');
css = css.replace(/--color-muted: #f4f4f5;/g, '--color-muted: hsl(var(--muted));');
css = css.replace(/--color-muted-foreground: #71717a;/g, '--color-muted-foreground: hsl(var(--muted-foreground));');
css = css.replace(/--color-accent: #f4f4f5;/g, '--color-accent: hsl(var(--accent));');
css = css.replace(/--color-accent-foreground: #18181b;/g, '--color-accent-foreground: hsl(var(--accent-foreground));');
css = css.replace(/--color-destructive: #e11d48;/g, '--color-destructive: hsl(var(--destructive));');
css = css.replace(/--color-destructive-foreground: #ffffff;/g, '--color-destructive-foreground: hsl(var(--destructive-foreground));');
css = css.replace(/--color-border: #e4e4e7;/g, '--color-border: hsl(var(--border));');
css = css.replace(/--color-input: #e4e4e7;/g, '--color-input: hsl(var(--input));');
css = css.replace(/--color-ring: #4f46e5;/g, '--color-ring: hsl(var(--ring));');

fs.writeFileSync('src/index.css', css);
