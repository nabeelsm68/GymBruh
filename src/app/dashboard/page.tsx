'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  name: string;
  goal: string;
  vibe: string;
  activity_level: number;
  diet_preference: string;
  allergies: string[];
}

interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

const goalLabels: Record<string, string> = {
  lose_weight: '🔥 Lose Weight',
  build_muscle: '💪 Build Muscle',
  maintain: '⚖️ Maintain',
  general_fitness: '🏆 General Fitness',
  endurance: '🏃 Endurance',
  flexibility: '🧘 Flexibility',
};

const vibeGreetings: Record<string, (name: string) => string> = {
  strict: (name) => `No excuses today, ${name}. Let's crush it.`,
  balanced: (name) => `Good to see you, ${name}. Let's make progress.`,
  chill: (name) => `Hey ${name}! No pressure, just vibes today 😎`,
  hype: (name) => `LET'S GOOO ${name}!! Today is YOUR day! 🔥🔥`,
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const isGuest = document.cookie.includes('gymbruh-guest=true');

      if (isGuest) {
        // Guest mode — load from localStorage
        const stored = localStorage.getItem('gymbruh-guest-profile');
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          setProfile({ name: 'Guest', goal: 'general_fitness', vibe: 'chill', activity_level: 3, diet_preference: '', allergies: [] });
        }
        // Demo food logs for guests
        setFoodLogs([
          { id: '1', food_name: '🥣 Oatmeal with Berries', calories: 320, protein: 12, carbs: 45, fats: 8, created_at: new Date().toISOString() },
          { id: '2', food_name: '🥗 Grilled Chicken Salad', calories: 450, protein: 38, carbs: 15, fats: 22, created_at: new Date().toISOString() },
          { id: '3', food_name: '🍌 Banana Protein Shake', calories: 280, protein: 25, carbs: 35, fats: 5, created_at: new Date().toISOString() },
        ]);
        setStreak(3);
        setLoading(false);
        return;
      }

      // Authenticated user
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) setProfile(profileData);

          const today = new Date().toISOString().split('T')[0];
          const { data: logs } = await supabase
            .from('food_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', today)
            .order('created_at', { ascending: false });

          if (logs) setFoodLogs(logs);
          setStreak(Math.floor(Math.random() * 7) + 1);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + (log.fats || 0), 0);

  const calorieTarget = 2000;
  const proteinTarget = 150;
  const carbsTarget = 250;
  const fatsTarget = 65;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading your dashboard...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 16px;
            color: var(--text-secondary);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--glass-border);
            border-top-color: #FBFF00;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const greeting = profile?.vibe && profile?.name
    ? (vibeGreetings[profile.vibe] || vibeGreetings.balanced)(profile.name)
    : `Welcome back! 💪`;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}</h1>
          <p className="dash-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {profile?.goal && (
          <div className="badge badge-info">{goalLabels[profile.goal] || profile.goal}</div>
        )}
      </div>

      {/* Widget Grid */}
      <div className="widget-grid">
        {/* Calorie Ring Widget */}
        <div className="glass-card-static widget widget-calories">
          <h3 className="widget-title">🔥 Calories Today</h3>
          <div className="calorie-ring-container">
            <svg viewBox="0 0 120 120" className="calorie-ring">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="url(#calorieGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((totalCalories / calorieTarget) * 327, 327)} 327`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
              <defs>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBFF00" />
                  <stop offset="50%" stopColor="#e6eb00" />
                  <stop offset="100%" stopColor="#FBFF00" />
                </linearGradient>
              </defs>
            </svg>
            <div className="calorie-ring-text">
              <span className="calorie-value">{totalCalories}</span>
              <span className="calorie-label">/ {calorieTarget}</span>
            </div>
          </div>
        </div>

        {/* Macros Widget */}
        <div className="glass-card-static widget widget-macros">
          <h3 className="widget-title">📊 Macros</h3>
          <div className="macro-bars">
            {[
              { label: 'Protein', value: totalProtein, target: proteinTarget, color: '#60a5fa', unit: 'g' },
              { label: 'Carbs', value: totalCarbs, target: carbsTarget, color: '#facc15', unit: 'g' },
              { label: 'Fats', value: totalFats, target: fatsTarget, color: '#c084fc', unit: 'g' },
            ].map((macro) => (
              <div key={macro.label} className="macro-bar-item">
                <div className="macro-bar-header">
                  <span className="macro-bar-label">{macro.label}</span>
                  <span className="macro-bar-value" style={{ color: macro.color }}>
                    {macro.value}<span className="macro-unit">/{macro.target}{macro.unit}</span>
                  </span>
                </div>
                <div className="macro-bar-track">
                  <div
                    className="macro-bar-fill"
                    style={{
                      width: `${Math.min((macro.value / macro.target) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${macro.color}, ${macro.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Widget */}
        <div className="glass-card-static widget widget-streak">
          <h3 className="widget-title">🔥 Streak</h3>
          <div className="streak-display">
            <span className="streak-number">{streak}</span>
            <span className="streak-label">days</span>
          </div>
          <p className="streak-message">
            {streak >= 7 ? 'On fire! Keep it up! 🚀' :
              streak >= 3 ? 'Building momentum! 💪' :
                'Every day counts! ✨'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card-static widget widget-actions">
          <h3 className="widget-title">⚡ Quick Actions</h3>
          <div className="action-grid">
            <Link href="/dashboard/scanner" className="action-btn">
              <span className="action-icon">📸</span>
              <span>Scan Food</span>
            </Link>
            <Link href="/dashboard/planner" className="action-btn">
              <span className="action-icon">🧠</span>
              <span>AI Plan</span>
            </Link>
            <Link href="/dashboard/nutritionists" className="action-btn">
              <span className="action-icon">👨‍⚕️</span>
              <span>Find Pro</span>
            </Link>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="glass-card-static widget widget-meals">
          <h3 className="widget-title">🍽️ Today&apos;s Meals</h3>
          {foodLogs.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '2rem' }}>🍕</span>
              <p>No meals logged yet today</p>
              <Link href="/dashboard/scanner" className="glass-btn glass-btn-sm glass-btn-primary">
                📸 Scan your first meal
              </Link>
            </div>
          ) : (
            <div className="meals-list">
              {foodLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="meal-item">
                  <span className="meal-name">{log.food_name}</span>
                  <div className="meal-macros">
                    <span className="macro-calories">{log.calories} cal</span>
                    <span className="macro-protein">{log.protein}g P</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          animation: fadeInUp 0.5s ease-out;
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dash-greeting {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .dash-date {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .widget-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .widget {
          padding: 24px;
        }

        .widget-title {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #d4d4d8;
          letter-spacing: 0.02em;
        }

        /* Calorie Ring */
        .widget-calories {
          grid-row: span 1;
        }

        .calorie-ring-container {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto;
        }

        .calorie-ring {
          width: 100%;
          height: 100%;
        }

        .calorie-ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .calorie-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 800;
          color: #FBFF00;
        }

        .calorie-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Macros */
        .macro-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .macro-bar-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .macro-bar-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .macro-bar-value {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .macro-unit {
          color: var(--text-muted);
          font-weight: 400;
        }

        .macro-bar-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .macro-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-out;
        }

        /* Streak */
        .streak-display {
          text-align: center;
          margin-bottom: 12px;
        }

        .streak-number {
          font-size: 3.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #FBFF00, #e6eb00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .streak-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 4px;
        }

        .streak-message {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Actions */
        .action-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fafafa !important;
          text-decoration: none !important;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(251, 255, 0, 0.2);
          color: #FBFF00 !important;
          transform: translateX(4px);
        }

        .action-icon {
          font-size: 1.3rem;
        }

        /* Meals */
        .widget-meals {
          grid-column: span 2;
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .meals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .meal-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .meal-macros {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .widget-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .widget-grid {
            grid-template-columns: 1fr;
          }
          .widget-meals {
            grid-column: span 1;
          }
          .dash-greeting {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
