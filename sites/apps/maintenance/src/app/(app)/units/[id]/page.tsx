'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, FolderOpen, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatusPill } from '@/components/ui/StatusPill';
import { PartPill } from '@/components/ui/PartPill';
import { Priority } from '@/components/ui/Priority';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { DriveLink } from '@/components/ui/DriveLink';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  SERVICE_TYPE_LABEL, UNIT_TYPE_LABEL, STATUS_DOT_CLASS,
} from '@/lib/labels';
import { shortDate, fmt } from '@/lib/utils';
import type { MxUnit, MxServiceEntry, MxPartNeeded } from '@/lib/types';

function Meta({ k, v, mono }: { k: string; v: string | null | undefined; mono?: boolean }) {
  return (
    <div className="mx-meta-cell">
      <span className="mx-meta-k">{k}</span>
      <span className={`mx-meta-v${mono ? ' mono' : ''}`}>{v ?? '—'}</span>
    </div>
  );
}

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<MxUnit | null>(null);
  const [entries, setEntries] = useState<MxServiceEntry[]>([]);
  const [parts, setParts] = useState<MxPartNeeded[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('mx_units').select('*, mx_locations(name)').eq('id', id).single(),
      supabase.from('mx_service_entries').select('*').eq('unit_id', id).order('entry_date', { ascending: false }),
      supabase.from('mx_parts_needed').select('*').eq('unit_id', id).order('date_requested', { ascending: false }),
    ]).then(([uRes, eRes, pRes]) => {
      setUnit(uRes.data ?? null);
      setEntries(eRes.data ?? []);
      setParts(pRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!unit) return (
    <div className="mx-page-wide">
      <EmptyState icon={AlertTriangle} title="Unit not found" description="This unit does not exist or you don't have access." />
    </div>
  );

  const open = entries.filter((e) => e.status_after !== 'ready_for_dispatch');

  return (
    <div style={{ maxWidth: 1200 }}>
      <Link href="/units" className="mx-btn mx-btn-ghost" style={{ marginBottom: 14, paddingLeft: 8, textDecoration: 'none' }}>
        <ChevronLeft size={16} />Back to units
      </Link>

      <div className="mx-page-h" style={{ marginBottom: 18 }}>
        <div>
          <span className="mx-eyebrow">
            <CompanyTag id={unit.company_id} /> · {UNIT_TYPE_LABEL[unit.unit_type]}
          </span>
          <h1 className="mx-title" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="mx-unit" style={{ fontSize: 30 }}>{unit.unit_number}</span>
            <StatusPill status={unit.status} />
          </h1>
          <div className="mx-sub" style={{ marginTop: 6, fontSize: 14 }}>
            {unit.year} {unit.make} {unit.model}
          </div>
        </div>
        <div className="mx-page-h-actions">
          {unit.unit_folder_link && (
            <a className="mx-btn" href={unit.unit_folder_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <FolderOpen size={16} />Drive folder
            </a>
          )}
          <Link href={`/new-entry?unit=${unit.unit_number}`} className="mx-btn mx-btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />Add service entry
          </Link>
        </div>
      </div>

      {/* Answer-quick banner */}
      <div className="mx-card mx-card-elev" style={{ padding: '16px 20px', marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        <div>
          <div className="mx-meta-k">What's wrong</div>
          <div className="mx-meta-v" style={{ marginTop: 5, fontWeight: 600 }}>{unit.current_issue ?? 'No active issue'}</div>
        </div>
        <div>
          <div className="mx-meta-k">Parts needed</div>
          <div className="mx-meta-v" style={{ marginTop: 5 }}>{unit.parts_needed ?? '—'}</div>
        </div>
        <div>
          <div className="mx-meta-k">Last service</div>
          <div className="mx-meta-v mono" style={{ marginTop: 5 }}>{shortDate(unit.last_service_date)}</div>
        </div>
        <div>
          <div className="mx-meta-k">Ready to work?</div>
          <div style={{ marginTop: 7 }}><StatusPill status={unit.status} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div className="mx-section-gap">
          {/* Open entries */}
          {open.length > 0 && (
            <div className="mx-card mx-card-elev">
              <div className="mx-card-h">
                <span className="mx-card-title">Open service entries</span>
                <span className="mx-pill s-wait">{open.length} open</span>
              </div>
              <div className="mx-tablewrap">
                <table className="mx-table">
                  <thead><tr><th>ID</th><th>Type</th><th>Issue</th><th>Mechanic</th><th>Status</th></tr></thead>
                  <tbody>
                    {open.map((e) => (
                      <tr key={e.id}>
                        <td className="mx-mono">{e.id}</td>
                        <td>{SERVICE_TYPE_LABEL[e.service_type]}</td>
                        <td className="mx-sub" style={{ maxWidth: 260 }}>{e.issue_reported ?? '—'}</td>
                        <td className="mx-sub">{e.mechanic ?? '—'}</td>
                        <td><StatusPill status={e.status_after} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Service history timeline */}
          <div className="mx-card mx-card-elev">
            <div className="mx-card-h">
              <span className="mx-card-title">Service history</span>
              <span className="mx-card-sub">{entries.length} entries</span>
            </div>
            <div style={{ padding: 20 }}>
              {entries.length === 0 ? (
                <EmptyState title="No service entries" description="Add the first service entry for this unit." />
              ) : (
                <div className="mx-timeline">
                  {entries.map((e) => (
                    <div className="mx-tl-item" key={e.id}>
                      <div className={`mx-tl-dot ${STATUS_DOT_CLASS[e.status_after] ?? ''}`} />
                      <div className="mx-tl-date">{shortDate(e.entry_date)} · {e.id}</div>
                      <div className="mx-tl-card">
                        <div className="mx-tl-head">
                          <span className="mx-tl-type">{SERVICE_TYPE_LABEL[e.service_type]}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Priority value={e.priority} />
                            <StatusPill status={e.status_after} />
                          </div>
                        </div>
                        <div className="mx-tl-body">
                          {e.issue_reported && <><b style={{ color: 'var(--nardo-ink)' }}>Issue.</b> {e.issue_reported}<br /></>}
                          {e.work_performed && <><b style={{ color: 'var(--nardo-ink)' }}>Work.</b> {e.work_performed}</>}
                        </div>
                        <div className="mx-tl-foot">
                          {e.mechanic && <span><b>Mechanic</b> {e.mechanic}</span>}
                          {e.labor_hours && <span><b>Labor</b> {e.labor_hours}h</span>}
                          {e.parts_used && e.parts_used !== '—' && <span><b>Parts used</b> {e.parts_used}</span>}
                          {e.approved && <span style={{ color: 'var(--st-ready)' }}><b style={{ color: 'var(--st-ready)' }}>Approved</b> {e.approved_by}</span>}
                        </div>
                        {(e.scanner_report_link || e.photo_folder_link || e.invoice_link) && (
                          <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--nardo-border-soft)' }}>
                            <DriveLink href={e.scanner_report_link} label="Scanner report" compact />
                            <DriveLink href={e.photo_folder_link} label="Photos" compact />
                            <DriveLink href={e.invoice_link} label="Invoice" compact />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="mx-section-gap" style={{ position: 'sticky', top: 78 }}>
          {/* Unit record */}
          <div className="mx-card mx-card-elev" style={{ padding: '6px 20px 14px' }}>
            <div className="mx-card-title" style={{ padding: '14px 0 6px' }}>Unit record</div>
            <div className="mx-meta-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Meta k="Company" v={unit.company_id.toUpperCase()} />
              <Meta k="Operating entity" v={unit.operating_entity} />
              <Meta k="Owner entity" v={unit.owner_entity} />
              <Meta k="Location" v={unit.mx_locations?.name} />
              <Meta k="VIN" v={unit.vin} mono />
              <Meta k="Year / make" v={unit.year ? `${unit.year} ${unit.make}` : unit.make} />
              {unit.odometer ? <Meta k="Odometer" v={`${fmt(unit.odometer)} mi`} mono /> : null}
              {unit.engine_hours ? <Meta k="Engine hours" v={`${fmt(unit.engine_hours)} h`} mono /> : null}
            </div>
            {/* Samsara placeholder */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--nardo-border-soft)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--nardo-faint)', marginBottom: 8 }}>
                Samsara integration — coming soon
              </div>
              <div className="mx-meta-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Meta k="Samsara asset" v={unit.samsara_asset} mono />
                <Meta k="Samsara ID" v={unit.samsara_vehicle_id} mono />
              </div>
            </div>
          </div>

          {/* Parts history */}
          <div className="mx-card mx-card-elev" style={{ padding: 16 }}>
            <div className="mx-kpi-lab" style={{ marginBottom: 10 }}>Parts history</div>
            {parts.length === 0 ? (
              <span className="mx-sub">No parts logged</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {parts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <span className="mx-strong" style={{ flex: 1 }}>
                      {p.part_name}{p.quantity > 1 ? ` ×${p.quantity}` : ''}
                    </span>
                    <PartPill status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files & links */}
          <div className="mx-card mx-card-elev" style={{ padding: 16 }}>
            <div className="mx-kpi-lab" style={{ marginBottom: 10 }}>Files &amp; links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <DriveLink href={unit.unit_folder_link} label="Unit folder" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
