'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Icon from '@/components/ui/Icons';
import { initUserId, userKey } from '@/lib/user-storage';
import './dashboard.css';

/* ═══ Types ═══ */
interface Profile {
  name: string;
  goal: string;
  vibe: string;
}

interface FoodLog {
  calories: number;
}

interface JournalEntry {
  note: string;
  photos: string[];
  date: string;
}

interface SleepData {
  date: string;
  hours: number;
  label: string;
}

/* ═══ Constants ═══ */
const goalIcons: Record<string, string> = {
  lose_weight: 'fire',
  build_muscle: 'muscle',
  maintain: 'scale',
  general_fitness: 'trophy',
  endurance: 'runner',
};

const goalLabels: Record<string, string> = {
  lose_weight: 'Weight Loss',
  build_muscle: 'Muscle Gain',
  maintain: 'Maintain',
  general_fitness: 'Fitness',
  endurance: 'Endurance',
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Data States
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [latestJournal, setLatestJournal] = useState<JournalEntry | null>(null);
  const [points, setPoints] = useState(0);
  const [plantGrowth, setPlantGrowth] = useState(0); // 0-100
  const [activityMap, setActivityMap] = useState<{ level: number, day: number, isToday: boolean, isFuture: boolean }[]>([]); // 4 weeks of activity

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  /* ═══ Data Fetching Logic ═══ */
  const fetchData = useCallback(async () => {
    const isGuest = document.cookie.includes('gymbruh-guest=true');
    const today = new Date();

    // 1. Water Intake
    const waterKey = userKey(`water-${todayStr}`);
    const storedWater = localStorage.getItem(waterKey);
    setWaterGlasses(storedWater ? parseInt(storedWater, 10) : 0);

    // 2. Sleep Data (Last 7 Days)
    const sleep = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const key = userKey(`sleep-${ds}`);
      const val = localStorage.getItem(key);
      sleep.push({
        date: ds,
        hours: val ? parseFloat(val) : 0,
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' })
      });
    }
    setSleepData(sleep);

    // 3. Journal Snapshot
    const journalKey = userKey('cj-entries');
    const storedJournal = localStorage.getItem(journalKey);
    if (storedJournal) {
      const entries = JSON.parse(storedJournal) as JournalEntry[];
      if (entries.length > 0) {
        setLatestJournal(entries[entries.length - 1]);
      }
    }

    // 4. Activity Heatmap (4 Full Weeks Aligned to Monday)
    const activity = [];
    let totalActPoints = 0;

    // Get Monday of the current week (Mon=1, Sun=0 in JS getDay)
    const currentDay = now.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const mondayThisWeek = new Date(now);
    mondayThisWeek.setDate(now.getDate() - daysSinceMonday);

    // Start from Monday 3 weeks ago (to show 4 rows total)
    const startMonday = new Date(mondayThisWeek);
    startMonday.setDate(mondayThisWeek.getDate() - 21);

    for (let i = 0; i < 28; i++) {
      const d = new Date(startMonday);
      d.setDate(startMonday.getDate() + i);
      const ds = d.toISOString().split('T')[0];

      let level = 0;
      if (localStorage.getItem(userKey(`water-${ds}`))) level++;
      if (localStorage.getItem(userKey(`sleep-${ds}`))) level++;

      activity.push({
        level,
        day: d.getDate(),
        isToday: ds === todayStr,
        isFuture: d > now
      });
      totalActPoints += level;
    }
    setActivityMap(activity);
    setPlantGrowth(Math.min((totalActPoints / 56) * 100, 100)); // Sample logic

    if (isGuest) {
      const stored = localStorage.getItem(userKey('guest-profile'));
      setProfile(stored ? JSON.parse(stored) : { name: 'GymBruh', goal: 'general_fitness', vibe: 'chill' });
      setFoodLogs([]);
      setPoints(0);
      setLoading(false);
      return;
    }

    // Supabase Auth Code
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);
        const { data: logs } = await supabase.from('food_logs').select('calories').eq('user_id', user.id).gte('created_at', todayStr);
        if (logs) setFoodLogs(logs);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [todayStr]);

  useEffect(() => {
    initUserId().then(() => {
      fetchData();
      // Refresh every minute to keep it "Live"
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    });
  }, [fetchData]);

  /* ═══ Derived Stats ═══ */
  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const calorieTarget = 2000;
  const remainingCals = Math.max(calorieTarget - totalCalories, 0);
  const remainingWater = Math.max(8 - waterGlasses, 0);
  const streak = 5; // Placeholder

  const challenges = [
    { id: 'water', text: 'Drink 8 glasses of water', done: waterGlasses >= 8, points: 500, icon: 'water' },
    { id: 'food', text: 'Log all meals today', done: foodLogs.length > 0, points: 300, icon: 'utensils' },
    { id: 'sleep', text: 'Get 7+ hours of sleep', done: sleepData[6]?.hours >= 7, points: 1000, icon: 'moon' },
  ];

  const mascotStance = useMemo(() => {
    if (sleepData[6]?.hours < 6) return '😴';
    if (waterGlasses >= 8 && foodLogs.length > 0) return '💪';
    if (plantGrowth > 50) return '🦖';
    return '👋';
  }, [sleepData, waterGlasses, foodLogs, plantGrowth]);

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      {/* ═══ Header Section ═══ */}
      <section className="dash-top">
        <div className="mascot-wrap">
          <div className="mascot-avatar">{mascotStance}</div>
          <div className="greeting-info">
            <h1>Hii, <span className="serif">{profile?.name || 'Bruh'}!</span></h1>
            <p>Your sanctuary is looking {plantGrowth > 70 ? 'vibrant' : 'cozy'} today.</p>
          </div>
        </div>
        <div className="points-badge">
          <span className="points-val">{points.toLocaleString()}</span>
          <span className="points-label">Total Points</span>
        </div>
      </section>

      {/* ═══ Master Grid ═══ */}
      <div className="dash-grid">

        {/* 🏆 Wellness Challenges */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="trophy" size={14} /></span>
              Daily Challenges
            </h3>
          </div>
          <div className="challenges-list">
            {challenges.map(ch => (
              <div key={ch.id} className={`challenge-item ${ch.done ? 'challenge-item-done ch-done' : ''}`}>
                <div className="challenge-info">
                  <span className="ch-dot" />
                  <span className="ch-text">{ch.text}</span>
                </div>
                {ch.done ? <Icon name="checkCircle" size={16} /> : <span className="ch-pts">+{ch.points}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 🔋 Power Center (Water & Calories) */}
        <div className="widget-card power-widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="lightning" size={14} /></span>
              Power Center
            </h3>
          </div>
          <div className="power-stats-grid">
            <div className="power-stat-item">
              <div className="ps-header">
                <div className="ps-icon ps-icon-water"><Icon name="droplet" size={16} /></div>
                <div className="ps-meta">
                  <span className="ps-label">Hydration</span>
                  <span className="ps-sub">{remainingWater > 0 ? `${remainingWater} cups left` : 'Fully Hydrated!'}</span>
                </div>
                <span className="ps-val">{waterGlasses}/8</span>
              </div>
              <div className="ps-track">
                <div className="ps-fill ps-fill-water" style={{ width: `${Math.min((waterGlasses / 8) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="power-stat-item">
              <div className="ps-header">
                <div className="ps-icon ps-icon-fuel"><Icon name="fire" size={16} /></div>
                <div className="ps-meta">
                  <span className="ps-label">Fuel (kcal)</span>
                  <span className="ps-sub">{remainingCals > 0 ? `${remainingCals} kcal left` : 'Goal Reached!'}</span>
                </div>
                <span className="ps-val">{totalCalories}</span>
              </div>
              <div className="ps-track">
                <div className="ps-fill ps-fill-fuel" style={{ width: `${Math.min((totalCalories / calorieTarget) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Heatmap Mini Integration */}
          <div className="heatmap-section">
            <div className="heatmap-header">
              <span className="prog-label">Consistency Pulse</span>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="leg-cell heat-0" />
                <div className="leg-cell heat-1" />
                <div className="leg-cell heat-2" />
                <div className="leg-cell heat-3" />
                <div className="leg-cell heat-4" />
                <span>More</span>
              </div>
            </div>
            <div className="heatmap-container">
              <div className="heatmap-header-labels">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => <span key={i} className="day-label">{d}</span>)}
              </div>
              <div className="heatmap-grid">
                {activityMap.map((data, i) => (
                  <div
                    key={i}
                    className={`heat-cell heat-${data.level} ${data.isToday ? 'heat-today' : ''} ${data.isFuture ? 'heat-future' : ''}`}
                    title={data.isFuture ? 'Future date' : `Level ${data.level}`}
                  >
                    <span className="cell-number">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 🌱 Virtual Sanctuary */}
        <div className="widget-card plant-widget">
          <div className="widget-header" style={{ width: '100%', marginBottom: '10px' }}>
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="sparkles" size={14} /></span>
              Virtual Plant
            </h3>
          </div>
          <div className="plant-stage">
            {plantGrowth > 80 ? '🌳' : plantGrowth > 50 ? '🌿' : plantGrowth > 20 ? '🌱' : '🪴'}
          </div>
          <div className="plant-info">
            <h4>Zen Garden</h4>
            <p>Grow your plant by hitting daily goals</p>
            <div className="plant-growth-bar">
              <div className="plant-growth-fill" style={{ width: `${plantGrowth}%` }} />
            </div>
          </div>
        </div>

        {/* 💤 Sleep Pulse (Mini Graph) */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="moon" size={14} /></span>
              Sleep Pulse
            </h3>
            <Link href="/dashboard/sleep" className="glass-btn glass-btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Update</Link>
          </div>
          <div className="mini-graph-wrap">
            {sleepData.map((d, i) => (
              <div key={i} className="mini-bar-col">
                <div
                  className={`mini-bar ${d.hours >= 7 ? 'mini-bar-goal' : ''}`}
                  style={{ height: `${Math.max((d.hours / 12) * 100, 4)}%` }} // Min 4% for visibility
                />
                <span className="mini-day">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📸 Journal Snippet */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="book" size={14} /></span>
              Latest Memory
            </h3>
            <Link href="/dashboard/journal" className="glass-btn glass-btn-sm" style={{ padding: '4px 8px' }}>View All</Link>
          </div>
          {latestJournal ? (
            <div className="spotlight-card">
              {latestJournal.photos[0] && (
                <div className="spotlight-img" style={{ backgroundImage: `url(${latestJournal.photos[0]})` }} />
              )}
              <p className="spotlight-note">&ldquo;{latestJournal.note}&rdquo;</p>
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '20px' }}>
              <Icon name="camera" size={24} />
              <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>No journal entries yet</p>
            </div>
          )}
        </div>

        {/* ⚡ Command Center */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="icon-wrap"><Icon name="lightning" size={14} /></span>
              Command Center
            </h3>
          </div>
          <div className="command-grid-new">
            <Link href="/dashboard/scanner" className="action-tile-new">
              <div className="tile-icon"><Icon name="camera" size={24} /></div>
              <div className="tile-text">
                <span className="tile-label">Scan Food</span>
                <span className="tile-sub">AI Nutrition</span>
              </div>
            </Link>
            <Link href="/dashboard/planner" className="action-tile-new">
              <div className="tile-icon"><Icon name="brain" size={24} /></div>
              <div className="tile-text">
                <span className="tile-label">AI Planner</span>
                <span className="tile-sub">Custom Workouts</span>
              </div>
            </Link>
          </div>
          <div className="streak-pill-new">
            <span className="streak-fire">🔥</span>
            <span className="streak-text">{streak} Day Consistency</span>
          </div>
        </div>

      </div>

      <style jsx>{`
        .dash-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.05);
          border-top-color: var(--lime);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .action-btn-new {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .action-btn-new:hover {
          background: rgba(251, 255, 0, 0.06);
          border-color: rgba(251, 255, 0, 0.2);
          transform: translateY(-2px);
          color: var(--lime);
        }
      `}</style>
    </div>
  );
}
