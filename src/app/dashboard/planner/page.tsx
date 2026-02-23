'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/ui/Icons';

interface Meal {
    type: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
}

interface DietDay {
    day: string;
    meals: Meal[];
}

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    duration_min: number | null;
    notes: string | null;
}

interface WorkoutDay {
    day: string;
    focus: string;
    exercises: Exercise[];
    rest_note: string | null;
}

interface DietPlan {
    plan_name: string;
    daily_calories: number;
    description: string;
    days: DietDay[];
}

interface WorkoutPlan {
    plan_name: string;
    description: string;
    days: WorkoutDay[];
}

/* ── Feature cards for empty state ── */
const dietFeatures = [
    { icon: 'target' as const, title: 'Calorie-Optimized', desc: 'Matched to your exact goals and body stats' },
    { icon: 'leaf' as const, title: 'Diet Aware', desc: 'Respects vegan, keto, paleo, and more' },
    { icon: 'warning' as const, title: 'Allergy Safe', desc: 'Strictly avoids your listed allergens' },
    { icon: 'sparkles' as const, title: 'AI Personalized', desc: 'Learns from your preferences and vibe' },
];

const workoutFeatures = [
    { icon: 'muscle' as const, title: 'Goal-Driven', desc: 'Exercises chosen for your specific goal' },
    { icon: 'bandage' as const, title: 'Injury Aware', desc: 'Avoids movements that could aggravate injuries' },
    { icon: 'lightning' as const, title: 'Progressive', desc: 'Balanced intensity across the week' },
    { icon: 'brain' as const, title: 'Smart Recovery', desc: 'Strategic rest days for optimal gains' },
];

const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your plan is loading. Your results are coming.",
    "Consistency beats perfection, every single time.",
    "A goal without a plan is just a wish.",
    "Small daily improvements lead to stunning results.",
];

export default function PlannerPage() {
    const [activeTab, setActiveTab] = useState<'diet' | 'workout'>('diet');
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
    const [expandedDay, setExpandedDay] = useState<number | null>(0);
    const [quoteIdx, setQuoteIdx] = useState(0);
    const [quoteFade, setQuoteFade] = useState(true);
    const [generationCount, setGenerationCount] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('gymbruh-plan-count');
        if (stored) setGenerationCount(parseInt(stored, 10));
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const isGuest = document.cookie.includes('gymbruh-guest=true');

            if (isGuest) {
                const stored = localStorage.getItem('gymbruh-guest-profile');
                if (stored) setProfile(JSON.parse(stored));
                else setProfile({ name: 'Guest', goal: 'general_fitness', vibe: 'chill' });
                return;
            }

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (data) setProfile(data);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
            }
        };
        fetchProfile();
    }, []);

    /* ── Quote rotation ── */
    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteFade(false);
            setTimeout(() => {
                setQuoteIdx(i => (i + 1) % motivationalQuotes.length);
                setQuoteFade(true);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const generatePlan = async (type: 'diet' | 'workout') => {
        if (!profile) {
            setError('Please complete onboarding first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, planType: type }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (type === 'diet') setDietPlan(data);
            else setWorkoutPlan(data);
            setExpandedDay(0);

            // Track generation count
            const newCount = generationCount + 1;
            setGenerationCount(newCount);
            localStorage.setItem('gymbruh-plan-count', String(newCount));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadingMessages = [
        "Consulting the fitness gods...",
        "Crunching your macros...",
        "Designating rest days...",
        "Synthesizing protein...",
        "Calibrating weights...",
        "Analyzing your vibe...",
        "Building your perfect week...",
        "Optimizing nutrient timing...",
    ];
    const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        if (loading) {
            setLoadingProgress(0);
            const msgInterval = setInterval(() => {
                setLoadingMsg(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
            }, 2500);
            const progressInterval = setInterval(() => {
                setLoadingProgress(p => Math.min(p + Math.random() * 8, 90));
            }, 600);
            return () => { clearInterval(msgInterval); clearInterval(progressInterval); };
        } else {
            setLoadingProgress(0);
        }
    }, [loading]);

    const currentPlan = activeTab === 'diet' ? dietPlan : workoutPlan;
    const features = activeTab === 'diet' ? dietFeatures : workoutFeatures;

    const getProfileSummary = () => {
        if (!profile) return null;
        const parts: string[] = [];
        if (profile.goal) parts.push(String(profile.goal).replace(/_/g, ' '));
        if (profile.diet_preference) parts.push(String(profile.diet_preference));
        if (profile.activity_level) parts.push(`activity ${profile.activity_level}/5`);
        if (profile.vibe) parts.push(`${profile.vibe} vibe`);
        return parts;
    };

    return (
        <div className="planner-page">
            <div className="page-header">
                <h1><Icon name="brain" size={24} /> AI Planner</h1>
                <p className="page-subtitle">Personalized plans built around YOUR life, allergies, and goals.</p>
            </div>

            {/* ── Profile Snapshot ── */}
            {profile && !currentPlan && !loading && (
                <div className="glass-card-static profile-snapshot">
                    <div className="profile-snapshot-header">
                        <div className="profile-avatar">
                            <Icon name="runner" size={24} />
                        </div>
                        <div>
                            <span className="profile-name">{String(profile.name || 'User')}</span>
                            <span className="profile-hint">AI will personalize for you</span>
                        </div>
                    </div>
                    {getProfileSummary() && (
                        <div className="profile-tags">
                            {getProfileSummary()!.map((tag, i) => (
                                <span key={i} className="profile-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Switcher */}
            <div className="tab-bar glass-card-static">
                <button
                    className={`tab-btn ${activeTab === 'diet' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('diet')}
                >
                    <Icon name="utensils" size={16} /> Diet Plan
                </button>
                <button
                    className={`tab-btn ${activeTab === 'workout' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('workout')}
                >
                    <Icon name="muscle" size={16} /> Workout Plan
                </button>
            </div>

            {/* Generate Button */}
            <button
                className="glass-btn glass-btn-rainbow glass-btn-lg generate-btn"
                onClick={() => generatePlan(activeTab)}
                disabled={loading}
            >
                {loading ? (
                    <div className="loading-content">
                        <div className="loading-bar">
                            <div className="loading-fill" style={{ width: `${loadingProgress}%` }} />
                        </div>
                        <span className="loading-msg">{loadingMsg}</span>
                    </div>
                ) : (
                    <>
                        <Icon name="sparkles" size={16} />
                        {currentPlan ? 'Regenerate' : 'Generate'} {activeTab === 'diet' ? 'Diet' : 'Workout'} Plan
                    </>
                )}
            </button>

            {error && (
                <div className="error-card">
                    <Icon name="warning" size={16} /> {error}
                </div>
            )}

            {/* ═══ Empty State: Feature Cards ═══ */}
            {!currentPlan && !loading && (
                <>
                    <div className="features-section">
                        <h3 className="section-title">
                            What the AI considers for your {activeTab === 'diet' ? 'diet' : 'workout'}
                        </h3>
                        <div className="features-grid">
                            {features.map((f, i) => (
                                <div key={i} className="glass-card-static feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="feature-icon"><Icon name={f.icon} size={22} /></div>
                                    <h4>{f.title}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="glass-card-static quote-card">
                        <div className="quote-accent" />
                        <p className={`quote-text ${quoteFade ? 'q-in' : 'q-out'}`}>
                            &ldquo;{motivationalQuotes[quoteIdx]}&rdquo;
                        </p>
                    </div>

                    {/* Stats */}
                    {generationCount > 0 && (
                        <div className="gen-stats">
                            <Icon name="chart" size={14} />
                            <span>You&apos;ve generated <strong>{generationCount}</strong> plan{generationCount !== 1 ? 's' : ''} so far</span>
                        </div>
                    )}
                </>
            )}

            {/* ═══ Diet Plan Display ═══ */}
            {activeTab === 'diet' && dietPlan && (
                <div className="plan-display">
                    <div className="plan-header glass-card-static">
                        <div className="plan-header-top">
                            <h2>{dietPlan.plan_name}</h2>
                            <div className="badge badge-info">
                                <Icon name="fire" size={14} /> {dietPlan.daily_calories} cal/day
                            </div>
                        </div>
                        <p className="plan-desc">{dietPlan.description}</p>
                    </div>

                    <div className="days-list">
                        {dietPlan.days.map((day, i) => (
                            <div key={day.day} className="glass-card-static day-card">
                                <button
                                    className="day-header"
                                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                                >
                                    <div className="day-header-left">
                                        <span className="day-number">{i + 1}</span>
                                        <span className="day-name">{day.day}</span>
                                    </div>
                                    <span className={`day-chevron ${expandedDay === i ? 'day-chevron-open' : ''}`}>
                                        <Icon name="trendUp" size={14} />
                                    </span>
                                </button>

                                {expandedDay === i && (
                                    <div className="day-content">
                                        {day.meals.map((meal, j) => (
                                            <div key={j} className="meal-card">
                                                <div className="meal-header">
                                                    <span className="meal-type">{meal.type}</span>
                                                    <span className="meal-cals macro-calories">{meal.calories} cal</span>
                                                </div>
                                                <h4 className="meal-name">{meal.name}</h4>
                                                <div className="meal-macros-row">
                                                    <span className="macro-pill macro-protein">{meal.protein}g P</span>
                                                    <span className="macro-pill macro-carbs">{meal.carbs}g C</span>
                                                    <span className="macro-pill macro-fats">{meal.fats}g F</span>
                                                </div>
                                                {meal.ingredients && (
                                                    <div className="meal-ingredients">
                                                        {meal.ingredients.map((ing, k) => (
                                                            <span key={k} className="ingredient-chip">{ing}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Workout Plan Display ═══ */}
            {activeTab === 'workout' && workoutPlan && (
                <div className="plan-display">
                    <div className="plan-header glass-card-static">
                        <h2>{workoutPlan.plan_name}</h2>
                        <p className="plan-desc">{workoutPlan.description}</p>
                    </div>

                    <div className="days-list">
                        {workoutPlan.days.map((day, i) => (
                            <div key={day.day} className="glass-card-static day-card">
                                <button
                                    className="day-header"
                                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                                >
                                    <div className="day-header-left">
                                        <span className="day-number">{i + 1}</span>
                                        <span className="day-name">{day.day}</span>
                                        <span className="day-focus badge badge-info">{day.focus}</span>
                                    </div>
                                    <span className={`day-chevron ${expandedDay === i ? 'day-chevron-open' : ''}`}>
                                        <Icon name="trendUp" size={14} />
                                    </span>
                                </button>

                                {expandedDay === i && (
                                    <div className="day-content">
                                        {day.rest_note ? (
                                            <div className="rest-note">
                                                <div className="rest-icon"><Icon name="flexibility" size={32} /></div>
                                                <p className="rest-title">Rest & Recovery</p>
                                                <p className="rest-text">{day.rest_note}</p>
                                            </div>
                                        ) : (
                                            day.exercises.map((ex, j) => (
                                                <div key={j} className="exercise-card">
                                                    <div className="exercise-header">
                                                        <div className="exercise-left">
                                                            <span className="exercise-num">{j + 1}</span>
                                                            <span className="exercise-name">{ex.name}</span>
                                                        </div>
                                                        <span className="exercise-detail">
                                                            {ex.duration_min
                                                                ? `${ex.duration_min} min`
                                                                : `${ex.sets} × ${ex.reps}`}
                                                        </span>
                                                    </div>
                                                    {ex.notes && (
                                                        <p className="exercise-notes"><Icon name="lightbulb" size={14} /> {ex.notes}</p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
        .planner-page {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeInUp 0.5s ease-out;
        }

        .page-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        /* ── Profile Snapshot ── */
        .profile-snapshot {
          padding: 18px 20px;
        }

        .profile-snapshot-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(251, 255, 0, 0.15), rgba(74, 222, 128, 0.15));
          border: 2px solid rgba(251, 255, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FBFF00;
        }

        .profile-name {
          display: block;
          font-weight: 700;
          font-size: 1.05rem;
        }

        .profile-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .profile-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .profile-tag {
          padding: 5px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        /* ── Tabs ── */
        .tab-bar {
          display: flex;
          padding: 6px;
          gap: 4px;
        }

        .tab-btn {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .tab-active {
          color: var(--text-primary);
          background: var(--glass-bg-active);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        /* ── Generate ── */
        .generate-btn {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .loading-bar {
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .loading-fill {
          height: 100%;
          background: linear-gradient(90deg, #FBFF00, #4ade80);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .loading-msg {
          font-size: 0.85rem;
          animation: fadeInUp 0.3s ease;
        }

        .error-card {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          color: var(--color-danger);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Features Grid ── */
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 14px;
          color: var(--text-secondary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .feature-card {
          padding: 20px 18px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease both;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--glass-border-hover);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(251, 255, 0, 0.1);
          border: 1px solid rgba(251, 255, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FBFF00;
          margin-bottom: 12px;
        }

        .feature-card h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .feature-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* ── Quote ── */
        .quote-card {
          padding: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .quote-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FBFF00, transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .quote-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-style: italic;
          transition: all 0.3s ease;
        }

        .q-in { opacity: 1; transform: translateY(0); }
        .q-out { opacity: 0; transform: translateY(-6px); }

        /* ── Gen Stats ── */
        .gen-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 10px;
        }

        .gen-stats strong {
          color: #FBFF00;
        }

        /* ── Plan Display ── */
        .plan-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInUp 0.4s ease-out;
        }

        .plan-header {
          padding: 24px;
        }

        .plan-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 8px;
        }

        .plan-header h2 {
          font-size: 1.3rem;
          font-weight: 800;
        }

        .plan-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .days-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .day-card {
          overflow: hidden;
        }

        .day-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .day-header:hover {
          background: var(--glass-bg);
        }

        .day-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .day-number {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(251, 255, 0, 0.1);
          border: 1px solid rgba(251, 255, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: #FBFF00;
        }

        .day-name {
          font-weight: 700;
        }

        .day-focus {
          font-size: 0.75rem !important;
        }

        .day-chevron {
          color: var(--text-muted);
          transition: transform 0.3s ease;
          transform: rotate(90deg);
        }

        .day-chevron-open {
          transform: rotate(180deg);
        }

        .day-content {
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeInUp 0.3s ease-out;
        }

        .meal-card {
          padding: 16px 18px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .meal-type {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }

        .meal-cals {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .meal-name {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .meal-macros-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .macro-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
        }

        .meal-ingredients {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ingredient-chip {
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .exercise-card {
          padding: 16px 18px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .exercise-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .exercise-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .exercise-name {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .exercise-detail {
          font-size: 0.85rem;
          color: #FBFF00;
          font-weight: 700;
          padding: 4px 12px;
          background: rgba(251, 255, 0, 0.08);
          border-radius: 12px;
        }

        .exercise-notes {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rest-note {
          text-align: center;
          padding: 30px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .rest-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ade80;
          margin-bottom: 4px;
        }

        .rest-title {
          font-weight: 700;
          font-size: 1rem;
          color: #4ade80;
        }

        .rest-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 300px;
          line-height: 1.5;
        }

        @media (max-width: 500px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
