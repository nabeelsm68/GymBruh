'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { resetUserIdCache, userKey } from '@/lib/user-storage';

/* ── Clean SVG line icons ── */
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  scanner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  sleep: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  ),
  journal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" /><path d="M8 11h6" />
    </svg>
  ),
  planner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.4V11h3a3 3 0 013 3v1.5a2.5 2.5 0 01-5 0V14h-6v1.5a2.5 2.5 0 01-5 0V14a3 3 0 013-3h3V9.4A4 4 0 0112 2z" />
      <circle cx="12" cy="6" r="1" />
    </svg>
  ),
  nutritionists: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-3-3.87M14 3.13a4 4 0 010 7.75" />
      <path d="M8 21v-2a4 4 0 00-4-4H4a4 4 0 00-4 4v2" /><circle cx="8" cy="7" r="4" />
    </svg>
  ),
  signout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  trainer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  loading: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" />
    </svg>
  ),
};

const navItems = [
  { href: '/dashboard/home', label: 'Home', iconKey: 'home' },
  { href: '/dashboard', label: 'Dashboard', iconKey: 'dashboard' },
  { href: '/dashboard/trainer', label: 'AI Trainer', iconKey: 'trainer' },
  { href: '/dashboard/scanner', label: 'Food Scanner', iconKey: 'scanner' },
  { href: '/dashboard/sleep', label: 'Sleep', iconKey: 'sleep' },
  { href: '/dashboard/journal', label: 'Journal', iconKey: 'journal' },
  { href: '/dashboard/planner', label: 'AI Planner', iconKey: 'planner' },
  { href: '/dashboard/nutritionists', label: 'Nutritionists', iconKey: 'nutritionists' },
  { href: '/dashboard/settings', label: 'Settings', iconKey: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    document.cookie = 'gymbruh-guest=; path=/; max-age=0';
    localStorage.removeItem(userKey('guest-profile'));
    resetUserIdCache();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop ${mounted ? 'sidebar-mounted' : ''}`}>
        {/* Animated orb blobs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="sidebar-inner">
          <div className="sidebar-logo">
            <span className="logo-text">Gym<span className="logo-accent">Bruh</span></span>
            <span className="logo-tagline">AI-POWERED FITNESS</span>
          </div>

          <div className="sidebar-divider" />

          <nav className="sidebar-nav">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {isActive && <span className="active-glow" />}
                  <span className="sidebar-icon">{icons[item.iconKey]}</span>
                  <span className="sidebar-label">{item.label}</span>
                  {isActive && <span className="active-indicator" />}
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
              <span className="sidebar-icon">{signingOut ? icons.loading : icons.signout}</span>
              <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
            </button>
          </div>
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
              <span className="mobile-nav-icon">{icons[item.iconKey]}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        /* ═══ Keyframes ═══ */
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 60px) scale(1.2); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, -30px) scale(0.8); }
          66% { transform: translate(20px, -60px) scale(1.1); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -20px) scale(1.15); }
          66% { transform: translate(-30px, 40px) scale(0.85); }
        }
        @keyframes edgeGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseActive {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spinIcon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sidebarEnter {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ═══ Desktop Sidebar ═══ */
        .sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          z-index: 100;
          overflow: hidden;
          opacity: 0;
          transform: translateX(-20px);
        }

        .sidebar-mounted {
          animation: sidebarEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* ── Floating orb blobs for liquid glass ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 160px;
          height: 160px;
          top: -30px;
          left: -30px;
          background: radial-gradient(circle, rgba(251,255,0,0.12) 0%, transparent 70%);
          animation: orbFloat1 12s ease-in-out infinite;
        }
        .orb-2 {
          width: 120px;
          height: 120px;
          bottom: 100px;
          right: -20px;
          background: radial-gradient(circle, rgba(120,80,255,0.1) 0%, transparent 70%);
          animation: orbFloat2 15s ease-in-out infinite;
        }
        .orb-3 {
          width: 100px;
          height: 100px;
          top: 50%;
          left: 20px;
          background: radial-gradient(circle, rgba(251,255,0,0.06) 0%, transparent 70%);
          animation: orbFloat3 18s ease-in-out infinite;
        }

        /* ── Glass container ── */
        .sidebar-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(
            170deg,
            rgba(18, 18, 24, 0.75) 0%,
            rgba(12, 12, 16, 0.88) 40%,
            rgba(8, 8, 12, 0.92) 100%
          );
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          border-right: 1px solid rgba(255,255,255,0.07);
        }

        /* Right edge animated glow */
        .sidebar-inner::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(251,255,0,0.35),
            rgba(120,80,255,0.25),
            rgba(251,255,0,0.15),
            transparent
          );
          background-size: 100% 300%;
          animation: edgeGlow 5s ease-in-out infinite;
        }

        /* ── Logo ── */
        .sidebar-logo {
          padding: 30px 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .logo-text {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #fff;
          text-shadow:
            0 0 40px rgba(251,255,0,0.12),
            0 2px 8px rgba(0,0,0,0.4);
        }

        .logo-accent {
          background: linear-gradient(
            90deg,
            #FBFF00,
            #e8ff70,
            #FBFF00,
            #ffe066,
            #FBFF00
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 4s linear infinite;
        }

        .logo-tagline {
          font-size: 0.6rem;
          color: rgba(161,161,170,0.5);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── Divider ── */
        .sidebar-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.06) 20%,
            rgba(251,255,0,0.08) 50%,
            rgba(255,255,255,0.06) 80%,
            transparent 100%
          );
          margin: 0 20px;
        }

        /* ── Nav ── */
        .sidebar-nav {
          flex: 1;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          color: rgba(200,200,210,0.8);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.88rem;
          letter-spacing: 0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow:
            0 2px 8px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Frosted glass hover shimmer */
        .sidebar-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0.0) 0%,
            rgba(255,255,255,0.06) 40%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 60%,
            rgba(255,255,255,0.0) 100%
          );
          background-size: 250% 100%;
          background-position: 100% center;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-link:hover {
          color: #fafafa;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          border-color: rgba(255,255,255,0.22);
          transform: translateX(6px);
          box-shadow:
            0 6px 28px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .sidebar-link:hover::before {
          opacity: 1;
          background-position: -100% center;
          transition: background-position 0.8s ease, opacity 0.3s ease;
        }

        /* ── Active link ── */
        .sidebar-link-active {
          color: #fafafa;
          background: linear-gradient(
            135deg,
            rgba(251,255,0,0.1) 0%,
            rgba(251,255,0,0.04) 50%,
            rgba(120,80,255,0.04) 100%
          );
          border-color: rgba(251,255,0,0.3);
          font-weight: 600;
          box-shadow:
            0 0 20px rgba(251,255,0,0.08),
            0 4px 20px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(251,255,0,0.15),
            inset 0 0 40px rgba(251,255,0,0.04);
        }

        .sidebar-link-active::before {
          opacity: 0.6;
        }

        /* Active glow background */
        .active-glow {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #FBFF00, #e0ff66);
          box-shadow:
            0 0 12px rgba(251,255,0,0.6),
            0 0 30px rgba(251,255,0,0.3);
          animation: pulseActive 2.5s ease-in-out infinite;
        }

        /* Active right indicator dot */
        .active-indicator {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FBFF00;
          box-shadow: 0 0 10px rgba(251,255,0,0.8);
          animation: pulseActive 2s ease-in-out infinite;
        }

        .sidebar-link-active:hover {
          transform: translateX(6px);
          box-shadow:
            0 0 40px rgba(251,255,0,0.1),
            0 4px 24px rgba(0,0,0,0.3),
            inset 0 0 40px rgba(251,255,0,0.04);
        }

        /* ── Icon ── */
        .sidebar-icon {
          width: 24px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-icon svg {
          display: block;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-link:hover .sidebar-icon svg {
          transform: scale(1.15);
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.2));
        }

        .sidebar-link-active .sidebar-icon svg {
          stroke: #FBFF00;
          filter: drop-shadow(0 0 6px rgba(251,255,0,0.4));
        }

        /* ── Label ── */
        .sidebar-label {
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }

        /* ── Footer ── */
        .sidebar-footer {
          padding: 0 14px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sidebar-signout {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.04),
            rgba(255,255,255,0.02)
          );
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          color: rgba(180,180,190,0.6);
          font-family: var(--font-family);
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .sidebar-signout::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(
            120deg,
            transparent 40%,
            rgba(255,255,255,0.06) 50%,
            transparent 60%
          );
          background-size: 250% 100%;
          background-position: 100% center;
          opacity: 0;
          transition: all 0.5s ease;
        }

        .sidebar-signout:hover {
          color: #f0f0f0;
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
        }

        .sidebar-signout:hover::before {
          opacity: 1;
          background-position: -100% center;
          transition: background-position 0.8s ease, opacity 0.3s ease;
        }

        .sidebar-signout:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .sidebar-signout:disabled .sidebar-icon svg {
          animation: spinIcon 1.2s linear infinite;
        }

        /* ═══ Mobile Nav ═══ */
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            180deg,
            rgba(10,10,14,0.75),
            rgba(8,8,12,0.95)
          );
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 8px 12px;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
          z-index: 100;
          justify-content: space-around;
        }

        .mobile-nav::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251,255,0,0.25),
            rgba(120,80,255,0.15),
            rgba(251,255,0,0.25),
            transparent
          );
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          text-decoration: none;
          color: rgba(120,120,130,0.7);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-nav-active {
          color: #FBFF00;
          text-shadow: 0 0 16px rgba(251,255,0,0.5);
        }

        .mobile-nav-icon {
          font-size: 1.3rem;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-nav-icon svg {
          display: block;
        }

        .mobile-nav-active .mobile-nav-icon {
          transform: scale(1.15);
        }

        .mobile-nav-active .mobile-nav-icon svg {
          stroke: #FBFF00;
          filter: drop-shadow(0 0 8px rgba(251,255,0,0.5));
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
