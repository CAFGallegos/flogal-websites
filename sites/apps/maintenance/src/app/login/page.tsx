'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/');
    });
  }, [router]);

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
      router.push('/');
      router.refresh();
    }
  }

  return (
    <>
      <style>{`
        @keyframes flogal-halo {
          0%   { box-shadow: 0 0 0 2px #4A90D9, 0 0 28px 6px rgba(74,144,217,0.22); }
          33%  { box-shadow: 0 0 0 2px #C9A84C, 0 0 28px 6px rgba(201,168,76,0.22); }
          66%  { box-shadow: 0 0 0 2px #4CAF7D, 0 0 28px 6px rgba(76,175,125,0.22); }
          100% { box-shadow: 0 0 0 2px #4A90D9, 0 0 28px 6px rgba(74,144,217,0.22); }
        }
        .portal-card { animation: flogal-halo 5s ease-in-out infinite; }
        .portal-input {
          width: 100%; padding: 11px 14px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #fff; font-family: inherit; font-size: 14px;
          outline: none; transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .portal-input::placeholder { color: rgba(255,255,255,0.3); }
        .portal-input:focus { border-color: rgba(255,255,255,0.35); }
        .portal-label {
          display: block; margin-bottom: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.45);
        }
        .portal-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.18); flex-shrink: 0; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#6B6E70',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div
          className="portal-card"
          style={{
            background: '#1A1F2E',
            borderRadius: 14,
            padding: '40px 44px 36px',
            width: '100%',
            maxWidth: 420,
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/flogal-symbol-white.png"
              alt="Flogal"
              style={{ height: 32, width: 'auto', display: 'block', flexShrink: 0 }}
            />
            <div className="portal-divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{
                color: '#fff', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.18em', fontVariant: 'small-caps', textTransform: 'uppercase',
              }}>
                Flogal
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Flogal Technologies
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 0 28px' }} />

          <h1 style={{
            color: '#fff', fontWeight: 700, fontSize: 26,
            letterSpacing: '-0.01em', margin: '0 0 8px',
          }}>
            Flogal Technologies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 28px', lineHeight: 1.5 }}>
            Sign in to access your Flogal applications.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="portal-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="portal-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                placeholder="you@flogalhq.com"
              />
            </div>

            <div>
              <label className="portal-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="portal-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(162,59,37,0.25)', color: '#f87171',
                borderRadius: 7, padding: '10px 14px', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 7,
                background: '#6B6E70', border: 'none',
                color: '#fff', fontWeight: 600, fontSize: 15,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4, transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Signing in...' : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
            Trouble signing in?{' '}
            <a href="mailto:info@flogalhq.com" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'underline' }}>
              Email IT
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
