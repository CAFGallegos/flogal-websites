'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { selectedCompanyId } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [downCount, setDownCount] = useState(0);
  const [partsCount, setPartsCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const co = selectedCompanyId;

    async function fetchCounts() {
      const [downRes, partsRes, alertRes] = await Promise.all([
        co !== 'all'
          ? supabase.from('mx_units').select('*', { count: 'exact', head: true }).eq('status', 'still_down').eq('company_id', co)
          : supabase.from('mx_units').select('*', { count: 'exact', head: true }).eq('status', 'still_down'),
        co !== 'all'
          ? supabase.from('mx_parts_needed').select('*', { count: 'exact', head: true }).eq('status', 'needed').eq('company_id', co)
          : supabase.from('mx_parts_needed').select('*', { count: 'exact', head: true }).eq('status', 'needed'),
        co !== 'all'
          ? supabase.from('mx_service_entries').select('*', { count: 'exact', head: true }).eq('priority', 'safety_dot').eq('approved', false).eq('company_id', co)
          : supabase.from('mx_service_entries').select('*', { count: 'exact', head: true }).eq('priority', 'safety_dot').eq('approved', false),
      ]);
      setDownCount(downRes.count ?? 0);
      setPartsCount(partsRes.count ?? 0);
      setAlertCount(alertRes.count ?? 0);
    }

    fetchCounts();
  }, [selectedCompanyId]);

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
