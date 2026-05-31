'use client';

import { useEffect, useState } from 'react';
import { Plus, Settings, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { CompanyTag } from '@/components/ui/CompanyTag';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SERVICE_TYPES, UNIT_STATUSES, COMPANY_DOT } from '@/lib/labels';
import type { MxCompany, MxLocation, MxProfile, MxCompanyMembership } from '@/lib/types';

const TABS = [
  { k: 'companies', label: 'Companies' },
  { k: 'locations', label: 'Locations' },
  { k: 'users', label: 'Users & roles' },
  { k: 'types', label: 'Service types' },
  { k: 'status', label: 'Status options' },
  { k: 'drive', label: 'Drive folders' },
];

type DriveFolder = { label: string; key: string };
const DRIVE_FOLDERS: DriveFolder[] = [
  { label: 'Root maintenance folder', key: 'root' },
  { label: 'Monthly exports', key: 'monthly' },
  { label: 'Scanner reports', key: 'scanner' },
  { label: 'Invoices', key: 'invoices' },
];

interface UserRow extends MxProfile {
  membership?: { company_id: string; role: string };
}

export default function SettingsPage() {
  const { appUser } = useApp();
  const [tab, setTab] = useState('companies');
  const [companies, setCompanies] = useState<MxCompany[]>([]);
  const [locations, setLocations] = useState<MxLocation[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [driveLinks, setDriveLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!appUser?.isFlogalAdmin) return;
    const supabase = createClient();
    setLoading(true);
    Promise.all([
      supabase.from('mx_companies').select('*'),
      supabase.from('mx_locations').select('*'),
      supabase.from('mx_profiles').select('*, mx_company_memberships(company_id, role)'),
    ]).then(([cRes, lRes, uRes]) => {
      setCompanies(cRes.data ?? []);
      setLocations(lRes.data ?? []);
      const usersData = (uRes.data ?? []).map((u: MxProfile & { mx_company_memberships?: MxCompanyMembership[] }) => ({
        ...u,
        membership: u.mx_company_memberships?.[0],
      }));
      setUsers(usersData);
      setLoading(false);
    });
  }, [appUser]);

  if (!appUser?.isFlogalAdmin) {
    return (
      <div className="mx-page-wide" style={{ maxWidth: 640 }}>
        <EmptyState icon={AlertTriangle} title="Access denied" description="Settings are only accessible to Flogal admins." />
      </div>
    );
  }

  return (
    <div className="mx-page-wide" style={{ maxWidth: 1080 }}>
      <div className="mx-page-h">
        <div>
          <span className="mx-eyebrow"><Settings size={13} />Admin only</span>
          <h1 className="mx-title">Settings</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Tab nav */}
        <div className="mx-card mx-card-elev" style={{ padding: 8 }}>
          {TABS.map(({ k, label }) => (
            <button
              key={k}
              className={`mx-nav-item${tab === k ? ' is-active' : ''}`}
              style={tab === k
                ? { background: 'var(--nardo-bg-2)', color: 'var(--nardo-ink)', boxShadow: 'inset 2.5px 0 0 var(--st-info)' }
                : { color: 'var(--nardo-muted)' }}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="mx-card mx-card-elev">
          {loading ? <LoadingSpinner /> : (
            <>
              {tab === 'companies' && (
                <>
                  <div className="mx-card-h">
                    <span className="mx-card-title">Companies</span>
                    <button className="mx-btn" style={{ minHeight: 34, padding: '6px 12px' }}>
                      <Plus size={14} />Add
                    </button>
                  </div>
                  <div className="mx-tablewrap">
                    <table className="mx-table">
                      <thead><tr><th>Name</th><th>ID</th><th>Access</th><th>Units</th><th></th></tr></thead>
                      <tbody>
                        {companies.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <span className="mx-co-tag">
                                <i style={{ background: COMPANY_DOT[c.id] ?? c.dot_color }} />
                                <span className="mx-strong">{c.name}</span>
                              </span>
                            </td>
                            <td className="mx-mono">{c.id}</td>
                            <td>
                              {c.is_admin
                                ? <span className="mx-pill s-info">All companies</span>
                                : <span className="mx-pill s-neutral">Own company</span>}
                            </td>
                            <td className="mx-num">—</td>
                            <td style={{ textAlign: 'right' }}><button className="mx-rowact">Edit</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === 'locations' && (
                <>
                  <div className="mx-card-h">
                    <span className="mx-card-title">Locations</span>
                    <button className="mx-btn" style={{ minHeight: 34, padding: '6px 12px' }}>
                      <Plus size={14} />Add
                    </button>
                  </div>
                  <div className="mx-tablewrap">
                    <table className="mx-table">
                      <thead><tr><th>Name</th><th>ID</th><th>Company</th><th></th></tr></thead>
                      <tbody>
                        {locations.map((l) => (
                          <tr key={l.id}>
                            <td className="mx-strong">{l.name}</td>
                            <td className="mx-mono">{l.id}</td>
                            <td><CompanyTag id={l.company_id} /></td>
                            <td style={{ textAlign: 'right' }}><button className="mx-rowact">Edit</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === 'users' && (
                <>
                  <div className="mx-card-h">
                    <span className="mx-card-title">Users &amp; roles</span>
                    <button className="mx-btn" style={{ minHeight: 34, padding: '6px 12px' }}>
                      <Plus size={14} />Invite
                    </button>
                  </div>
                  <div className="mx-tablewrap">
                    <table className="mx-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Role</th><th></th></tr></thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="mx-strong">{u.full_name ?? '—'}</td>
                            <td className="mx-mono" style={{ fontSize: 11 }}>{u.email ?? '—'}</td>
                            <td>{u.membership?.company_id ? <CompanyTag id={u.membership.company_id as MxCompany['id']} /> : '—'}</td>
                            <td>{u.global_role}</td>
                            <td style={{ textAlign: 'right' }}><button className="mx-rowact">Edit</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {(tab === 'types' || tab === 'status') && (
                <>
                  <div className="mx-card-h">
                    <span className="mx-card-title">{tab === 'types' ? 'Service types' : 'Status options'}</span>
                    <button className="mx-btn" style={{ minHeight: 34, padding: '6px 12px' }}>
                      <Plus size={14} />Add
                    </button>
                  </div>
                  <div className="mx-tablewrap">
                    <table className="mx-table">
                      <thead><tr><th>Display label</th><th>Internal value</th><th></th></tr></thead>
                      <tbody>
                        {(tab === 'types' ? SERVICE_TYPES : UNIT_STATUSES).map(([k, v]) => (
                          <tr key={k}>
                            <td className="mx-strong">{v}</td>
                            <td className="mx-mono">{k}</td>
                            <td style={{ textAlign: 'right' }}><button className="mx-rowact">Edit</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === 'drive' && (
                <>
                  <div className="mx-card-h">
                    <span className="mx-card-title">Drive folder links</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {DRIVE_FOLDERS.map(({ label, key }) => (
                      <div className="mx-field" key={key}>
                        <label className="mx-label">{label}</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            className="mx-input mx-mono"
                            value={driveLinks[key] ?? ''}
                            onChange={(e) => setDriveLinks((p) => ({ ...p, [key]: e.target.value }))}
                            style={{ flex: 1 }}
                            placeholder="https://drive.google.com/…"
                          />
                          <button className="mx-btn">Save</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
