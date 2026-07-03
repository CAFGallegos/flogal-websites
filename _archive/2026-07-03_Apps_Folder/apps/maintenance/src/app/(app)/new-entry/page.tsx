'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Save, Plus, Package, CheckCircle2, Clock, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { StatusPill } from '@/components/ui/StatusPill';
import { Priority } from '@/components/ui/Priority';
import {
  SERVICE_TYPES, UNIT_STATUSES, PRIORITIES, UNIT_TYPES,
  PRIORITY_DOT_COLOR, SERVICE_TYPE_LABEL,
} from '@/lib/labels';
import { todayISO, generateEntryId } from '@/lib/utils';
import type { MxUnit, UnitStatus, PriorityLevel, ServiceType, UnitType, MxLocation } from '@/lib/types';

function Field({ label, req, opt, children, span }: {
  label: string; req?: boolean; opt?: boolean; children: React.ReactNode; span?: boolean;
}) {
  return (
    <div className="mx-field" style={span ? { gridColumn: '1 / -1' } : undefined}>
      <label className="mx-label">
        {label}
        {req && <span className="req">*</span>}
        {opt && <span className="opt">optional</span>}
      </label>
      {children}
    </div>
  );
}

export default function NewEntryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { appUser, selectedCompanyId } = useApp();

  const effectiveCompany = selectedCompanyId === 'all'
    ? (appUser?.primaryCompanyId ?? 'rrtl')
    : selectedCompanyId;

  const [units, setUnits] = useState<MxUnit[]>([]);
  const [locations, setLocations] = useState<MxLocation[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const prefillNum = params.get('unit') ?? '';
  const [unitQuery, setUnitQuery] = useState(prefillNum);
  const [unitDropOpen, setUnitDropOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<MxUnit | null>(null);
  const [locationId, setLocationId] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('truck');
  const [odometer, setOdometer] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pm_preventive_maintenance');
  const [mechanic, setMechanic] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [issueReported, setIssueReported] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [partsNeeded, setPartsNeeded] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [statusAfter, setStatusAfter] = useState<UnitStatus>('ready_for_dispatch');
  const [approved, setApproved] = useState<'yes' | 'no'>('no');
  const [approvedBy, setApprovedBy] = useState('');
  const [approvalDate, setApprovalDate] = useState('');
  const [photoLink, setPhotoLink] = useState('');
  const [scannerLink, setScannerLink] = useState('');
  const [invoiceLink, setInvoiceLink] = useState('');
  const [notes, setNotes] = useState('');

  const unitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const co = effectiveCompany;
    Promise.all([
      supabase.from('mx_units').select('*').eq('company_id', co).neq('status', 'inactive_sold').order('unit_number'),
      supabase.from('mx_locations').select('*').eq('company_id', co),
    ]).then(([uRes, lRes]) => {
      const u = uRes.data ?? [];
      setUnits(u);
      setLocations(lRes.data ?? []);
      if (lRes.data?.[0]) setLocationId(lRes.data[0].id);
      if (prefillNum) {
        const found = u.find((x: MxUnit) => x.unit_number === prefillNum);
        if (found) { setSelectedUnit(found); setUnitType(found.unit_type); }
      }
    });
  }, [effectiveCompany, prefillNum]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) {
        setUnitDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredUnits = unitQuery
    ? units.filter((u) => u.unit_number.toLowerCase().includes(unitQuery.toLowerCase()))
    : units;

  function selectUnit(u: MxUnit) {
    setSelectedUnit(u);
    setUnitQuery(u.unit_number);
    setUnitType(u.unit_type);
    setUnitDropOpen(false);
  }

  function quickMark(status: UnitStatus) {
    setStatusAfter(status);
    if (status === 'ready_for_dispatch') setApproved('yes');
    if (status === 'waiting_on_parts') setApproved('no');
  }

  async function save(addAnother = false) {
    if (!selectedUnit) { setError('Please select a unit.'); return; }
    setSaving(true); setError('');
    const supabase = createClient();
    const entryId = generateEntryId();

    const { error: entryErr } = await supabase.from('mx_service_entries').insert({
      id: entryId,
      unit_id: selectedUnit.id,
      company_id: effectiveCompany,
      location_id: locationId || null,
      entry_date: todayISO(),
      service_type: serviceType,
      priority,
      mechanic: mechanic || null,
      issue_reported: issueReported || null,
      work_performed: workPerformed || null,
      parts_used: partsUsed || null,
      parts_needed: partsNeeded || null,
      labor_hours: laborHours ? parseFloat(laborHours) : null,
      odometer: odometer ? parseInt(odometer) : null,
      engine_hours: engineHours ? parseInt(engineHours) : null,
      status_after: statusAfter,
      approved: approved === 'yes',
      approved_by: approved === 'yes' ? approvedBy || null : null,
      approval_date: approved === 'yes' ? approvalDate || null : null,
      photo_folder_link: photoLink || null,
      scanner_report_link: scannerLink || null,
      invoice_link: invoiceLink || null,
      notes: notes || null,
      created_by: appUser?.id,
    });

    if (entryErr) { setError(entryErr.message); setSaving(false); return; }

    // Update unit status
    await supabase.from('mx_units').update({
      status: statusAfter,
      current_issue: issueReported || null,
      parts_needed: partsNeeded || null,
      last_service_date: todayISO(),
    }).eq('id', selectedUnit.id);

    // Add parts_needed rows if text provided
    if (partsNeeded) {
      const partLines = partsNeeded.split(',').map((s) => s.trim()).filter(Boolean);
      for (const partLine of partLines) {
        await supabase.from('mx_parts_needed').insert({
          part_name: partLine,
          unit_id: selectedUnit.id,
          company_id: effectiveCompany,
          location_id: locationId || null,
          priority,
          requested_by: mechanic || null,
          date_requested: todayISO(),
          status: 'needed',
          service_entry_id: entryId,
        });
      }
    }

    setSaving(false);
    setSaved(true);
    if (addAnother) {
      setTimeout(() => { setSaved(false); setSelectedUnit(null); setUnitQuery(''); setIssueReported(''); setWorkPerformed(''); setPartsUsed(''); setPartsNeeded(''); setNotes(''); }, 1200);
    } else {
      setTimeout(() => router.push('/dashboard'), 800);
    }
  }

  return (
    <div style={{ maxWidth: 1180 }}>
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><Wrench size={13} />Service log</span>
          <h1 className="mx-title">New service entry</h1>
        </div>
        <div className="mx-page-h-actions">
          <Link href="/dashboard" className="mx-btn mx-btn-ghost" style={{ textDecoration: 'none' }}>
            <X size={16} />Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--st-down-bg)', color: 'var(--st-down)', borderRadius: 8, padding: '12px 16px', marginBottom: 18, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div className="mx-section-gap">

          {/* Unit & location */}
          <div className="mx-card mx-card-elev">
            <div className="mx-card-h">
              <div className="mx-card-h-l">
                <span className="mx-card-title">Unit &amp; location</span>
                <span className="mx-card-sub">Company: {effectiveCompany.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Unit number" req>
                <div ref={unitRef} style={{ position: 'relative' }}>
                  <input
                    className="mx-input"
                    value={unitQuery}
                    onChange={(e) => { setUnitQuery(e.target.value); setUnitDropOpen(true); setSelectedUnit(null); }}
                    onFocus={() => setUnitDropOpen(true)}
                    placeholder="Search unit…"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  {unitDropOpen && filteredUnits.length > 0 && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                      background: '#fff', border: '1px solid var(--nardo-border)',
                      borderRadius: 8, boxShadow: 'var(--shadow-lg)', padding: 5, zIndex: 30,
                      maxHeight: 240, overflowY: 'auto',
                    }}>
                      {filteredUnits.map((u) => (
                        <button
                          key={u.id}
                          className="mx-nav-item"
                          style={{ color: 'var(--nardo-ink)' }}
                          onClick={() => selectUnit(u)}
                        >
                          <span className="mx-unit">{u.unit_number}</span>
                          <span className="mx-sub" style={{ marginLeft: 4 }}>
                            {u.make} {u.model}
                          </span>
                          <span style={{ marginLeft: 'auto' }}><StatusPill status={u.status} /></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="mx-hint">Type to search — {units.length} units at {effectiveCompany.toUpperCase()}</span>
              </Field>

              <Field label="Location" req>
                <select className="mx-select" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  {locations.length === 0 && <option value="">No locations</option>}
                </select>
              </Field>

              <Field label="Unit type" req>
                <select className="mx-select" value={unitType} onChange={(e) => setUnitType(e.target.value as UnitType)}>
                  {UNIT_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Odometer" opt>
                  <input className="mx-input mx-num" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder={selectedUnit?.odometer ? String(selectedUnit.odometer) : '0'} inputMode="numeric" />
                </Field>
                <Field label="Engine hours" opt>
                  <input className="mx-input mx-num" value={engineHours} onChange={(e) => setEngineHours(e.target.value)} placeholder={selectedUnit?.engine_hours ? String(selectedUnit.engine_hours) : '0'} inputMode="numeric" />
                </Field>
              </div>
            </div>
          </div>

          {/* Service details */}
          <div className="mx-card mx-card-elev">
            <div className="mx-card-h">
              <div className="mx-card-h-l"><span className="mx-card-title">Service details</span></div>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Service type" req>
                <select className="mx-select" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
                  {SERVICE_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Mechanic" req>
                <input className="mx-input" value={mechanic} onChange={(e) => setMechanic(e.target.value)} placeholder="Mechanic name" />
              </Field>
              <Field label="Priority" req span>
                <div className="mx-seg">
                  {PRIORITIES.map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      className={priority === k ? 'is-active' : ''}
                      onClick={() => setPriority(k)}
                    >
                      <i style={{ background: PRIORITY_DOT_COLOR[k] }} />
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Issue reported" req span>
                <textarea className="mx-textarea" value={issueReported} onChange={(e) => setIssueReported(e.target.value)} placeholder="What was reported? e.g. coolant temp climbing under load, derate at SPN 110" />
              </Field>
            </div>
          </div>

          {/* Work & parts */}
          <div className="mx-card mx-card-elev">
            <div className="mx-card-h">
              <div className="mx-card-h-l"><span className="mx-card-title">Work &amp; parts</span></div>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Work performed" span>
                <textarea className="mx-textarea" value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} placeholder="What did you do?" />
              </Field>
              <Field label="Parts used" opt>
                <textarea className="mx-textarea" style={{ minHeight: 70 }} value={partsUsed} onChange={(e) => setPartsUsed(e.target.value)} placeholder="Parts installed on this job" />
              </Field>
              <Field label="Parts needed" opt>
                <textarea className="mx-textarea" style={{ minHeight: 70 }} value={partsNeeded} onChange={(e) => setPartsNeeded(e.target.value)} placeholder="Parts still required — adds to Parts Needed list (comma-separated)" />
              </Field>
              <Field label="Labor hours" opt>
                <input className="mx-input mx-num" value={laborHours} onChange={(e) => setLaborHours(e.target.value)} placeholder="0.0" inputMode="decimal" />
              </Field>
              <Field label="Status after service" req>
                <select className="mx-select" value={statusAfter} onChange={(e) => setStatusAfter(e.target.value as UnitStatus)}>
                  {UNIT_STATUSES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Return to service & files */}
          <div className="mx-card mx-card-elev">
            <div className="mx-card-h">
              <div className="mx-card-h-l">
                <span className="mx-card-title">Return to service &amp; files</span>
                <span className="mx-card-sub">Store Google Drive links — not the files themselves</span>
              </div>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Approved back to service?" req>
                <div className="mx-seg">
                  {[['yes','Yes'],['no','No']].map(([k,v]) => (
                    <button key={k} type="button" className={approved === k ? 'is-active' : ''} onClick={() => setApproved(k as 'yes'|'no')}>{v}</button>
                  ))}
                </div>
              </Field>
              <Field label="Approved by" opt>
                <input className="mx-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Manager name" disabled={approved === 'no'} />
              </Field>
              <Field label="Photo folder link" opt>
                <input className="mx-input mx-mono" value={photoLink} onChange={(e) => setPhotoLink(e.target.value)} placeholder="drive.google.com/…" />
              </Field>
              <Field label="Scanner report link" opt>
                <input className="mx-input mx-mono" value={scannerLink} onChange={(e) => setScannerLink(e.target.value)} placeholder="drive.google.com/…" />
              </Field>
              <Field label="Invoice / receipt link" opt>
                <input className="mx-input mx-mono" value={invoiceLink} onChange={(e) => setInvoiceLink(e.target.value)} placeholder="drive.google.com/…" />
              </Field>
              <Field label="Approval date" opt>
                <input className="mx-input" type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} disabled={approved === 'no'} />
              </Field>
              <Field label="Notes" opt span>
                <textarea className="mx-textarea" style={{ minHeight: 60 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else the next person should know" />
              </Field>
            </div>
          </div>
        </div>

        {/* Sticky rail */}
        <div style={{ position: 'sticky', top: 78, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="mx-card mx-card-elev" style={{ padding: 18 }}>
            <div className="mx-kpi-lab" style={{ marginBottom: 12 }}>Entry summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="mx-meta-k">Unit</div>
                <div style={{ marginTop: 4 }}>
                  {selectedUnit ? (
                    <><span className="mx-unit" style={{ fontSize: 18 }}>{selectedUnit.unit_number}</span><span className="mx-sub" style={{ marginLeft: 8 }}>{selectedUnit.make} {selectedUnit.model}</span></>
                  ) : (
                    <span className="mx-sub">Not selected</span>
                  )}
                </div>
              </div>
              <hr className="mx-divider" />
              <div>
                <div className="mx-meta-k">Service type</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>{SERVICE_TYPE_LABEL[serviceType]}</div>
              </div>
              <div>
                <div className="mx-meta-k">Priority</div>
                <div style={{ marginTop: 6 }}><Priority value={priority} /></div>
              </div>
              <div>
                <div className="mx-meta-k">Status after service</div>
                <div style={{ marginTop: 6 }}><StatusPill status={statusAfter} /></div>
              </div>
            </div>
          </div>

          <div className="mx-card mx-card-elev" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {saved ? (
              <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--st-ready)', fontWeight: 600, fontSize: 14 }}>
                <CheckCircle2 size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />Saved!
              </div>
            ) : (
              <>
                <button className="mx-btn mx-btn-primary mx-btn-lg" style={{ justifyContent: 'center' }} onClick={() => save(false)} disabled={saving}>
                  <Save size={17} />{saving ? 'Saving…' : 'Save entry'}
                </button>
                <button className="mx-btn mx-btn-lg" style={{ justifyContent: 'center' }} onClick={() => save(true)} disabled={saving}>
                  <Plus size={16} />Save &amp; add another
                </button>
                <hr className="mx-divider" style={{ margin: '4px 0' }} />
                <button className="mx-btn mx-btn-wait mx-btn-lg" style={{ justifyContent: 'center' }} onClick={() => quickMark('waiting_on_parts')}>
                  <Package size={16} />Mark waiting on parts
                </button>
                <button className="mx-btn mx-btn-ready mx-btn-lg" style={{ justifyContent: 'center' }} onClick={() => quickMark('ready_for_dispatch')}>
                  <CheckCircle2 size={16} />Mark ready for dispatch
                </button>
              </>
            )}
          </div>

          <div className="mx-hint" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <Clock size={13} />Built to finish in under 60 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
