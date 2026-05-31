'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Plus, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { StatusPill } from '@/components/ui/StatusPill';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UNIT_TYPES, UNIT_STATUSES, UNIT_TYPE_LABEL } from '@/lib/labels';
import { shortDate } from '@/lib/utils';
import type { MxUnit, UnitType, UnitStatus } from '@/lib/types';
import { Truck } from 'lucide-react';

export default function UnitsPage() {
  const { selectedCompanyId } = useApp();
  const [units, setUnits] = useState<MxUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<UnitType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');

  useEffect(() => {
    const supabase = createClient();
    const co = selectedCompanyId;
    setLoading(true);
    const q = supabase.from('mx_units').select('*, mx_locations(name)').order('unit_number');
    (co !== 'all' ? q.eq('company_id', co) : q).then(({ data }) => {
      setUnits(data ?? []);
      setLoading(false);
    });
  }, [selectedCompanyId]);

  const rows = units.filter((u) => {
    if (typeFilter !== 'all' && u.unit_type !== typeFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (query && !u.unit_number.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-page-wide">
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><Truck size={13} />Fleet</span>
          <h1 className="mx-title">Units</h1>
        </div>
        <div className="mx-page-h-actions">
          <button className="mx-btn"><Download size={16} />Export</button>
          <Link href="/new-entry" className="mx-btn mx-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />New entry
          </Link>
        </div>
      </div>

      <div className="mx-filters">
        <div className="mx-search" style={{ maxWidth: 240, height: 40 }}>
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search unit number…" />
        </div>
        <div className="mx-filter">
          <label>Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as UnitType | 'all')}>
            <option value="all">All</option>
            {UNIT_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="mx-filter">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'all')}>
            <option value="all">All</option>
            {UNIT_STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span className="mx-sub" style={{ marginLeft: 'auto' }}>
          {rows.length} of {units.length} units
        </span>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="mx-card mx-card-elev">
          {rows.length === 0 ? (
            <EmptyState title="No units found" description="Try adjusting your filters." />
          ) : (
            <div className="mx-tablewrap">
              <table className="mx-table">
                <thead>
                  <tr>
                    <th>Unit</th><th>Company</th><th>Location</th><th>Type</th>
                    <th>Status</th><th>Current issue</th><th>Parts needed</th>
                    <th>Last service</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id} onClick={() => window.location.href = `/maintenance/units/${u.id}`}>
                      <td><span className="mx-unit">{u.unit_number}</span></td>
                      <td><CompanyTag id={u.company_id} /></td>
                      <td className="mx-sub">{u.mx_locations?.name ?? '—'}</td>
                      <td>{UNIT_TYPE_LABEL[u.unit_type]}</td>
                      <td><StatusPill status={u.status} /></td>
                      <td className="mx-sub" style={{ maxWidth: 220 }}>{u.current_issue ?? '—'}</td>
                      <td className="mx-sub">{u.parts_needed ?? '—'}</td>
                      <td className="mx-mono">{shortDate(u.last_service_date)}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link
                            href={`/new-entry?unit=${u.unit_number}`}
                            className="mx-rowact"
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Plus size={14} />Entry
                          </Link>
                          <Link
                            href={`/units/${u.id}`}
                            className="mx-rowact"
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            History
                          </Link>
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
