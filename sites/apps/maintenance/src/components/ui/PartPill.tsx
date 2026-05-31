import { PART_STATUS_LABEL, PART_STATUS_CLASS } from '@/lib/labels';
import type { PartStatus } from '@/lib/types';

export function PartPill({ status }: { status: PartStatus }) {
  return (
    <span className={`mx-pill ${PART_STATUS_CLASS[status] ?? 's-neutral'}`}>
      {PART_STATUS_LABEL[status] ?? status}
    </span>
  );
}
