'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

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

export default function PlannerPage() {
    const [activeTab, setActiveTab] = useState<'diet' | 'workout'>('diet');
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
    const [expandedDay, setExpandedDay] = useState<number | null>(0);

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

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            if (type === 'diet') setDietPlan(data);
            else setWorkoutPlan(data);
            setExpandedDay(0);
        } catch {
            setError('Failed to generate plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planner-page">
            <div className="page-header">
                <h1>🧠 AI Planner</h1>
                <p className="page-subtitle">Personalized plans built around YOUR life, allergies, and goals.</p>
            </div>

            {/* Tab Switcher */}
            <div className="tab-bar glass-card-static">
                <button
                    className={`tab-btn ${activeTab === 'diet' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('diet')}
                >
                    🍽️ Diet Plan
                </button>
                <button
                    className={`tab-btn ${activeTab === 'workout' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('workout')}
                >
                    💪 Workout Plan
                </button>
            </div>

            {/* Generate Button */}
            <button
                className="glass-btn glass-btn-rainbow glass-btn-lg generate-btn"
                onClick={() => generatePlan(activeTab)}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
                        Generating your {activeTab} plan...
                    </>
                ) : (
                    `✨ Generate ${activeTab === 'diet' ? 'Diet' : 'Workout'} Plan`
                )}
            </button>

            {error && (
                <div style={{
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    color: 'var(--color-danger)',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Diet Plan Display */}
            {activeTab === 'diet' && dietPlan && (
                <div className="plan-display">
                    <div className="plan-header glass-card-static">
                        <h2>{dietPlan.plan_name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{dietPlan.description}</p>
                        <div className="badge badge-info" style={{ marginTop: '8px' }}>
                            🔥 {dietPlan.daily_calories} cal/day target
                        </div>
                    </div>

                    <div className="days-list">
                        {dietPlan.days.map((day, i) => (
                            <div key={day.day} className="glass-card-static day-card">
                                <button
                                    className="day-header"
                                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                                >
                                    <span className="day-name">{day.day}</span>
                                    <span className="day-expand">{expandedDay === i ? '▼' : '▶'}</span>
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
                                                    <span className="macro-protein">{meal.protein}g P</span>
                                                    <span className="macro-carbs">{meal.carbs}g C</span>
                                                    <span className="macro-fats">{meal.fats}g F</span>
                                                </div>
                                                {meal.ingredients && (
                                                    <div className="meal-ingredients">
                                                        {meal.ingredients.join(' · ')}
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

            {/* Workout Plan Display */}
            {activeTab === 'workout' && workoutPlan && (
                <div className="plan-display">
                    <div className="plan-header glass-card-static">
                        <h2>{workoutPlan.plan_name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{workoutPlan.description}</p>
                    </div>

                    <div className="days-list">
                        {workoutPlan.days.map((day, i) => (
                            <div key={day.day} className="glass-card-static day-card">
                                <button
                                    className="day-header"
                                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                                >
                                    <div>
                                        <span className="day-name">{day.day}</span>
                                        <span className="day-focus badge badge-info" style={{ marginLeft: '12px' }}>
                                            {day.focus}
                                        </span>
                                    </div>
                                    <span className="day-expand">{expandedDay === i ? '▼' : '▶'}</span>
                                </button>

                                {expandedDay === i && (
                                    <div className="day-content">
                                        {day.rest_note ? (
                                            <div className="rest-note">
                                                <span style={{ fontSize: '2rem' }}>🧘</span>
                                                <p>{day.rest_note}</p>
                                            </div>
                                        ) : (
                                            day.exercises.map((ex, j) => (
                                                <div key={j} className="exercise-card">
                                                    <div className="exercise-header">
                                                        <span className="exercise-name">{ex.name}</span>
                                                        <span className="exercise-detail">
                                                            {ex.duration_min
                                                                ? `${ex.duration_min} min`
                                                                : `${ex.sets} × ${ex.reps}`}
                                                        </span>
                                                    </div>
                                                    {ex.notes && (
                                                        <p className="exercise-notes">💡 {ex.notes}</p>
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
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

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
          transition: all var(--transition-smooth);
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

        .generate-btn {
          width: 100%;
        }

        .plan-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInUp 0.4s ease-out;
        }

        .plan-header {
          padding: 20px;
        }

        .plan-header h2 {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 4px;
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
          transition: background var(--transition-fast);
        }

        .day-header:hover {
          background: var(--glass-bg);
        }

        .day-name {
          font-weight: 700;
        }

        .day-expand {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .day-content {
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeInUp 0.3s ease-out;
        }

        .meal-card {
          padding: 14px 16px;
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
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .meal-cals {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .meal-name {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .meal-macros-row {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .meal-ingredients {
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .exercise-card {
          padding: 14px 16px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .exercise-name {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .exercise-detail {
          font-size: 0.85rem;
          color: #FBFF00;
          font-weight: 600;
        }

        .exercise-notes {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .rest-note {
          text-align: center;
          padding: 24px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
      `}</style>
        </div>
    );
}
