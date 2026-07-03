'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Download, Plus, Package } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { PartPill } from '@/components/ui/PartPill';
import { Priority } from '@/components/ui/Priority';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PART_STATUS_LABEL, PART_STATUSES } from '@/lib/labels';
import { shortDate } from '@/lib/utils';
import type { MxPartNeeded, PartStatus } from '@/lib/types';

const CHIPS = [
  { k: 'all',    label: 'All',         test: (_: MxPartNeeded) => true },
  { k: 'needed', label: 'Needed',      test: (p: MxPartNeeded) => p.status === 'needed' },
  { k: 'ordered',label: 'Ordered',     test: (p: MxPartNeeded) => p.status === 'ordered' },
  { k: 'received',label: 'Received',   test: (p: MxPartNeeded) => p.status === 'received' },
  { k: 'down',   label: 'Truck down',  test: (p: MxPartNeeded) => p.priority === 'truck_down' },
  { k: 'safety', label: 'Safety / DOT',test: (p: MxPartNeeded) => p.priority === 'safety_dot' },
];

export default function PartsPage() {
  const { selectedCompanyId } = useApp();
  const [parts, setParts] = useState<MxPartNeeded[]>([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const q = supabase
      .from('mx_parts_needed')
      .select('*, mx_units(unit_number)')
      .order('date_requested', { ascending: false });
    const query = selectedCompanyId !== 'all' ? q.eq('company_id', selectedCompanyId) : q;
    const { data } = await query;
    setParts(data ?? []);
    setLoading(false);
  }, [selectedCompanyId]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: PartStatus) {
    setUpdatingId(id);
    const supabase = createClient();
    await supabase.from('mx_parts_needed').update({ status }).eq('id', id);
    setParts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    setUpdatingId(null);
  }

  const activeChip = CHIPS.find((c) => c.k === chip) ?? CHIPS[0];
  const rows = parts.filter(activeChip.test);

  return (
    <div className="mx-page-wide">
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><Package size={13} />Daily action list</span>
          <h1 className="mx-title">Parts needed</h1>
        </div>
        <div className="mx-page-h-actions">
          <button className="mx-btn"><Download size={16} />Export</button>
          <Link href="/new-entry" className="mx-btn mx-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />Add part
          </Link>
        </div>
      </div>

      <div className="mx-filters">
        <div className="mx-chips">
          {CHIPS.map((c) => (
            <button
              key={c.k}
              className={`mx-chip${chip === c.k ? ' is-active' : ''}`}
              onClick={() => setChip(c.k)}
            >
              {c.label}
              <span className="mx-chip-n">{parts.filter(c.test).length}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="mx-card mx-card-elev">
          {rows.length === 0 ? (
            <EmptyState title="No parts" description="No parts match this filter." />
          ) : (
            <div className="mx-tablewrap">
              <table className="mx-table">
                <thead>
                  <tr>
                    <th>Part name</th><th>Unit</th><th>Company</th><th>Priority</th>
                    <th>Qty</th><th>Requested by</th><th>Date</th><th>Vendor</th>
                    <th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="mx-strong">{p.part_name}</span>
                        {p.notes && <div className="mx-sub">{p.notes}</div>}
                      </td>
                      <td>
                        {p.mx_units ? (
                          <Link href={`/units/${p.unit_id}`} className="mx-unit" style={{ textDecoration: 'none' }}>
                            {p.mx_units.unit_number}
                          </Link>
                        ) : <span className="mx-sub">—</span>}
                      </td>
                      <td><CompanyTag id={p.company_id} /></td>
                      <td><Priority value={p.priority} /></td>
                      <td className="mx-num">{p.quantity}</td>
                      <td className="mx-sub">{p.requested_by ?? '—'}</td>
                      <td className="mx-mono">{shortDate(p.date_requested)}</td>
                      <td className="mx-sub">{p.vendor ?? '—'}</td>
                      <td><PartPill status={p.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="mx-select"
                          value={p.status}
                          style={{ minHeight: 34, padding: '6px 32px 6px 10px', fontSize: 12, width: 130 }}
                          disabled={updatingId === p.id}
                          onChange={(e) => updateStatus(p.id, e.target.value as PartStatus)}
                        >
                          {PART_STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
