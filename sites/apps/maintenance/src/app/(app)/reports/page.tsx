'use client';

import { useState } from 'react';
import { ExternalLink, Download, BarChart3, Truck, Package, History, Calendar, Receipt, FolderOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { SERVICE_TYPE_LABEL, STATUS_LABEL } from '@/lib/labels';
import { shortDate, todayISO, csvEscape } from '@/lib/utils';
import type { MxServiceEntry, MxUnit } from '@/lib/types';

interface ReportCard {
  icon: React.ElementType;
  title: string;
  description: string;
  meta: string;
  onGenerate: () => void;
}

function ReportCardComponent({ icon: Icon, title, description, meta, onGenerate }: ReportCard) {
  return (
    <div className="mx-report" onClick={onGenerate}>
      <div className="mx-report-ic"><Icon size={20} /></div>
      <div className="mx-report-t">{title}</div>
      <div className="mx-report-d">{description}</div>
      <div className="mx-report-f">
        <span>{meta}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--st-info)', fontWeight: 600 }}>
          <Download size={14} />Generate
        </span>
      </div>
    </div>
  );
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { selectedCompanyId, appUser } = useApp();
  const [driveUrl, setDriveUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [urlSaved, setUrlSaved] = useState(false);

  const co = selectedCompanyId;

  async function generateServiceHistory() {
    const supabase = createClient();
    const q = supabase.from('mx_service_entries').select('*, mx_units(unit_number)').order('entry_date', { ascending: false });
    const { data } = await (co !== 'all' ? q.eq('company_id', co) : q);
    const rows = data ?? [];
    const header = ['ID','Date','Unit','Company','Service Type','Priority','Mechanic','Issue','Work','Parts Used','Parts Needed','Labor Hrs','Status','Approved','Approved By'];
    const body = rows.map((e: MxServiceEntry) => [
      e.id, e.entry_date, e.mx_units?.unit_number ?? '', e.company_id,
      SERVICE_TYPE_LABEL[e.service_type] ?? e.service_type, e.priority,
      e.mechanic ?? '', e.issue_reported ?? '', e.work_performed ?? '',
      e.parts_used ?? '', e.parts_needed ?? '', String(e.labor_hours ?? ''),
      STATUS_LABEL[e.status_after] ?? e.status_after,
      e.approved ? 'Yes' : 'No', e.approved_by ?? '',
    ]);
    downloadCSV(`service-history-${todayISO()}.csv`, [header, ...body]);
  }

  async function generateUnitsDown() {
    const supabase = createClient();
    const q = supabase.from('mx_units').select('*, mx_locations(name)').in('status', ['still_down','needs_outside_shop','waiting_on_parts']);
    const { data } = await (co !== 'all' ? q.eq('company_id', co) : q);
    const rows = data ?? [];
    const header = ['Unit','Company','Location','Type','Status','Issue','Parts Needed','Last Service'];
    const body = rows.map((u: MxUnit) => [
      u.unit_number, u.company_id, u.mx_locations?.name ?? '', u.unit_type,
      STATUS_LABEL[u.status] ?? u.status, u.current_issue ?? '',
      u.parts_needed ?? '', u.last_service_date ?? '',
    ]);
    downloadCSV(`units-down-${todayISO()}.csv`, [header, ...body]);
  }

  async function generateMonthlyCSV() {
    const supabase = createClient();
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const q = supabase.from('mx_service_entries').select('*, mx_units(unit_number)').gte('entry_date', monthStart).order('entry_date', { ascending: false });
    const { data } = await (co !== 'all' ? q.eq('company_id', co) : q);
    const rows = data ?? [];
    const header = ['Date','Unit','Company','Service Type','Mechanic','Work','Parts Used','Labor Hrs','Status','Invoice'];
    const body = rows.map((e: MxServiceEntry) => [
      e.entry_date, e.mx_units?.unit_number ?? '', e.company_id,
      SERVICE_TYPE_LABEL[e.service_type] ?? e.service_type, e.mechanic ?? '',
      e.work_performed ?? '', e.parts_used ?? '', String(e.labor_hours ?? ''),
      STATUS_LABEL[e.status_after] ?? e.status_after, e.invoice_link ?? '',
    ]);
    downloadCSV(`monthly-summary-${monthStart}.csv`, [header, ...body]);
  }

  async function saveDriveUrl() {
    if (!driveUrl) return;
    setSavingUrl(true);
    const supabase = createClient();
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    await supabase.from('mx_monthly_reports').upsert({
      company_id: co === 'all' ? 'flogal' : co,
      month,
      drive_url: driveUrl,
    }, { onConflict: 'company_id,month' });
    setSavingUrl(false);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 3000);
  }

  const reports: ReportCard[] = [
    { icon: BarChart3, title: 'Weekly maintenance summary', description: 'All service activity, labor, and status changes for the current week.', meta: 'Updated daily', onGenerate: generateServiceHistory },
    { icon: Truck, title: 'Units down', description: 'Every unit out of service with issue, parts, and days down.', meta: 'Live', onGenerate: generateUnitsDown },
    { icon: Package, title: 'Parts needed', description: 'Open parts demand across the fleet by priority and vendor.', meta: 'Live', onGenerate: generateServiceHistory },
    { icon: History, title: 'Service history by unit', description: 'Full repair record for a single unit — pick a unit to generate.', meta: 'On demand', onGenerate: generateServiceHistory },
    { icon: Calendar, title: 'Monthly maintenance summary', description: 'Clean monthly rollup, formatted for Google Drive and accounting.', meta: 'Month to date', onGenerate: generateMonthlyCSV },
    { icon: Receipt, title: 'Accounting export', description: 'Labor, parts, and invoice links exported as a CSV for accounting.', meta: 'CSV', onGenerate: generateMonthlyCSV },
  ];

  return (
    <div className="mx-page-wide">
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><BarChart3 size={13} />Exports</span>
          <h1 className="mx-title">Reports</h1>
        </div>
      </div>

      <div className="mx-report-grid">
        {reports.map((r) => <ReportCardComponent key={r.title} {...r} />)}
      </div>

      <div className="mx-card mx-card-elev" style={{ marginTop: 22, padding: 22, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div className="mx-report-ic" style={{ width: 48, height: 48 }}><FolderOpen size={22} /></div>
        <div style={{ flex: 1 }}>
          <div className="mx-card-title" style={{ marginBottom: 4 }}>Monthly summary — Google Drive</div>
          <div className="mx-sub">After generating and uploading the CSV to Drive, save the folder link below to keep a record.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              className="mx-input mx-mono"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="Paste Google Drive folder link…"
              style={{ flex: 1 }}
            />
            <button className="mx-btn mx-btn-primary" onClick={saveDriveUrl} disabled={savingUrl || !driveUrl}>
              {urlSaved ? 'Saved!' : 'Save link'}
            </button>
          </div>
        </div>
        <button className="mx-btn" onClick={generateMonthlyCSV}>
          <Download size={16} />Generate CSV
        </button>
      </div>
    </div>
  );
}
