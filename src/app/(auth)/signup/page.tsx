'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetUserIdCache } from '@/lib/user-storage';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Sign out any existing session so the signup form is always shown fresh
    useEffect(() => {
        const clearSession = async () => {
            document.cookie = 'gymbruh-guest=; path=/; max-age=0';
            resetUserIdCache();
            const supabase = createClient();
            await supabase.auth.signOut();
        };
        clearSession();
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords don\'t match!');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // Detect if account already exists (Supabase returns empty identities)
            if (data?.user?.identities?.length === 0) {
                setError('An account with this email already exists. Try signing in.');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => router.push('/onboarding'), 1500);
        } catch {
            setError('Network error — check your internet connection and try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="glass-card-static auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                        Welcome to <span className="text-gradient">GymBruh!</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Let&apos;s set up your profile...
                    </p>
                </div>
                <style jsx>{`
          .auth-container { width: 100%; max-width: 440px; }
          .auth-card { padding: 40px 36px; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="glass-card-static auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Gym<span style={{ color: '#FBFF00' }}>Bruh</span></h1>
                    <p className="auth-subtitle">Start your fitness journey 🔥</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
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
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="Type it again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        className="glass-btn glass-btn-rainbow"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {loading ? '⏳ Creating account...' : '✨ Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span style={{ color: 'var(--text-muted)' }}>Already a member?</span>{' '}
                    <Link href="/login" className="auth-link">Sign in</Link>
                </div>
            </div>

            <style jsx>{`
        .auth-container { width: 100%; max-width: 440px; }
        .auth-card { padding: 40px 36px; }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-logo { font-size: 2.2rem; font-weight: 900; margin-bottom: 8px; }
        .auth-subtitle { color: var(--text-secondary); font-size: 1rem; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          color: var(--color-danger);
          font-size: 0.9rem;
          display: flex; align-items: center; gap: 8px;
        }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 0.9rem; }
        .auth-link {
          color: #FBFF00;
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-fast);
        }
        .auth-link:hover { color: #e6eb00; }
      `}</style>
        </div>
    );
}
