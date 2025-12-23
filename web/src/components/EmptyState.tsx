import { Users, SearchX } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-members' | 'no-results';
  searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="rounded-full bg-muted p-4 mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Não encontramos membros para "{searchQuery}". Tente buscar por nome, username, organização ou localização.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhum membro cadastrado
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Comece adicionando seu primeiro perfil do GitHub para monitorar.
      </p>
    </div>
  );
}
