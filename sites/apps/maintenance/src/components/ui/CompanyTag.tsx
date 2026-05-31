import { COMPANY_DOT, COMPANY_SHORT } from '@/lib/labels';
import type { CompanyId } from '@/lib/types';

export function CompanyTag({ id }: { id: CompanyId }) {
  return (
    <span className="mx-co-tag">
      <i style={{ background: COMPANY_DOT[id] }} />
      {COMPANY_SHORT[id] ?? id.toUpperCase()}
    </span>
  );
}
