'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, ChevronDown, Check, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DOT } from '@/lib/labels';
import type { CompanyId } from '@/lib/types';

interface TopbarProps {
  alertCount?: number;
  onMenuClick?: () => void;
}

export function Topbar({ alertCount = 0, onMenuClick }: TopbarProps) {
  const { appUser, selectedCompanyId, setSelectedCompanyId } = useApp();
  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isFlogalAdmin = appUser?.isFlogalAdmin ?? false;
  const companies = appUser?.companies ?? [];

  const companyOptions: Array<{ id: CompanyId | 'all'; name: string; dot: string }> = isFlogalAdmin
    ? [
        { id: 'all', name: 'All Companies', dot: '#1f2326' },
        ...companies.map((c) => ({ id: c.id, name: c.name, dot: COMPANY_DOT[c.id] })),
      ]
    : companies.map((c) => ({ id: c.id, name: c.name, dot: COMPANY_DOT[c.id] }));

  const current = companyOptions.find((o) => o.id === selectedCompanyId)
    ?? companyOptions[0]
    ?? { id: 'all', name: 'All Companies', dot: '#1f2326' };

  return (
    <header className="mx-top">
      <button
        className="mx-iconbtn md:hidden"
        onClick={onMenuClick}
        title="Menu"
        style={{ display: 'none' }}
        id="sidebar-toggle"
      >
        <Menu size={17} />
      </button>

      <div ref={dropRef} style={{ position: 'relative' }}>
        <div
          className={`mx-company${!isFlogalAdmin ? ' is-locked' : ''}`}
          onClick={() => isFlogalAdmin && setDropOpen((o) => !o)}
          role={isFlogalAdmin ? 'button' : undefined}
        >
          <span className="mx-company-dot" style={{ background: current.dot }} />
          <div className="mx-company-txt">
            <span className="mx-company-lab">{isFlogalAdmin ? 'Viewing' : 'Company · locked'}</span>
            <span className="mx-company-name">{current.name}</span>
          </div>
          {isFlogalAdmin && (
            <ChevronDown size={15} style={{ color: 'var(--nardo-faint)', marginLeft: 4 }} />
          )}
        </div>

        {dropOpen && isFlogalAdmin && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            minWidth: 220, background: '#fff', border: '1px solid var(--nardo-border)',
            borderRadius: 9, boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 40,
          }}>
            {companyOptions.map((opt) => (
              <button
                key={opt.id}
                className="mx-nav-item"
                style={{ color: 'var(--nardo-ink)', fontWeight: selectedCompanyId === opt.id ? 700 : 500 }}
                onClick={() => {
                  setSelectedCompanyId(opt.id as CompanyId | 'all');
                  setDropOpen(false);
                }}
              >
                <span className="mx-company-dot" style={{ background: opt.dot }} />
                <span>{opt.name}</span>
                {selectedCompanyId === opt.id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--st-ready)' }}>
                    <Check size={15} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-search">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search unit number, issue, part…"
        />
        <kbd>/</kbd>
      </div>

      <div className="mx-top-right">
        <button className="mx-iconbtn" title="Alerts">
          <Bell size={17} />
          {alertCount > 0 && <span className="mx-dot">{alertCount}</span>}
        </button>
        <Link href="/new-entry" className="mx-btn mx-btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} />
          New Service Entry
        </Link>
      </div>
    </header>
  );
}
