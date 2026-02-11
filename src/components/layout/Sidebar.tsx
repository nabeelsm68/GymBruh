'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/scanner', label: 'Food Scanner', icon: '📸' },
  { href: '/dashboard/planner', label: 'AI Planner', icon: '🧠' },
  { href: '/dashboard/nutritionists', label: 'Nutritionists', icon: '👨‍⚕️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    document.cookie = 'gymbruh-guest=; path=/; max-age=0';
    localStorage.removeItem('gymbruh-guest-profile');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <span className="logo-text">Gym<span className="logo-accent">Bruh</span></span>
          <span className="logo-tagline">AI-POWERED FITNESS</span>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider" />
          <button
            onClick={handleSignOut}
            className="sidebar-signout"
            disabled={signingOut}
          >
            {signingOut ? '👋 Signing out...' : '🚪 Sign Out'}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'mobile-nav-active' : ''}`}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          width: 240px;
          height: 100vh;
          background: #0a0a0a;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 24px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .logo-accent {
          color: #FBFF00;
        }

        .logo-tagline {
          font-size: 0.65rem;
          color: #71717a;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .sidebar-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 20px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          color: #a1a1aa;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .sidebar-link:hover {
          color: #fafafa;
          background: rgba(255, 255, 255, 0.06);
        }

        .sidebar-link-active {
          color: #fafafa;
          background: rgba(251, 255, 0, 0.08);
          font-weight: 600;
          box-shadow: inset 3px 0 0 #FBFF00;
        }

        .sidebar-icon {
          font-size: 1.15rem;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-label {
          white-space: nowrap;
        }

        .sidebar-footer {
          padding: 0 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-signout {
          width: calc(100% - 16px);
          margin: 0 8px;
          padding: 10px 14px;
          background: rgba(39, 39, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #a1a1aa;
          font-family: var(--font-family);
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sidebar-signout:hover {
          background: rgba(63, 63, 70, 0.5);
          color: #fafafa;
          border-color: rgba(255, 255, 255, 0.12);
        }

        .sidebar-signout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile Nav */
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
          z-index: 100;
          justify-content: space-around;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #71717a;
          transition: all 0.2s ease;
        }

        .mobile-nav-active {
          color: #FBFF00;
        }

        .mobile-nav-icon {
          font-size: 1.3rem;
        }

        .mobile-nav-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none;
          }
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
