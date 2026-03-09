'use client';

import { useState, useEffect, useMemo } from 'react';
import './settings.css';
import Icon from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';
import { initUserId, userKey } from '@/lib/user-storage';

type Badge = {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    description: string;
};

const BADGE_DEFS = [
    { id: '1', name: 'Early Riser', icon: 'zap', description: 'Log a workout before 6 AM' },
    { id: '2', name: 'Hydration Hero', icon: 'droplets', description: 'Hit water goal 7 days in a row' },
    { id: '3', name: 'Food Sniper', icon: 'camera', description: 'Scan 50 meals' },
    { id: '4', name: 'Sleep King', icon: 'moon', description: 'Get 8+ hours for a full month' },
    { id: '5', name: 'Pro Booker', icon: 'users', description: 'Book 3 nutritionist consultations' },
    { id: '6', name: 'Iron Will', icon: 'activity', description: 'Complete an advanced workout plan' },
];

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        name: 'Guest User',
        email: 'guest@gymbruh.ai',
        bio: 'Fitness enthusiast'
    });

    const [notifs, setNotifs] = useState({
        workouts: true,
        nutrition: true,
        achievements: true,
        progress: false
    });

    const [prefs, setPrefs] = useState({
        units: 'metric',
        waterGoal: 2500,
        sleepGoal: 8,
        theme: 'dark'
    });

    const [badges, setBadges] = useState<Badge[]>(
        BADGE_DEFS.map(b => ({ ...b, unlocked: false }))
    );

    const [isSaving, setIsSaving] = useState(false);
    const [ready, setReady] = useState(false);

    /* ── Load user profile and compute badges ── */
    useEffect(() => {
        initUserId().then(async () => {
            // Load profile
            const isGuest = document.cookie.includes('gymbruh-guest=true');
            if (isGuest) {
                const stored = localStorage.getItem('gymbruh-guest-profile');
                if (stored) {
                    try {
                        const p = JSON.parse(stored);
                        setProfile({ name: p.name || 'Guest User', email: 'guest@gymbruh.ai', bio: 'Fitness enthusiast' });
                    } catch { /* ignore */ }
                }
            } else {
                try {
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                        if (data) {
                            setProfile({
                                name: data.name || user.email?.split('@')[0] || 'User',
                                email: user.email || '',
                                bio: data.bio || 'Fitness enthusiast'
                            });
                        }
                    }
                } catch { /* ignore */ }
            }

            // Compute badges dynamically from user data
            const computed = BADGE_DEFS.map(b => {
                let unlocked = false;
                try {
                    if (b.id === '2') {
                        // Hydration Hero: 7 consecutive days with water >= 8
                        let streak = 0;
                        for (let i = 0; i < 30 && streak < 7; i++) {
                            const d = new Date(); d.setDate(d.getDate() - i);
                            const key = userKey(`water-${d.toISOString().split('T')[0]}`);
                            const val = parseInt(localStorage.getItem(key) || '0', 10);
                            if (val >= 8) streak++;
                            else streak = 0;
                        }
                        unlocked = streak >= 7;
                    } else if (b.id === '3') {
                        // Food Sniper: 50+ scans
                        const hist = localStorage.getItem(userKey('scan-history'));
                        if (hist) {
                            const arr = JSON.parse(hist);
                            unlocked = Array.isArray(arr) && arr.length >= 50;
                        }
                    } else if (b.id === '4') {
                        // Sleep King: 30 consecutive days >= 8h
                        let streak = 0;
                        for (let i = 0; i < 60 && streak < 30; i++) {
                            const d = new Date(); d.setDate(d.getDate() - i);
                            const key = userKey(`sleep-${d.toISOString().split('T')[0]}`);
                            const val = parseFloat(localStorage.getItem(key) || '0');
                            if (val >= 8) streak++;
                            else streak = 0;
                        }
                        unlocked = streak >= 30;
                    }
                    // id 1 (Early Riser), 5 (Pro Booker), 6 (Iron Will) remain locked — no tracking yet
                } catch { /* ignore */ }
                return { ...b, unlocked };
            });
            setBadges(computed);
            setReady(true);
        });
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h1 className="settings-title">Control Hub</h1>
                <p className="text-secondary">Manage your profile, preferences, and performance.</p>
            </header>

            {/* ── Profile Section ── */}
            <section className="settings-section">
                <div className="section-head">
                    <Icon name="user" size={20} style={{ color: 'var(--settings-accent)' }} />
                    <h2>User Profile</h2>
                </div>
                <div className="profile-grid">
                    <div className="avatar-upload">
                        <Icon name="user" size={48} />
                    </div>
                    <div className="profile-inputs">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-premium" onClick={handleSave}>
                        {isSaving ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </section>

            {/* ── Notifications ── */}
            <section className="settings-section">
                <div className="section-head">
                    <Icon name="bell" size={20} style={{ color: 'var(--settings-accent)' }} />
                    <h2>Notification Preferences</h2>
                </div>
                <div className="settings-list">
                    <div className="settings-item">
                        <div className="item-info">
                            <h4>Workout Reminders</h4>
                            <p>Get notified when it's time for your session</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={notifs.workouts} onChange={() => setNotifs({ ...notifs, workouts: !notifs.workouts })} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="settings-item">
                        <div className="item-info">
                            <h4>Daily Nutrition Tips</h4>
                            <p>Receive bite-sized advice from our pros</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={notifs.nutrition} onChange={() => setNotifs({ ...notifs, nutrition: !notifs.nutrition })} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="settings-item">
                        <div className="item-info">
                            <h4>Achievement Alerts</h4>
                            <p>Celebrate every new badge unlocked</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={notifs.achievements} onChange={() => setNotifs({ ...notifs, achievements: !notifs.achievements })} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </section>

            {/* ── Achievements ── */}
            <section className="settings-section">
                <div className="section-head" style={{ marginBottom: '10px' }}>
                    <Icon name="award" size={20} style={{ color: 'var(--settings-accent)' }} />
                    <h2>Hall of Achievements</h2>
                </div>
                <p className="text-secondary" style={{ marginBottom: '25px' }}>Unlocked {badges.filter(b => b.unlocked).length} / {badges.length} badges</p>
                <div className="achievements-grid">
                    {badges.map(badge => (
                        <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : ''}`}>
                            <div className="badge-icon">
                                <Icon name={badge.icon as any} size={24} />
                            </div>
                            <h5>{badge.name}</h5>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── App Preferences ── */}
            <section className="settings-section">
                <div className="section-head">
                    <Icon name="settings" size={20} style={{ color: 'var(--settings-accent)' }} />
                    <h2>App Preferences</h2>
                </div>
                <div className="prefs-grid">
                    <div className="input-group">
                        <label>Unit System</label>
                        <select
                            className="input-group-select"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                color: '#fff'
                            }}
                            value={prefs.units}
                            onChange={(e) => setPrefs({ ...prefs, units: e.target.value })}
                        >
                            <option value="metric">Metric (kg, cm)</option>
                            <option value="imperial">Imperial (lbs, in)</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Daily Water Goal (ml)</label>
                        <input
                            type="number"
                            value={prefs.waterGoal}
                            onChange={(e) => setPrefs({ ...prefs, waterGoal: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </section>

            {/* ── Privacy & Data ── */}
            <section className="settings-section" style={{ background: 'rgba(255, 50, 50, 0.02)' }}>
                <div className="section-head">
                    <Icon name="shield" size={20} style={{ color: '#ff4d4d' }} />
                    <h2 style={{ color: '#ff4d4d' }}>Privacy & Data</h2>
                </div>
                <div className="settings-list">
                    <div className="settings-item">
                        <div className="item-info">
                            <h4>Export My Data</h4>
                            <p>Download a JSON file of your entire history</p>
                        </div>
                        <button className="btn-danger-outline" onClick={() => alert('Data export started...')}>Export</button>
                    </div>
                    <div className="settings-item">
                        <div className="item-info">
                            <h4>Reset All Progress</h4>
                            <p>Permanently delete all logs and start fresh</p>
                        </div>
                        <button className="btn-danger-outline" style={{ background: 'rgba(255, 77, 77, 0.1)' }}>Reset</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
