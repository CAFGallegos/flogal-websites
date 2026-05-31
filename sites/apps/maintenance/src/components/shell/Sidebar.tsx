'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, Truck, Package, CheckCircle2,
  BarChart3, FolderOpen, Settings, LogOut,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { initials } from '@/lib/utils';

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard,  href: '/dashboard' },
  { id: 'new-entry',  label: 'New Service Entry',  icon: ClipboardList,    href: '/new-entry' },
  { id: 'units',      label: 'Units',              icon: Truck,            href: '/units' },
  { id: 'parts',      label: 'Parts Needed',       icon: Package,          href: '/parts' },
  { id: 'completed',  label: 'Work Completed',     icon: CheckCircle2,     href: '/completed' },
  { id: 'reports',    label: 'Reports',            icon: BarChart3,        href: '/reports' },
  { id: 'files',      label: 'Files / Drive Links',icon: FolderOpen,       href: '/files' },
];

interface SidebarProps {
  downCount?: number;
  partsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ downCount = 0, partsCount = 0, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { appUser, signOut } = useApp();

  const navItems = appUser?.isFlogalAdmin
    ? [...NAV, { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }]
    : NAV;

  const badges: Record<string, { n: number; alert?: boolean }> = {};
  if (downCount > 0) badges['units'] = { n: downCount, alert: true };
  if (partsCount > 0) badges['parts'] = { n: partsCount };

  const userName = appUser?.profile.full_name ?? appUser?.email ?? 'User';
  const userRole = appUser?.isFlogalAdmin
    ? 'FLOGAL ADMIN'
    : `${(appUser?.companies[0]?.short_name ?? '').toUpperCase()} · ${appUser?.profile.global_role === 'flogal_admin' ? 'ADMIN' : 'USER'}`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`mx-side${isOpen ? ' is-open' : ''}`}>
        <div className="mx-brand">
          <Image
            src="/maintenance/logo-white.png"
            alt="Flogal"
            width={26}
            height={26}
            className="mx-brand-mark"
            style={{ objectFit: 'contain' }}
          />
          <div className="mx-brand-txt">
            <span className="mx-brand-name">Flogal</span>
            <span className="mx-brand-sub">Maintenance</span>
          </div>
        </div>

        <nav className="mx-nav">
          <div className="mx-nav-h">Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const badge = badges[item.id];
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`mx-nav-item${isActive ? ' is-active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{item.label}</span>
                {badge && (
                  <span className={`mx-nav-badge${badge.alert ? ' is-alert' : ''}`}>
                    {badge.n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-side-foot">
          <div className="mx-user">
            <div className="mx-avatar">{initials(userName)}</div>
            <div className="mx-user-txt">
              <span className="mx-user-name">{userName}</span>
              <span className="mx-user-role">{userRole}</span>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              style={{
                marginLeft: 'auto', width: 32, height: 32,
                background: 'transparent', border: 0, cursor: 'pointer',
                color: 'var(--char-fg-faint)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
