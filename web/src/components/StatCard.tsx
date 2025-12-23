import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number | null;
  className?: string;
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  const displayValue = value ?? '—';

  return (
    <div className={cn('glass-card rounded-lg p-4', className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground font-mono">
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </p>
        </div>
      </div>
    </div>
  );
}
