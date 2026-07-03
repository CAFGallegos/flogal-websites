import { STATUS_LABEL, STATUS_CLASS } from '@/lib/labels';
import type { UnitStatus } from '@/lib/types';

export function StatusPill({ status }: { status: UnitStatus }) {
  return (
    <span className={`mx-pill ${STATUS_CLASS[status] ?? 's-neutral'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
