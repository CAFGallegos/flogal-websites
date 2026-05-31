'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
      {/* Left — charcoal brand panel */}
      <div style={{
        background: 'var(--char-1)', color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image
            src="/maintenance/logo-white.png"
            alt="Flogal"
            width={30} height={30}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.02em' }}>Flogal</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--char-fg-faint)', textTransform: 'uppercase' }}>Maintenance</span>
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--char-fg-faint)', marginBottom: 16 }}>
            Internal fleet operations
          </div>
          <h1 style={{ fontWeight: 700, fontSize: 38, lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0 }}>
            Every unit. Every repair. One record.
          </h1>
          <p style={{ color: 'var(--char-fg-dim)', fontSize: 15, lineHeight: 1.6, marginTop: 18 }}>
            Track status, parts, and service history across the fleet — built for the shop floor, fast enough to finish before the next truck rolls in.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 40 }}>
          {[['3', 'Companies'], ['46', 'Power units'], ['24/7', 'Shop access']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--char-fg-faint)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        background: 'var(--nardo-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Image
            src="/maintenance/logo-navy.png"
            alt=""
            width={34} height={34}
            style={{ objectFit: 'contain', marginBottom: 26 }}
          />
          <h2 style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.015em', margin: '0 0 4px' }}>Sign in</h2>
          <p className="mx-sub" style={{ margin: '0 0 26px' }}>
            Internal maintenance system · apps.flogalhq.com/maintenance
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="mx-field">
              <label className="mx-label">Email</label>
              <input
                className="mx-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                placeholder="you@flogalhq.com"
              />
            </div>
            <div className="mx-field">
              <label className="mx-label">Password</label>
              <input
                className="mx-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--st-down-bg)', color: 'var(--st-down)',
                borderRadius: 6, padding: '10px 14px', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mx-btn mx-btn-primary mx-btn-lg"
              style={{ justifyContent: 'center', marginTop: 6 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--nardo-faint)' }}>
            <Shield size={14} /> Access is scoped to your assigned company.
          </div>
        </div>
      </div>
    </div>
  );
}
