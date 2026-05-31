'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
  downCount?: number;
  partsCount?: number;
  alertCount?: number;
}

export function AppShell({ children, downCount = 0, partsCount = 0, alertCount = 0 }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-app">
      <Sidebar
        downCount={downCount}
        partsCount={partsCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="mx-main">
        <Topbar
          alertCount={alertCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="mx-page">
          {children}
        </div>
      </div>
    </div>
  );
}
