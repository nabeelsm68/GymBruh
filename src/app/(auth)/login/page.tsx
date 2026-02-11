'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('Network error — check your connection and try again.');
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        document.cookie = 'gymbruh-guest=true; path=/; max-age=86400';
        router.push('/onboarding');
    };

    return (
        <div className="auth-container">
            <div className="glass-card-static auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Gym<span style={{ color: '#FBFF00' }}>Bruh</span></h1>
                    <p className="auth-subtitle">Welcome back, champion 💪</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="glass-btn glass-btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <div className="divider-row">
                    <div className="rainbow-divider" style={{ flex: 1 }} />
                    <span className="divider-text">or</span>
                    <div className="rainbow-divider" style={{ flex: 1 }} />
                </div>

                <button
                    onClick={handleGuestMode}
                    className="glass-btn glass-btn-rainbow"
                    style={{ width: '100%' }}
                >
                    👀 Continue as Guest
                </button>

                <div className="auth-footer">
                    <span style={{ color: 'var(--text-muted)' }}>New here?</span>{' '}
                    <Link href="/signup" className="auth-link">Create an account</Link>
                </div>
            </div>

            <style jsx>{`
        .auth-container {
          width: 100%;
          max-width: 440px;
        }

        .auth-card {
          padding: 40px 36px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          color: var(--color-danger);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .divider-text {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9rem;
        }

        .auth-link {
          color: #FBFF00;
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .auth-link:hover {
          color: #e6eb00;
        }
      `}</style>
        </div>
    );
}
