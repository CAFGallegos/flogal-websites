'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AppUser, CompanyId, MxCompany } from '@/lib/types';

interface AppContextValue {
  appUser: AppUser | null;
  loading: boolean;
  selectedCompanyId: CompanyId | 'all';
  setSelectedCompanyId: (id: CompanyId | 'all') => void;
  signOut: () => Promise<void>;
  reload: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<CompanyId | 'all'>('all');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setAppUser(null); setLoading(false); return; }

        const [profileRes, companiesRes] = await Promise.all([
          supabase.from('mx_profiles').select('*').eq('id', user.id).single(),
          supabase.from('mx_companies').select('*'),
        ]);

        if (cancelled) return;

        const profile = profileRes.data;
        if (!profile) { setAppUser(null); setLoading(false); return; }

        const isFlogalAdmin = profile.global_role === 'flogal_admin';
        let companies: MxCompany[] = companiesRes.data ?? [];

        if (!isFlogalAdmin) {
          const { data: memberships } = await supabase
            .from('mx_company_memberships')
            .select('company_id')
            .eq('user_id', user.id);
          const allowed = new Set((memberships ?? []).map((m: { company_id: string }) => m.company_id));
          companies = companies.filter((c: MxCompany) => allowed.has(c.id));
        }

        const primaryCompanyId: CompanyId = isFlogalAdmin
          ? 'flogal'
          : (companies[0]?.id ?? 'rrtl');

        setAppUser({
          id: user.id,
          email: user.email ?? '',
          profile,
          isFlogalAdmin,
          companies,
          primaryCompanyId,
        });

        setSelectedCompanyId(isFlogalAdmin ? 'all' : primaryCompanyId);
      } catch {
        setAppUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) load();
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [tick]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAppUser(null);
    window.location.href = '/maintenance/login';
  };

  return (
    <AppContext.Provider value={{ appUser, loading, selectedCompanyId, setSelectedCompanyId, signOut, reload }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
