'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icons';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="landing-page">
      {/* Floating particles — neon-tinted */}
      <div className="particles">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`} />
        ))}
      </div>

      <header className="landing-header">
        <span className="logo-main">Gym<span className="logo-accent">Bruh</span></span>
        <div className="header-actions">
          <Link href="/login" className="glass-btn glass-btn-sm">Log In</Link>
          <Link href="/signup" className="glass-btn glass-btn-primary glass-btn-sm">Get Started</Link>
        </div>
      </header>

      <main className="landing-hero">
        <div className={`hero-content ${mounted ? 'animate-fade-in-up' : ''}`}>
          <div className="hero-badge"><Icon name="sparkles" size={14} /> AI-Powered Fitness</div>
          <h1 className="hero-title">
            Your Health,<br />
            <span className="hero-accent">Reimagined.</span>
          </h1>
          <p className="hero-subtitle">
            Scan food with AI. Get personalized diet & workout plans.
            Track your macros effortlessly. All wrapped in a beautiful experience.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="glass-btn glass-btn-primary glass-btn-lg">
              <Icon name="rocket" size={18} /> Start Your Journey
            </Link>
            <button
              className="glass-btn glass-btn-lg"
              onClick={() => {
                document.cookie = 'gymbruh-guest=true; path=/; max-age=86400';
                window.location.href = '/onboarding';
              }}
            >
              <Icon name="eye" size={18} /> Try as Guest
            </button>
          </div>
        </div>

        <div className={`hero-features ${mounted ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          {[
            { icon: 'camera' as const, title: 'Food Scanner', desc: 'Scan any meal, get instant macros' },
            { icon: 'brain' as const, title: 'AI Plans', desc: 'Custom diet & workout schedules' },
            { icon: 'doctor' as const, title: 'Find Pros', desc: 'Nearby nutritionists & trainers' },
            { icon: 'fire' as const, title: 'Track Streaks', desc: 'Stay consistent, stay motivated' },
          ].map((feat) => (
            <div key={feat.title} className="feature-card">
              <span className="feature-icon"><Icon name={feat.icon} size={32} /></span>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(251, 255, 0, 0.15);
          filter: blur(60px);
          animation: float 20s ease-in-out infinite;
        }

        .particle-0 { width: 300px; height: 300px; top: 10%; left: -5%; animation-delay: 0s; opacity: 0.4; }
        .particle-1 { width: 200px; height: 200px; top: 60%; right: -3%; animation-delay: -4s; opacity: 0.3; }
        .particle-2 { width: 150px; height: 150px; top: 30%; right: 20%; animation-delay: -8s; opacity: 0.2; }
        .particle-3 { width: 250px; height: 250px; bottom: 10%; left: 20%; animation-delay: -12s; opacity: 0.25; }
        .particle-4 { width: 180px; height: 180px; top: 50%; left: 40%; animation-delay: -6s; opacity: 0.3; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 25px) scale(0.95); }
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          position: relative;
          z-index: 10;
        }

        .logo-main {
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
        }

        .logo-accent {
          color: #FBFF00;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .landing-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }

        .hero-content {
          text-align: center;
          max-width: 700px;
          margin-bottom: 60px;
        }

        .hero-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(251, 255, 0, 0.08);
          color: #FBFF00;
          border: 1px solid rgba(251, 255, 0, 0.2);
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          color: #fafafa;
        }

        .hero-accent {
          color: #FBFF00;
          text-shadow: 0 0 40px rgba(251, 255, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 550px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 900px;
          width: 100%;
        }

        .feature-card {
          padding: 28px 20px;
          text-align: center;
          cursor: default;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          background: rgba(26, 26, 26, 0.8);
          border-color: rgba(251, 255, 0, 0.15);
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(251, 255, 0, 0.08);
        }

        .feature-icon {
          font-size: 2.2rem;
          display: block;
          margin-bottom: 12px;
        }

        .feature-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #fafafa;
        }

        .feature-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .landing-header {
            padding: 16px 20px;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-features {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }
          .hero-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
