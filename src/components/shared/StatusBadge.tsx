import { cn } from '@/lib/utils';
import { ProjectStatus } from '@/types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusStyles: Record<ProjectStatus, string> = {
  'Em andamento': 'bg-primary-light text-primary border-primary/20',
  'Finalizado': 'bg-success/10 text-success border-success/20',
  'Aguardando': 'bg-warning/10 text-warning border-warning/20',
  'Cancelado': 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
