'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { StatusPill } from '@/components/ui/StatusPill';
import { PartPill } from '@/components/ui/PartPill';
import { Priority } from '@/components/ui/Priority';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SERVICE_TYPE_LABEL } from '@/lib/labels';
import { shortDate, weekStart } from '@/lib/utils';
import type { MxUnit, MxServiceEntry, MxPartNeeded } from '@/lib/types';

function Kpi({ label, value, meta, tone, onClick }: { label: string; value: number | string; meta: string; tone: string; onClick?: () => void }) {
  return (
    <div className={`mx-kpi k-${tone}`} onClick={onClick}>
      <span className="mx-kpi-accent" />
      <div className="mx-kpi-lab">{label}</div>
      <div className="mx-kpi-val">{value}</div>
      <div className="mx-kpi-meta">{meta}</div>
    </div>
  );
}

interface MiniTableProps {
  title: string;
  sub?: string;
  cols: string[];
  empty?: string;
  onMore?: string;
  children: React.ReactNode;
  hasRows: boolean;
}

function MiniTable({ title, sub, cols, empty, onMore, children, hasRows }: MiniTableProps) {
  return (
    <div className="mx-card mx-card-elev">
      <div className="mx-card-h">
        <div className="mx-card-h-l">
          <span className="mx-card-title">{title}</span>
          {sub && <span className="mx-card-sub">{sub}</span>}
        </div>
        {onMore && (
          <Link href={onMore} className="mx-card-link">View all</Link>
        )}
      </div>
      {!hasRows ? (
        <EmptyState title={empty ?? 'All clear'} />
      ) : (
        <div className="mx-tablewrap">
          <table className="mx-table">
            <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { selectedCompanyId } = useApp();
  const router = useRouter();
  const [units, setUnits] = useState<MxUnit[]>([]);
  const [entries, setEntries] = useState<MxServiceEntry[]>([]);
  const [parts, setParts] = useState<MxPartNeeded[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const co = selectedCompanyId;

    async function load() {
      setLoading(true);
      const [uRes, eRes, pRes] = await Promise.all([
        (() => {
          let q = supabase.from('mx_units').select('*');
          if (co !== 'all') q = q.eq('company_id', co);
          return q;
        })(),
        (() => {
          let q = supabase.from('mx_service_entries').select('*, mx_units(unit_number, company_id)').order('entry_date', { ascending: false }).limit(100);
          if (co !== 'all') q = q.eq('company_id', co);
          return q;
        })(),
        (() => {
          let q = supabase.from('mx_parts_needed').select('*, mx_units(unit_number)');
          if (co !== 'all') q = q.eq('company_id', co);
          return q;
        })(),
      ]);
      setUnits(uRes.data ?? []);
      setEntries(eRes.data ?? []);
      setParts(pRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [selectedCompanyId]);

  const active   = units.filter((u) => u.status !== 'inactive_sold').length;
  const ready    = units.filter((u) => u.status === 'ready_for_dispatch').length;
  const down     = units.filter((u) => u.status === 'still_down').length;
  const waiting  = units.filter((u) => u.status === 'waiting_on_parts').length;
  const safety   = entries.filter((e) => e.priority === 'safety_dot' && !e.approved).length
                 + parts.filter((p) => p.priority === 'safety_dot' && p.status !== 'installed').length;
  const open     = entries.filter((e) => e.status_after !== 'ready_for_dispatch').length;
  const ws       = weekStart();
  const doneWk   = entries.filter((e) => e.approved && e.status_after === 'ready_for_dispatch' && e.entry_date >= ws).length;

  const downUnits  = units.filter((u) => ['still_down','needs_outside_shop'].includes(u.status));
  const waitUnits  = units.filter((u) => u.status === 'waiting_on_parts');
  const recent     = entries.slice(0, 5);
  const safetyRows = entries.filter((e) => e.priority === 'safety_dot').slice(0, 5);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-page-wide">
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><span className="mx-live" />Live · {today}</span>
          <h1 className="mx-title">Maintenance dashboard</h1>
        </div>
        <div className="mx-page-h-actions">
          <button className="mx-btn"><Download size={16} />Export</button>
          <Link href="/new-entry" className="mx-btn mx-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />New entry
          </Link>
        </div>
      </div>

      <div className="mx-kpis">
        <Kpi tone="neutral" label="Active units" value={active}  meta={`${units.length} total`}          onClick={() => router.push('/units')} />
        <Kpi tone="ready"   label="Ready"         value={ready}   meta="for dispatch"                     onClick={() => router.push('/units')} />
        <Kpi tone="down"    label="Units down"    value={down}    meta="needs repair"                     onClick={() => router.push('/units')} />
        <Kpi tone="wait"    label="Waiting parts" value={waiting} meta={`${parts.filter((p) => p.status === 'ordered').length} on order`} onClick={() => router.push('/parts')} />
        <Kpi tone="down"    label="Safety / DOT"  value={safety}  meta="priority"                        onClick={() => router.push('/parts')} />
        <Kpi tone="info"    label="Open entries"  value={open}    meta="in progress"                     onClick={() => router.push('/completed')} />
        <Kpi tone="ready"   label="Done · week"   value={doneWk}  meta="completed"                       onClick={() => router.push('/completed')} />
      </div>

      <div className="mx-grid-2" style={{ marginBottom: 18 }}>
        <MiniTable
          title="Trucks down" sub="Out of service — needs repair"
          cols={['Unit','Company','Issue','Status','']}
          onMore="/units" hasRows={downUnits.length > 0}
        >
          {downUnits.map((u) => (
            <tr key={u.id}>
              <td><span className="mx-unit">{u.unit_number}</span></td>
              <td><CompanyTag id={u.company_id} /></td>
              <td className="mx-sub" style={{ maxWidth: 220 }}>{u.current_issue ?? '—'}</td>
              <td><StatusPill status={u.status} /></td>
              <td style={{ textAlign: 'right' }}>
                <Link href={`/units/${u.id}`} className="mx-rowact" style={{ textDecoration: 'none' }}>Open</Link>
              </td>
            </tr>
          ))}
        </MiniTable>

        <MiniTable
          title="Waiting on parts" sub="Repair blocked until part arrives"
          cols={['Unit','Part needed','Part']}
          onMore="/parts" hasRows={waitUnits.length > 0}
        >
          {waitUnits.map((u) => {
            const part = parts.find((p) => p.unit_id === u.id && p.status !== 'installed');
            return (
              <tr key={u.id}>
                <td>
                  <span className="mx-unit">{u.unit_number}</span>
                  <div className="mx-sub"><CompanyTag id={u.company_id} /></div>
                </td>
                <td className="mx-strong">{u.parts_needed ?? '—'}</td>
                <td><PartPill status={part?.status ?? 'needed'} /></td>
              </tr>
            );
          })}
        </MiniTable>
      </div>

      <div className="mx-grid-2">
        <MiniTable
          title="Recent service entries" sub="Latest logged work"
          cols={['Unit','Type','Mechanic','Date','Status']}
          onMore="/completed" hasRows={recent.length > 0}
        >
          {recent.map((e) => (
            <tr key={e.id}>
              <td><span className="mx-unit">{e.mx_units?.unit_number ?? '—'}</span></td>
              <td>{SERVICE_TYPE_LABEL[e.service_type] ?? e.service_type}</td>
              <td className="mx-sub">{e.mechanic ?? '—'}</td>
              <td className="mx-mono">{shortDate(e.entry_date)}</td>
              <td><StatusPill status={e.status_after} /></td>
            </tr>
          ))}
        </MiniTable>

        <MiniTable
          title="Safety / DOT priority" sub="Out-of-service flags — handle first"
          cols={['Unit','Issue','Priority']}
          empty="No safety flags" hasRows={safetyRows.length > 0}
        >
          {safetyRows.map((e) => (
            <tr key={e.id}>
              <td>
                <span className="mx-unit">{e.mx_units?.unit_number ?? '—'}</span>
                {e.mx_units?.company_id && (
                  <div className="mx-sub"><CompanyTag id={e.mx_units.company_id} /></div>
                )}
              </td>
              <td className="mx-sub" style={{ maxWidth: 200 }}>{e.issue_reported ?? '—'}</td>
              <td><Priority value={e.priority} /></td>
            </tr>
          ))}
        </MiniTable>
      </div>
    </div>
  );
}
