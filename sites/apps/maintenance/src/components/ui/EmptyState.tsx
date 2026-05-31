import type { LucideIcon } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = CheckCircle2,
  title = 'All clear',
  description,
}: EmptyStateProps) {
  return (
    <div className="mx-empty">
      <div className="mx-empty-ic">
        <Icon size={24} />
      </div>
      <div className="mx-empty-t">{title}</div>
      {description && <div className="mx-empty-d">{description}</div>}
    </div>
  );
}
