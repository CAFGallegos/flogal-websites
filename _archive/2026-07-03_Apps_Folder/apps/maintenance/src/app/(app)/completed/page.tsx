'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { StatusPill } from '@/components/ui/StatusPill';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { DriveLink } from '@/components/ui/DriveLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SERVICE_TYPE_LABEL } from '@/lib/labels';
import { shortDate, weekLabel, weekStart } from '@/lib/utils';
import type { MxServiceEntry } from '@/lib/types';

function Kpi({ label, value, meta, tone }: { label: string; value: string | number; meta: string; tone: string }) {
  return (
    <div className={`mx-kpi k-${tone}`}>
      <span className="mx-kpi-accent" />
      <div className="mx-kpi-lab">{label}</div>
      <div className="mx-kpi-val">{value}</div>
      <div className="mx-kpi-meta">{meta}</div>
    </div>
  );
}

export default function CompletedPage() {
  const { selectedCompanyId } = useApp();
  const [entries, setEntries] = useState<MxServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);
    const ws = weekStart();
    const q = supabase
      .from('mx_service_entries')
      .select('*, mx_units(unit_number, company_id)')
      .gte('entry_date', ws)
      .order('entry_date', { ascending: false });
    (selectedCompanyId !== 'all' ? q.eq('company_id', selectedCompanyId) : q)
      .then(({ data }) => { setEntries(data ?? []); setLoading(false); });
  }, [selectedCompanyId]);

  const totalLabor = entries.reduce((s, e) => s + (e.labor_hours ?? 0), 0).toFixed(1);
  const completed = entries.filter((e) => e.status_after === 'ready_for_dispatch').length;

  return (
    <div className="mx-page-wide">
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><CheckCircle2 size={13} />{weekLabel()}</span>
          <h1 className="mx-title">Work completed</h1>
        </div>
        <div className="mx-page-h-actions">
          <button className="mx-btn"><Download size={16} />Export to Drive</button>
        </div>
      </div>

      <div className="mx-kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 720 }}>
        <Kpi tone="info"    label="Entries logged"   value={entries.length} meta="this week" />
        <Kpi tone="ready"   label="Back in service"  value={completed} meta="ready for dispatch" />
        <Kpi tone="neutral" label="Labor hours"       value={totalLabor} meta="logged" />
        <Kpi tone="wait"    label="Still open"        value={entries.length - completed} meta="carry over" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="mx-card mx-card-elev">
          {entries.length === 0 ? (
            <EmptyState title="No entries this week" description="No service entries logged this week yet." />
          ) : (
            <div className="mx-tablewrap">
              <table className="mx-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Unit</th><th>Company</th><th>Mechanic</th>
                    <th>Service type</th><th>Work performed</th><th>Parts used</th>
                    <th>Labor</th><th>Final status</th><th>Links</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td className="mx-mono">{shortDate(e.entry_date)}</td>
                      <td>
                        <Link href={`/units/${e.unit_id}`} className="mx-unit" style={{ textDecoration: 'none' }}>
                          {e.mx_units?.unit_number ?? '—'}
                        </Link>
                      </td>
                      <td>{e.mx_units?.company_id ? <CompanyTag id={e.mx_units.company_id} /> : '—'}</td>
                      <td className="mx-sub">{e.mechanic ?? '—'}</td>
                      <td>{SERVICE_TYPE_LABEL[e.service_type]}</td>
                      <td className="mx-sub" style={{ maxWidth: 280 }}>{e.work_performed ?? '—'}</td>
                      <td className="mx-sub">{e.parts_used ?? '—'}</td>
                      <td className="mx-num">{e.labor_hours ? `${e.labor_hours}h` : '—'}</td>
                      <td><StatusPill status={e.status_after} /></td>
                      <td onClick={(ev) => ev.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <DriveLink href={e.invoice_link} label="Invoice" compact />
                          <DriveLink href={e.photo_folder_link} label="Photos" compact />
                        </div>
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
