import { cn } from '@/lib/utils';
import { Member } from '@/types/member';

interface StatusBadgeProps {
  status: Member['scraping_status'];
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    className: 'bg-status-pending/20 text-status-pending border-status-pending/30',
  },
  processing: {
    label: 'Processando',
    className: 'bg-status-processing/20 text-status-processing border-status-processing/30',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-status-completed/20 text-status-completed border-status-completed/30',
  },
  failed: {
    label: 'Falhou',
    className: 'bg-status-failed/20 text-status-failed border-status-failed/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        status === 'processing' && 'animate-pulse',
        className
      )}
    >
      {status === 'processing' && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
