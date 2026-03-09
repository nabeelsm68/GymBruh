'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icons';
import { initUserId, userKey } from '@/lib/user-storage';
import './home.css';

/* ── Motivational Quotes ── */
const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Discipline is choosing between what you want now and what you want most.",
  "Strive for progress, not perfection.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Sweat is fat crying.",
  "Champions aren't made in gyms — champions are made from something deep inside.",
];

/* ── Helpers ── */
function getStorageKey(prefix: string, date: Date) {
  return userKey(`${prefix}-${date.toISOString().split('T')[0]}`);
}

function isSameDay(a: Date, b: Date) {
  return a.toISOString().split('T')[0] === b.toISOString().split('T')[0];
}

/* ── Types ── */
interface MealEntry {
  id: string;
  name: string;
  calories: number;
}

type MealType = 'breakfast' | 'lunch' | 'dinner';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: 'sunrise' as const, tagline: "Start your day strong!" };
  if (h < 17) return { text: 'Good Afternoon', icon: 'sun' as const, tagline: "Keep the momentum going!" };
  return { text: 'Good Evening', icon: 'moon' as const, tagline: "Great work today!" };
}

export default function HomePage() {
  const today = useMemo(() => new Date(), []);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState<{ text: string, tagline: string, icon: 'sunrise' | 'sun' | 'moon' }>({
    text: 'Welcome',
    tagline: 'Loading your dashboard...',
    icon: 'sunrise' as const
  });

  useEffect(() => {
    initUserId().then(() => {
      setMounted(true);
      setGreeting(getTimeGreeting());
    });
  }, []);

  /* ── Quote Rotation ── */
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % quotes.length);
        setQuoteFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* ── Date Carousel ── */
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);

  const carouselDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + dateOffset - 6 + i);
    return d;
  });

  /* ── Water Log ── */
  const [waterGlasses, setWaterGlasses] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey('water', today));
    if (stored) setWaterGlasses(parseInt(stored, 10));
  }, []);

  const updateWater = useCallback(
    (amount: number) => {
      setWaterGlasses((prev) => {
        const next = Math.max(0, prev + amount);
        localStorage.setItem(getStorageKey('water', today), String(next));
        return next;
      });
    },
    [today]
  );

  /* ── Meal Log ── */
  const [meals, setMeals] = useState<Record<MealType, MealEntry[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [activeMealForm, setActiveMealForm] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealCals, setMealCals] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey('meals', today));
    if (stored) {
      try { setMeals(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const saveMeals = (updated: Record<MealType, MealEntry[]>) => {
    setMeals(updated);
    localStorage.setItem(getStorageKey('meals', today), JSON.stringify(updated));
  };

  const addMeal = (type: MealType) => {
    if (!mealName.trim()) return;
    const entry: MealEntry = {
      id: Date.now().toString(),
      name: mealName.trim(),
      calories: parseInt(mealCals, 10) || 0,
    };
    const updated = { ...meals, [type]: [...meals[type], entry] };
    saveMeals(updated);
    setMealName('');
    setMealCals('');
    setActiveMealForm(null);
  };

  const removeMeal = (type: MealType, id: string) => {
    const updated = { ...meals, [type]: meals[type].filter((m) => m.id !== id) };
    saveMeals(updated);
  };

  /* ── Calorie Summary ── */
  const allMealEntries = [...meals.breakfast, ...meals.lunch, ...meals.dinner];
  const totalCalories = allMealEntries.reduce((s, m) => s + m.calories, 0);
  const calorieTarget = 2000;
  const waterTarget = 8;
  const caloriePercent = Math.min((totalCalories / calorieTarget) * 100, 100);
  const waterPercent = Math.min((waterGlasses / waterTarget) * 100, 100);

  /* ── Today's Sleep ── */
  const [todaySleep, setTodaySleep] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    const key = userKey(`sleep-${today.toISOString().split('T')[0]}`);
    const val = localStorage.getItem(key);
    if (val) setTodaySleep(parseFloat(val));
  }, [mounted, today]);

  /* ── Weekly Summary ── */
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getStorageKey('meals', d);
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const m = JSON.parse(stored);
          total += [...(m.breakfast || []), ...(m.lunch || []), ...(m.dinner || [])].reduce((s: number, e: any) => s + (e.calories || 0), 0);
        } catch { /* ignore */ }
      }
    }
    setWeeklyCalories(total);
  }, [mounted, today]);

  /* ── Daily Progress Score ── */
  const progressScore = useMemo(() => {
    let score = 0;
    if (totalCalories > 0) score += 25;
    if (totalCalories >= calorieTarget * 0.8) score += 15;
    if (waterGlasses >= waterTarget * 0.5) score += 20;
    if (waterGlasses >= waterTarget) score += 15;
    if (todaySleep >= 7) score += 25;
    return Math.min(score, 100);
  }, [totalCalories, waterGlasses, todaySleep]);

  const getScoreColor = (s: number) => {
    if (s >= 75) return '#4ade80';
    if (s >= 50) return '#facc15';
    return '#f87171';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Crushing It!';
    if (s >= 60) return 'Good Progress';
    if (s >= 40) return 'Keep Going';
    return 'Just Getting Started';
  };

  return (
    <div className="home-page">
      {/* ═══ Greeting Header ═══ */}
      <div className="greeting-header-premium">
        <div className="greeting-premium-text">
          <h1>{greeting.text}!</h1>
          <p>{greeting.tagline}</p>
        </div>
        <div className="today-pill-premium">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* ═══ Motivational Banner ═══ */}
      <section className="banner glass-card-premium">
        <div className="banner-accent" />
        <div className="banner-icon"><Icon name="dumbbell" size={32} /></div>
        <p className={`banner-quote ${quoteFade ? 'fade-in' : 'fade-out'}`}>
          &ldquo;{quotes[quoteIdx]}&rdquo;
        </p>
        <div className="banner-dots">
          {quotes.map((_, i) => (
            <span key={i} className={`dot ${i === quoteIdx ? 'dot-active' : ''}`} />
          ))}
        </div>
      </section>

      {/* ═══ Daily Progress Score ═══ */}
      <section className="progress-section glass-card-premium">
        <div className="progress-header">
          <h3 className="section-title"><Icon name="chart" size={16} /> Daily Consistency</h3>
          <span className="progress-label" style={{ color: getScoreColor(progressScore) }}>
            {getScoreLabel(progressScore)}
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressScore}%`,
                background: `linear-gradient(90deg, ${getScoreColor(progressScore)}aa, ${getScoreColor(progressScore)})`,
                boxShadow: `0 0 15px ${getScoreColor(progressScore)}44`
              }}
            />
          </div>
          <span className="progress-percent">{progressScore}%</span>
        </div>
        <div className="progress-checklist">
          <span className={`check-item ${totalCalories > 0 ? 'check-done' : ''}`}>
            <Icon name={totalCalories > 0 ? 'checkCircle' : 'target'} size={14} /> Fuel Logged
          </span>
          <span className={`check-item ${waterGlasses >= waterTarget ? 'check-done' : ''}`}>
            <Icon name={waterGlasses >= waterTarget ? 'checkCircle' : 'water'} size={14} /> Hydrated
          </span>
          <span className={`check-item ${todaySleep >= 7 ? 'check-done' : ''}`}>
            <Icon name={todaySleep >= 7 ? 'checkCircle' : 'sleep'} size={14} /> 7h+ Sleep
          </span>
        </div>
      </section>

      {/* ═══ Date Carousel ═══ */}
      <section className="date-carousel">
        <button className="carousel-arrow" onClick={() => setDateOffset((o) => o - 7)}>‹</button>
        <div className="carousel-dates">
          {carouselDates.map((d, i) => {
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDate);
            return (
              <button
                key={i}
                className={`date-chip ${isToday ? 'date-today' : ''} ${isSelected ? 'date-selected' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                <span className="date-weekday">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="date-day">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button className="carousel-arrow" onClick={() => setDateOffset((o) => o + 7)}>›</button>
      </section>

      {/* ═══ Water & Calories Row ═══ */}
      <div className="premium-widget-row">
        {/* Water Log */}
        <section className="glass-card-premium widget-glass">
          <h3 className="widget-glass-title"><Icon name="water" size={18} /> Hydration</h3>
          <div className="liquid-ring-container">
            <svg viewBox="0 0 100 100" className="liquid-ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#waterRingGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(waterGlasses / waterTarget) * 264} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              <defs>
                <linearGradient id="waterRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
            <div className="liquid-ring-text">
              <span className="ring-val">{waterGlasses}</span>
              <span className="ring-label">of {waterTarget}</span>
            </div>
          </div>
          <div className="water-actions" style={{ marginTop: '20px' }}>
            <button className="glass-btn-premium" onClick={() => updateWater(1)}>+ Glass</button>
            <button className="glass-btn-premium glass-btn-primary-glow" onClick={() => updateWater(14)}>+ Bottle</button>
            <button className="glass-btn-premium" style={{ color: '#f87171' }} onClick={() => { setWaterGlasses(0); localStorage.setItem(getStorageKey('water', today), '0'); }}>Reset</button>
          </div>
        </section>

        {/* Calorie Summary */}
        <section className="glass-card-premium widget-glass">
          <h3 className="widget-glass-title"><Icon name="fire" size={18} /> Fuel Center</h3>
          <div className="liquid-ring-container">
            <svg viewBox="0 0 100 100" className="liquid-ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#fuelRingGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((totalCalories / calorieTarget) * 264, 264)} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              <defs>
                <linearGradient id="fuelRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FBFF00" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="liquid-ring-text">
              <span className="ring-val">{totalCalories}</span>
              <span className="ring-label">/ {calorieTarget}</span>
            </div>
          </div>
          <div className="fuel-metrics-grid">
            <div className="fuel-metric-pill">
              <div className="fuel-icon-wrap"><Icon name="utensils" size={16} /></div>
              <div className="fuel-text-group">
                <span className="fuel-metric-val">{allMealEntries.length}</span>
                <span className="fuel-metric-label">Meals</span>
              </div>
            </div>
            <div className="fuel-metric-pill fuel-pill-remaining">
              <div className="fuel-icon-wrap"><Icon name="fire" size={16} /></div>
              <div className="fuel-text-group">
                <span className="fuel-metric-val">{Math.max(0, calorieTarget - totalCalories)}</span>
                <span className="fuel-metric-label">kcal Left</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <section className="actions-section">
        <h3 className="widget-glass-title" style={{ paddingLeft: '8px' }}><Icon name="lightning" size={16} /> Power Actions</h3>
        <div className="actions-premium-grid">
          <Link href="/dashboard/scanner" className="glass-card-premium action-pill-premium">
            <div className="action-icon-wrap" style={{ color: '#FBFF00' }}><Icon name="camera" size={24} /></div>
            <span className="action-label-premium">Scan</span>
          </Link>
          <Link href="/dashboard/planner" className="glass-card-premium action-pill-premium">
            <div className="action-icon-wrap" style={{ color: '#a855f7' }}><Icon name="brain" size={24} /></div>
            <span className="action-label-premium">Plan</span>
          </Link>
          <Link href="/dashboard/sleep" className="glass-card-premium action-pill-premium">
            <div className="action-icon-wrap" style={{ color: '#60a5fa' }}><Icon name="moon" size={24} /></div>
            <span className="action-label-premium">Sleep</span>
          </Link>
          <Link href="/dashboard/habits" className="glass-card-premium action-pill-premium">
            <div className="action-icon-wrap" style={{ color: '#4ade80' }}><Icon name="target" size={24} /></div>
            <span className="action-label-premium">Habits</span>
          </Link>
        </div>
      </section>

      {/* ═══ Weekly Snapshot ═══ */}
      <section className="glass-card-premium">
        <h3 className="widget-glass-title" style={{ marginBottom: '10px' }}><Icon name="chart" size={16} /> Weekly Summary</h3>
        <div className="weekly-snapshot-premium">
          <div className="ws-item-premium">
            <span className="ws-val-premium" style={{ color: '#FBFF00' }}>{weeklyCalories.toLocaleString()}</span>
            <span className="ws-label-premium">Fuel Burned</span>
          </div>
          <div className="ws-item-premium">
            <span className="ws-val-premium" style={{ color: '#60a5fa' }}>{todaySleep > 0 ? `${Math.floor(todaySleep)}h` : '–'}</span>
            <span className="ws-label-premium">Sleep Avg</span>
          </div>
          <div className="ws-item-premium">
            <span className="ws-val-premium" style={{ color: '#4ade80' }}>{Math.round(waterPercent)}%</span>
            <span className="ws-label-premium">Hydration</span>
          </div>
        </div>
      </section>

      {/* ═══ Meal Log ═══ */}
      <section className="meal-log-premium">
        <div className="meal-log-header">
          <h3 className="widget-glass-title"><Icon name="utensils" size={16} /> Daily Feed</h3>
          <Link href="/dashboard/scanner" className="glass-btn-premium glass-btn-primary-glow">
            <Icon name="plus" size={16} /> Add Custom
          </Link>
        </div>

        <div className="meal-grid-refined">
          {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((type) => {
            const mealIcon = type === 'breakfast' ? 'sunrise' as const : type === 'lunch' ? 'sun' as const : 'moon' as const;
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            const typeCals = meals[type].reduce((s, m) => s + m.calories, 0);
            return (
              <div
                key={type}
                className="glass-card-premium meal-slot-premium"
                onClick={() => setActiveMealForm(activeMealForm === type ? null : type)}
              >
                <div className="meal-slot-header">
                  <div className="meal-info-side">
                    <div className="meal-type-badge"><Icon name={mealIcon} size={20} /></div>
                    <div className="meal-name-group">
                      <h4>{label}</h4>
                      <div className="meal-stats-inline">{meals[type].length} items • {typeCals} kcal</div>
                    </div>
                  </div>
                  <Icon name="chevronRight" className="meal-expand-icon" size={18} />
                </div>

                {activeMealForm === type && (
                  <div className="meal-expand-content" onClick={e => e.stopPropagation()} style={{ marginTop: '20px' }}>
                    <div className="meal-form-liquid">
                      <input
                        className="glass-input"
                        placeholder="What was the dish?"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', color: '#fff' }}
                      />
                      <input
                        className="glass-input"
                        placeholder="kcal"
                        type="number"
                        value={mealCals}
                        onChange={(e) => setMealCals(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', color: '#fff', width: '100px' }}
                      />
                      <button className="glass-btn-premium glass-btn-primary-glow" onClick={() => addMeal(type)}>Log</button>
                    </div>
                    {meals[type].length > 0 && (
                      <div className="meal-entry-list" style={{ marginTop: '16px' }}>
                        {meals[type].map(m => (
                          <div key={m.id} className="meal-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '0.9rem' }}>{m.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{m.calories}</span>
                              <button onClick={() => removeMeal(type, m.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
