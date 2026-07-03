'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Truck, Camera, Scan, Receipt, FolderOpen, Shield, ExternalLink, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MxMaintenanceFile, MxUnit } from '@/lib/types';

const KIND_META: Record<string, { label: string; icon: React.ElementType }> = {
  unit_folder:    { label: 'Unit folders',        icon: Truck },
  photo:          { label: 'Photo folders',        icon: Camera },
  scanner:        { label: 'Scanner reports',      icon: Scan },
  invoice:        { label: 'Invoices & receipts',  icon: Receipt },
  monthly_export: { label: 'Monthly exports',      icon: FolderOpen },
};

function AddLinkModal({ units, onClose, onSave }: { units: MxUnit[]; onClose: () => void; onSave: (data: { kind: string; label: string; url: string; unit_id?: string }) => void }) {
  const [kind, setKind] = useState('unit_folder');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [unitId, setUnitId] = useState('');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="mx-card mx-card-elev" style={{ width: '100%', maxWidth: 480 }}>
        <div className="mx-card-h">
          <span className="mx-card-title">Add Drive link</span>
          <button className="mx-iconbtn" onClick={onClose} style={{ border: 0, background: 'transparent' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="mx-field">
            <label className="mx-label">Type</label>
            <select className="mx-select" value={kind} onChange={(e) => setKind(e.target.value)}>
              {Object.entries(KIND_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="mx-field">
            <label className="mx-label">Label <span className="opt">optional</span></label>
            <input className="mx-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Unit 412 — May photos" />
          </div>
          <div className="mx-field">
            <label className="mx-label">Drive URL <span className="req">*</span></label>
            <input className="mx-input mx-mono" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" />
          </div>
          <div className="mx-field">
            <label className="mx-label">Unit <span className="opt">optional</span></label>
            <select className="mx-select" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">No unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unit_number} — {u.make} {u.model}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="mx-btn" onClick={onClose}>Cancel</button>
            <button className="mx-btn mx-btn-primary" disabled={!url} onClick={() => onSave({ kind, label, url, unit_id: unitId || undefined })}>Save link</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FilesPage() {
  const { selectedCompanyId } = useApp();
  const [files, setFiles] = useState<MxMaintenanceFile[]>([]);
  const [units, setUnits] = useState<MxUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const co = selectedCompanyId;
    const [fRes, uRes] = await Promise.all([
      (() => {
        const q = supabase.from('mx_maintenance_files').select('*, mx_units(unit_number, make, model)').order('created_at', { ascending: false });
        return co !== 'all' ? q.eq('company_id', co) : q;
      })(),
      (() => {
        const q = supabase.from('mx_units').select('*').order('unit_number');
        return co !== 'all' ? q.eq('company_id', co) : q;
      })(),
    ]);
    setFiles(fRes.data ?? []);
    setUnits(uRes.data ?? []);
    setLoading(false);
  }, [selectedCompanyId]);

  useEffect(() => { load(); }, [load]);

  async function saveLink(data: { kind: string; label: string; url: string; unit_id?: string }) {
    const supabase = createClient();
    const co = selectedCompanyId === 'all' ? 'flogal' : selectedCompanyId;
    await supabase.from('mx_maintenance_files').insert({
      company_id: co,
      unit_id: data.unit_id || null,
      kind: data.kind,
      label: data.label || null,
      url: data.url,
    });
    setShowModal(false);
    load();
  }

  const groups = Object.entries(KIND_META).map(([k, meta]) => ({
    ...meta,
    kind: k,
    items: files.filter((f) => f.kind === k),
  }));

  return (
    <div className="mx-page-wide">
      {showModal && <AddLinkModal units={units} onClose={() => setShowModal(false)} onSave={saveLink} />}

      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><FolderOpen size={13} />Google Drive</span>
          <h1 className="mx-title">Files &amp; Drive links</h1>
        </div>
        <div className="mx-page-h-actions">
          <button className="mx-btn mx-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />Add link
          </button>
        </div>
      </div>

      <div className="mx-card mx-card-elev" style={{ padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--nardo-muted)', fontSize: 13 }}>
        <Shield size={16} /> This app stores Google Drive links and metadata — heavy files live in Drive, not here.
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="mx-grid-2b">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <div className="mx-card mx-card-elev" key={g.kind}>
                <div className="mx-card-h">
                  <div className="mx-card-h-l">
                    <span className="mx-card-title">{g.label}</span>
                    <span className="mx-card-sub">{g.items.length} links</span>
                  </div>
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {g.items.length === 0 ? (
                    <span className="mx-sub" style={{ padding: 8 }}>No links yet</span>
                  ) : (
                    g.items.map((f) => (
                      <div className="mx-link-row" key={f.id}>
                        <div className="mx-link-ic"><Icon size={17} /></div>
                        <div className="mx-link-txt">
                          <span className="mx-link-name">
                            {f.label || (f.mx_units ? `Unit ${f.mx_units.unit_number} — ${f.mx_units.make} ${f.mx_units.model}` : g.label)}
                          </span>
                          <span className="mx-link-url">{f.url.replace('https://', '')}</span>
                        </div>
                        <a
                          className="mx-rowact mx-link-go"
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <ExternalLink size={14} />Open
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
