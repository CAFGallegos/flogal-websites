import { PRIORITY_LABEL, PRIORITY_CLASS, PRIORITY_DOT_COLOR } from '@/lib/labels';
import type { PriorityLevel } from '@/lib/types';

export function Priority({ value }: { value: PriorityLevel }) {
  return (
    <span className={`mx-prio ${PRIORITY_CLASS[value] ?? 'p-normal'}`}>
      <i style={{ background: PRIORITY_DOT_COLOR[value] }} />
      {PRIORITY_LABEL[value] ?? value}
    </span>
  );
}
