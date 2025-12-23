import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">GitHub Profiles</h1>
            <p className="text-xs text-muted-foreground">Gerenciador de Perfis</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
