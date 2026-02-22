'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

/* ── Motivational Quotes ── */
const quotes = [
    "The only bad workout is the one that didn't happen. 💪",
    "Your body can stand almost anything. It's your mind you have to convince. 🧠",
    "Discipline is choosing between what you want now and what you want most. 🔥",
    "Strive for progress, not perfection. 🚀",
    "The pain you feel today is the strength you feel tomorrow. ⚡",
    "Don't stop when you're tired. Stop when you're done. 🏆",
    "Sweat is fat crying. 💧",
    "Champions aren't made in gyms — champions are made from something deep inside. 🥇",
];

/* ── Helpers ── */
function getStorageKey(prefix: string, date: Date) {
    return `gymbruh-${prefix}-${date.toISOString().split('T')[0]}`;
}

function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

export default function HomePage() {
    const today = new Date();

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

    const carouselDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + dateOffset - 3 + i);
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
            try {
                setMeals(JSON.parse(stored));
            } catch { /* ignore */ }
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

    return (
        <div className="home-page">
            {/* ═══ Motivational Banner ═══ */}
            <section className="banner glass-card-static">
                <div className="banner-icon">🏋️</div>
                <p className={`banner-quote ${quoteFade ? 'fade-in' : 'fade-out'}`}>
                    {quotes[quoteIdx]}
                </p>
                <div className="banner-dots">
                    {quotes.map((_, i) => (
                        <span key={i} className={`dot ${i === quoteIdx ? 'dot-active' : ''}`} />
                    ))}
                </div>
            </section>

            {/* ═══ Date Carousel ═══ */}
            <section className="date-carousel">
                <button className="carousel-arrow" onClick={() => setDateOffset((o) => o - 7)} aria-label="Previous week">‹</button>
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
                <button className="carousel-arrow" onClick={() => setDateOffset((o) => o + 7)} aria-label="Next week">›</button>
            </section>

            {/* ═══ Water & Calories Row ═══ */}
            <div className="row-2col">
                {/* Water Log */}
                <section className="glass-card-static widget-home water-section">
                    <h3 className="section-title">💧 Water Intake</h3>
                    <div className="water-display">
                        <div className="water-ring-wrap">
                            <svg viewBox="0 0 100 100" className="water-ring">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="42" fill="none"
                                    stroke="url(#waterGrad)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${Math.min((waterGlasses / waterTarget) * 264, 264)} 264`}
                                    transform="rotate(-90 50 50)"
                                    style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
                                />
                                <defs>
                                    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="water-ring-text">
                                <span className="water-count">{waterGlasses}</span>
                                <span className="water-unit">/ {waterTarget}</span>
                            </div>
                        </div>
                        <span className="water-label">glasses</span>
                    </div>
                    <div className="water-actions">
                        <button className="glass-btn glass-btn-sm water-btn" onClick={() => updateWater(1)}>+ 1 Glass</button>
                        <button className="glass-btn glass-btn-sm water-btn water-btn-big" onClick={() => updateWater(16)}>+ 1 Gallon</button>
                        <button className="glass-btn glass-btn-sm glass-btn-danger water-btn" onClick={() => { setWaterGlasses(0); localStorage.setItem(getStorageKey('water', today), '0'); }}>Reset</button>
                    </div>
                </section>

                {/* Calorie Summary */}
                <section className="glass-card-static widget-home cal-section">
                    <h3 className="section-title">🔥 Daily Calories</h3>
                    <div className="cal-ring-wrap">
                        <svg viewBox="0 0 100 100" className="cal-ring">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke="url(#calGrad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.min((totalCalories / calorieTarget) * 264, 264)} 264`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
                            />
                            <defs>
                                <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#FBFF00" />
                                    <stop offset="100%" stopColor="#e6eb00" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="cal-ring-text">
                            <span className="cal-value">{totalCalories}</span>
                            <span className="cal-target">/ {calorieTarget}</span>
                        </div>
                    </div>
                    <div className="cal-metrics">
                        <div className="cal-metric">
                            <span className="cal-metric-val" style={{ color: '#60a5fa' }}>{meals.breakfast.length + meals.lunch.length + meals.dinner.length}</span>
                            <span className="cal-metric-label">Meals</span>
                        </div>
                        <div className="cal-metric">
                            <span className="cal-metric-val" style={{ color: '#4ade80' }}>{calorieTarget - totalCalories > 0 ? calorieTarget - totalCalories : 0}</span>
                            <span className="cal-metric-label">Remaining</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ═══ Meal Log ═══ */}
            <section className="meal-log-section">
                <div className="meal-log-header">
                    <h3 className="section-title">🍽️ Meal Log</h3>
                    <Link href="/dashboard/scanner" className="glass-btn glass-btn-sm glass-btn-primary scan-btn">
                        📸 Scan Food
                    </Link>
                </div>

                <div className="meal-slots">
                    {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((type) => {
                        const icon = type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : '🌙';
                        const label = type.charAt(0).toUpperCase() + type.slice(1);
                        return (
                            <div key={type} className="glass-card-static meal-slot">
                                <div className="meal-slot-header">
                                    <div className="meal-slot-title">
                                        <span className="meal-slot-icon">{icon}</span>
                                        <span>{label}</span>
                                    </div>
                                    <button
                                        className="add-meal-btn"
                                        onClick={() => {
                                            setActiveMealForm(activeMealForm === type ? null : type);
                                            setMealName('');
                                            setMealCals('');
                                        }}
                                    >
                                        {activeMealForm === type ? '✕' : '+'}
                                    </button>
                                </div>

                                {/* Inline Add Form */}
                                {activeMealForm === type && (
                                    <div className="meal-form animate-fade-in-up">
                                        <input
                                            className="glass-input meal-input"
                                            placeholder="Food name"
                                            value={mealName}
                                            onChange={(e) => setMealName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addMeal(type)}
                                            autoFocus
                                        />
                                        <input
                                            className="glass-input meal-input"
                                            placeholder="Calories"
                                            type="number"
                                            value={mealCals}
                                            onChange={(e) => setMealCals(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addMeal(type)}
                                        />
                                        <button className="glass-btn glass-btn-sm glass-btn-primary" onClick={() => addMeal(type)}>
                                            Add
                                        </button>
                                    </div>
                                )}

                                {/* Logged Meals */}
                                {meals[type].length > 0 ? (
                                    <div className="meal-entries">
                                        {meals[type].map((m) => (
                                            <div key={m.id} className="meal-entry">
                                                <span className="meal-entry-name">{m.name}</span>
                                                <div className="meal-entry-right">
                                                    <span className="meal-entry-cal">{m.calories} cal</span>
                                                    <button className="meal-entry-del" onClick={() => removeMeal(type, m.id)}>×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !activeMealForm && (
                                        <p className="meal-empty">No meals logged yet</p>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <style jsx>{`
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeInUp 0.5s ease-out;
        }

        /* ── Banner ── */
        .banner {
          padding: 32px 28px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(251,255,0,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .banner-icon {
          font-size: 2.4rem;
          margin-bottom: 14px;
        }
        .banner-quote {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.5;
          color: var(--text-primary);
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.4s ease;
        }
        .fade-in { opacity: 1; }
        .fade-out { opacity: 0; }
        .banner-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 18px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }
        .dot-active {
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
          width: 18px;
          border-radius: 3px;
        }

        /* ── Date Carousel ── */
        .date-carousel {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .carousel-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          font-family: var(--font-family);
        }
        .carousel-arrow:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          color: var(--text-primary);
        }
        .carousel-dates {
          display: flex;
          gap: 6px;
          flex: 1;
          justify-content: center;
          overflow: hidden;
        }
        .date-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          background: var(--glass-bg);
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          max-width: 72px;
          font-family: var(--font-family);
          color: var(--text-muted);
        }
        .date-chip:hover {
          background: var(--glass-bg-hover);
          color: var(--text-primary);
        }
        .date-today {
          border-color: var(--accent-border);
          background: var(--accent-bg);
          color: var(--accent) !important;
        }
        .date-selected {
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow-subtle);
        }
        .date-weekday {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .date-day {
          font-size: 1.15rem;
          font-weight: 800;
        }

        /* ── Two-Column Row ── */
        .row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .widget-home {
          padding: 24px;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #d4d4d8;
          letter-spacing: 0.02em;
          margin-bottom: 18px;
        }

        /* ── Water Section ── */
        .water-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 18px;
        }
        .water-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .water-ring {
          width: 100%;
          height: 100%;
        }
        .water-ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          display: flex;
          flex-direction: column;
        }
        .water-count {
          font-size: 1.8rem;
          font-weight: 800;
          color: #60a5fa;
          line-height: 1;
        }
        .water-unit {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .water-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 4px;
        }
        .water-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .water-btn {
          font-size: 0.8rem !important;
          padding: 8px 14px !important;
        }
        .water-btn-big {
          background: rgba(96,165,250,0.15) !important;
          color: #60a5fa !important;
          border-color: rgba(96,165,250,0.3) !important;
        }
        .water-btn-big:hover {
          background: rgba(96,165,250,0.25) !important;
        }

        /* ── Calorie Summary ── */
        .cal-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 18px;
        }
        .cal-ring {
          width: 100%;
          height: 100%;
        }
        .cal-ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          display: flex;
          flex-direction: column;
        }
        .cal-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }
        .cal-target {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .cal-metrics {
          display: flex;
          justify-content: center;
          gap: 32px;
        }
        .cal-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .cal-metric-val {
          font-size: 1.2rem;
          font-weight: 800;
        }
        .cal-metric-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* ── Meal Log ── */
        .meal-log-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .meal-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .meal-log-header .section-title {
          margin-bottom: 0;
        }
        .scan-btn {
          font-size: 0.8rem !important;
          padding: 8px 16px !important;
        }
        .meal-slots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .meal-slot {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .meal-slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .meal-slot-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .meal-slot-icon {
          font-size: 1.3rem;
        }
        .add-meal-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
        }
        .add-meal-btn:hover {
          background: var(--accent-bg);
          border-color: var(--accent-border);
          color: var(--accent);
        }


        /* Meal Form */
        .meal-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meal-input {
          padding: 10px 12px !important;
          font-size: 0.85rem !important;
        }

        /* Meal Entries */
        .meal-entries {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .meal-entry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-xs);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .meal-entry-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .meal-entry-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .meal-entry-cal {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
        }
        .meal-entry-del {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(248,113,113,0.1);
          color: #f87171;
          border-radius: 50%;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
        }
        .meal-entry-del:hover {
          background: rgba(248,113,113,0.25);
        }
        .meal-empty {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
          padding: 10px 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .meal-slots {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .row-2col {
            grid-template-columns: 1fr;
          }
          .meal-slots {
            grid-template-columns: 1fr;
          }
          .banner-quote {
            font-size: 1rem;
          }
          .date-chip {
            padding: 8px 8px;
          }
        }
      `}</style>
        </div>
    );
}
