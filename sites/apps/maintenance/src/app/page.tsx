'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <>
      <style>{`
        .portal-app {
          min-height: 100vh;
          background: #6B6E70;
          font-family: Inter, system-ui, sans-serif;
        }
        .portal-topbar {
          position: sticky; top: 0; z-index: 10;
          background: rgba(40,44,50,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 58px;
        }
        .portal-topbar-left { display: flex; align-items: center; gap: 12px; }
        .portal-topbar-right { display: flex; align-items: center; gap: 14px; }
        .portal-app-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 900px;
        }
        @media (max-width: 960px) { .portal-app-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .portal-app-grid { grid-template-columns: 1fr; } }
        .portal-app-card {
          background: #1A1F2E;
          border-radius: 12px;
          padding: 28px 24px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          transition: transform 0.15s ease, border-color 0.15s ease;
          display: flex; flex-direction: column; gap: 12px;
        }
        .portal-app-card:hover {
          transform: translateY(-2px);
          border-color: #6B6E70;
        }
        .portal-signout {
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7); padding: 7px 14px; border-radius: 7px;
          font-family: inherit; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: border-color 0.15s, color 0.15s;
        }
        .portal-signout:hover { border-color: rgba(255,255,255,0.45); color: #fff; }
      `}</style>

      <div className="portal-app">
        <header className="portal-topbar">
          <div className="portal-topbar-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/flogal-symbol-white.png"
              alt="Flogal"
              style={{ height: 28, width: 'auto', display: 'block' }}
            />
            <span style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 11,
              fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>
              Flogal Technologies
            </span>
          </div>
          <div className="portal-topbar-right">
            {user && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                {user.email}
              </span>
            )}
            <button className="portal-signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </header>

        <main style={{ padding: '40px 32px' }}>
          <h1 style={{
            color: '#fff', fontWeight: 700, fontSize: 32,
            letterSpacing: '-0.02em', margin: '0 0 28px',
          }}>
            Apps
          </h1>

          <div className="portal-app-grid">
            <div
              className="portal-app-card"
              onClick={() => router.push('/maintenance')}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/maintenance')}
            >
              <Wrench size={28} color="#6B6E70" strokeWidth={1.75} />
              <div>
                <div style={{ color: '#fff', fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
                  Maintenance
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  Fleet service tracking
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
