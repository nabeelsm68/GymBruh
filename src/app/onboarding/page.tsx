'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icons';

const stepIcons = ['wave', 'clipboard', 'target', 'runner', 'utensils', 'stethoscope', 'moon', 'masks'] as const;

const steps = [
  { id: 'welcome', title: 'Vibe Check', subtitle: 'Let\'s get to know you — the REAL you.' },
  { id: 'basics', title: 'The Basics', subtitle: 'Quick stats so we can personalize everything.' },
  { id: 'goals', title: 'Your Goal', subtitle: 'What\'s the dream? Pick your vibe.' },
  { id: 'activity', title: 'Activity Level', subtitle: 'How much do you already move?' },
  { id: 'diet', title: 'Food Preferences', subtitle: 'Tell us what you eat (and what you DON\'T).' },
  { id: 'health', title: 'Health Intel', subtitle: 'Any allergies, injuries, or conditions we should know?' },
  { id: 'lifestyle', title: 'Lifestyle', subtitle: 'Sleep, stress, hydration — the underrated stuff.' },
  { id: 'personality', title: 'Your Vibe', subtitle: 'Should we be your strict coach or your chill buddy?' },
];

const goalOptions = [
  { value: 'lose_weight', icon: 'fire' as const, label: 'Lose Weight', desc: 'Burn fat, feel lighter' },
  { value: 'build_muscle', icon: 'muscle' as const, label: 'Build Muscle', desc: 'Get stronger & bigger' },
  { value: 'maintain', icon: 'scale' as const, label: 'Maintain', desc: 'Stay where I am' },
  { value: 'general_fitness', icon: 'trophy' as const, label: 'General Fitness', desc: 'Just be healthy & fit' },
  { value: 'endurance', icon: 'runner' as const, label: 'Endurance', desc: 'Run farther, last longer' },
  { value: 'flexibility', icon: 'flexibility' as const, label: 'Flexibility', desc: 'Stretch & recover better' },
];

const activityLevels = [
  { value: 1, icon: 'couch' as const, label: 'Couch Potato', desc: 'Desk job, minimal movement' },
  { value: 2, icon: 'walk' as const, label: 'Casual Walker', desc: 'Light activity 1-2x/week' },
  { value: 3, icon: 'dumbbell' as const, label: 'Moderately Active', desc: '3-4 workouts/week' },
  { value: 4, icon: 'lightning' as const, label: 'Very Active', desc: '5-6 intense sessions/week' },
  { value: 5, icon: 'fire' as const, label: 'Athlete Level', desc: 'Daily intense training' },
];

const dietOptions = [
  { value: 'no_preference', icon: 'fork' as const, label: 'No Preference', color: '#4ECDC4' },
  { value: 'vegetarian', icon: 'leafy' as const, label: 'Vegetarian', color: '#48BB78' },
  { value: 'vegan', icon: 'plant' as const, label: 'Vegan', color: '#38A169' },
  { value: 'non_veg', icon: 'meat' as const, label: 'Non-Veg', color: '#FF6B6B' },
  { value: 'keto', icon: 'avocado' as const, label: 'Keto', color: '#FFC857' },
  { value: 'paleo', icon: 'bone' as const, label: 'Paleo', color: '#FF8E53' },
  { value: 'mediterranean', icon: 'olive' as const, label: 'Mediterranean', color: '#45B7D1' },
];

const allergyItems = [
  { icon: 'peanut' as const, label: 'Peanuts' },
  { icon: 'nut' as const, label: 'Tree Nuts' },
  { icon: 'milk' as const, label: 'Dairy' },
  { icon: 'wheat' as const, label: 'Gluten' },
  { icon: 'egg' as const, label: 'Eggs' },
  { icon: 'fish' as const, label: 'Fish' },
  { icon: 'shrimp' as const, label: 'Shellfish' },
  { icon: 'bean' as const, label: 'Soy' },
  { icon: 'honey' as const, label: 'Sesame' },
  { icon: 'corn' as const, label: 'Corn' },
];

const vibeOptions = [
  { value: 'strict', iconKey: 'medal' as const, label: 'Drill Sergeant', desc: 'No excuses. Push me hard.' },
  { value: 'balanced', iconKey: 'handshake' as const, label: 'Balanced Coach', desc: 'Firm but fair. Keep me accountable.' },
  { value: 'chill', iconKey: 'sunglasses' as const, label: 'Chill Buddy', desc: 'Laid back. Celebrate small wins.' },
  { value: 'hype', iconKey: 'fire' as const, label: 'Hype Beast', desc: 'All energy! Every rep is a victory!' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    goal: '',
    activity_level: 3,
    diet_preference: '',
    allergies: [] as string[],
    injuries: '',
    medical_conditions: '',
    sleep_hours: '7',
    stress_level: 'moderate',
    water_intake: 'moderate',
    vibe: 'balanced',
  });

  const updateField = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllergy = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const nextStep = () => {
    setDirection(1);
    if (step < steps.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    setDirection(-1);
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const profileData = {
      name: formData.name,
      age: parseInt(formData.age) || null,
      gender: formData.gender,
      height_cm: parseFloat(formData.height_cm) || null,
      weight_kg: parseFloat(formData.weight_kg) || null,
      goal: formData.goal,
      activity_level: formData.activity_level,
      diet_preference: formData.diet_preference,
      allergies: formData.allergies,
      injuries: formData.injuries,
      medical_conditions: formData.medical_conditions,
      sleep_hours: parseFloat(formData.sleep_hours) || null,
      stress_level: formData.stress_level,
      water_intake: formData.water_intake,
      vibe: formData.vibe,
      onboarding_complete: true,
    };

    // Check if guest mode
    const isGuest = document.cookie.includes('gymbruh-guest=true');

    if (isGuest) {
      // Save to localStorage for guest mode
      localStorage.setItem('gymbruh-guest-profile', JSON.stringify(profileData));
      router.push('/dashboard');
      return;
    }

    // Authenticated user — save to Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        ...profileData,
      });
    } catch (err) {
      console.error('Onboarding save error:', err);
    }

    router.push('/dashboard');
  };

  const progress = ((step + 1) / steps.length) * 100;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="onboarding-page">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{step + 1} / {steps.length}</span>
      </div>

      {/* Step Header */}
      <div className="step-header" key={step}>
        <h1 className="step-title"><Icon name={stepIcons[step]} size={24} /> {steps[step].title}</h1>
        <p className="step-subtitle">{steps[step].subtitle}</p>
      </div>

      {/* Step Content */}
      <div className="step-content glass-card-static" key={`content-${step}`}>
        {step === 0 && (
          <div className="welcome-step">
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}><Icon name="dumbbell" size={64} /></div>
            <h2>Hey there, future legend!</h2>
            <p>
              We&apos;re about to ask you a few questions — not the boring generic ones.
              We want to know your <em>real</em> vibe: what you eat, how you sleep,
              any allergies, injuries, or conditions. This helps us build something
              that actually fits YOUR life.
            </p>
            <p style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: '12px' }}>
              <Icon name="lock" size={16} /> Everything stays private. Your data, your rules.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">What should we call you?</label>
              <input
                className="glass-input"
                placeholder="Your name or nickname"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  className="glass-input"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="glass-input glass-select"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  className="glass-input"
                  type="number"
                  placeholder="170"
                  value={formData.height_cm}
                  onChange={(e) => updateField('height_cm', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  className="glass-input"
                  type="number"
                  placeholder="70"
                  value={formData.weight_kg}
                  onChange={(e) => updateField('weight_kg', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="option-grid">
            {goalOptions.map((opt) => (
              <button
                key={opt.value}
                className={`option-card glass-card ${formData.goal === opt.value ? 'option-selected' : ''}`}
                onClick={() => updateField('goal', opt.value)}
              >
                <span className="option-icon"><Icon name={opt.icon} size={28} /></span>
                <span className="option-label">{opt.label}</span>
                <span className="option-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="activity-grid">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                className={`activity-card glass-card ${formData.activity_level === level.value ? 'option-selected' : ''}`}
                onClick={() => updateField('activity_level', level.value)}
              >
                <span className="activity-icon"><Icon name={level.icon} size={24} /></span>
                <div>
                  <span className="activity-label">{level.label}</span>
                  <span className="activity-desc">{level.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="diet-grid">
            {dietOptions.map((opt) => (
              <button
                key={opt.value}
                className={`diet-card glass-card ${formData.diet_preference === opt.value ? 'option-selected' : ''}`}
                onClick={() => updateField('diet_preference', opt.value)}
                style={{ '--accent-color': opt.color } as React.CSSProperties}
              >
                <span className="diet-label"><Icon name={opt.icon} size={18} /> {opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="health-step">
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label"><Icon name="peanut" size={16} /> Any food allergies? (tap all that apply)</label>
              <div className="allergy-grid">
                {allergyItems.map((item) => (
                  <button
                    key={item.label}
                    className={`allergy-chip ${formData.allergies.includes(item.label) ? 'allergy-selected' : ''}`}
                    onClick={() => toggleAllergy(item.label)}
                  >
                    <Icon name={item.icon} size={16} /> {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label"><Icon name="bandage" size={16} /> Any injuries or physical limitations?</label>
              <input
                className="glass-input"
                placeholder="e.g., Bad knee, lower back issues, shoulder surgery..."
                value={formData.injuries}
                onChange={(e) => updateField('injuries', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label"><Icon name="pill" size={16} /> Any medical conditions we should consider?</label>
              <input
                className="glass-input"
                placeholder="e.g., Diabetes, PCOS, thyroid, asthma..."
                value={formData.medical_conditions}
                onChange={(e) => updateField('medical_conditions', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="lifestyle-step">
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label"><Icon name="sleep" size={16} /> How many hours do you sleep?</label>
              <div className="sleep-slider">
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={(e) => updateField('sleep_hours', e.target.value)}
                  className="range-input"
                />
                <span className="sleep-value">{formData.sleep_hours}h</span>
              </div>
              <div className="sleep-verdict">
                {parseFloat(formData.sleep_hours) < 6 ? <><Icon name="tired" size={16} /> Way too low, let&apos;s fix that</> :
                  parseFloat(formData.sleep_hours) < 7 ? <><Icon name="neutral" size={16} /> Could be better</> :
                    parseFloat(formData.sleep_hours) <= 9 ? <><Icon name="happy" size={16} /> Sweet spot!</> : <><Icon name="sleep" size={16} /> That&apos;s a lot of Zzzs</>}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label"><Icon name="stressed" size={16} /> Stress level?</label>
              <div className="stress-options">
                {[
                  { v: 'low', icon: 'calm' as const, l: 'Low' },
                  { v: 'moderate', icon: 'neutral' as const, l: 'Moderate' },
                  { v: 'high', icon: 'angry' as const, l: 'High' },
                  { v: 'extreme', icon: 'exploding' as const, l: 'Extreme' },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    className={`stress-chip ${formData.stress_level === opt.v ? 'stress-selected' : ''}`}
                    onClick={() => updateField('stress_level', opt.v)}
                  >
                    <Icon name={opt.icon} size={16} /> {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><Icon name="water" size={16} /> How much water do you drink?</label>
              <div className="stress-options">
                {[
                  { v: 'low', icon: 'desert' as const, l: 'Barely any' },
                  { v: 'moderate', icon: 'water' as const, l: 'Some' },
                  { v: 'good', icon: 'faucet' as const, l: 'Good amount' },
                  { v: 'gallon', icon: 'waves' as const, l: 'A gallon+' },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    className={`stress-chip ${formData.water_intake === opt.v ? 'stress-selected' : ''}`}
                    onClick={() => updateField('water_intake', opt.v)}
                  >
                    <Icon name={opt.icon} size={16} /> {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="vibe-grid">
            {vibeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`vibe-card glass-card ${formData.vibe === opt.value ? 'option-selected' : ''}`}
                onClick={() => updateField('vibe', opt.value)}
              >
                <span className="vibe-icon"><Icon name={opt.iconKey} size={28} /></span>
                <span className="vibe-label">{opt.label}</span>
                <span className="vibe-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="step-nav">
        {step > 0 && (
          <button className="glass-btn" onClick={prevStep}>
            ← Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="glass-btn glass-btn-primary"
          onClick={nextStep}
          disabled={loading}
        >
          {loading ? <><Icon name="hourglass" size={16} /> Saving...</> : step === steps.length - 1 ? <><Icon name="rocket" size={16} /> Let&apos;s Go!</> : 'Next →'}
        </button>
      </div>

      <style jsx>{`
        .onboarding-page {
          min-height: 100vh;
          max-width: 680px;
          margin: 0 auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar-track {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FBFF00, #e6eb00);
          border-radius: 3px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .step-header {
          text-align: center;
          animation: fadeInUp 0.4s ease-out;
        }

        .step-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .step-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .step-content {
          padding: 28px;
          animation: fadeInUp 0.4s ease-out;
          min-height: 300px;
        }

        .welcome-step {
          text-align: center;
        }

        .welcome-step h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .welcome-step p {
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 500px;
          margin: 0 auto;
        }

        .welcome-step em {
          color: #FBFF00;
          font-style: normal;
          font-weight: 600;
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .option-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .option-card {
          padding: 20px;
          text-align: center;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-smooth);
        }

        .option-selected {
          background: rgba(251, 255, 0, 0.1) !important;
          border-color: #FBFF00 !important;
          box-shadow: 0 0 20px rgba(251, 255, 0, 0.15), var(--glass-shadow) !important;
        }

        .option-icon {
          font-size: 2rem;
        }

        .option-label {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .option-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .activity-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-card {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          text-align: left;
          transition: all var(--transition-smooth);
        }

        .activity-icon {
          font-size: 1.8rem;
          min-width: 40px;
          text-align: center;
        }

        .activity-label {
          font-weight: 700;
          display: block;
          font-size: 0.95rem;
        }

        .activity-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
        }

        .diet-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .diet-card {
          padding: 16px;
          text-align: center;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          transition: all var(--transition-smooth);
          border-radius: var(--radius-md);
        }

        .diet-card.option-selected {
          border-color: var(--accent-color, #FBFF00);
        }

        .diet-label {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .health-step {
          display: flex;
          flex-direction: column;
        }

        .allergy-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .allergy-chip {
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .allergy-chip:hover {
          background: var(--glass-bg-hover);
        }

        .allergy-selected {
          background: rgba(248, 113, 113, 0.15) !important;
          border-color: var(--color-danger) !important;
          color: var(--color-danger);
        }

        .lifestyle-step {
          display: flex;
          flex-direction: column;
        }

        .sleep-slider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 8px;
        }

        .range-input {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(90deg, #FBFF00, #e6eb00);
          border-radius: 3px;
          outline: none;
        }

        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .sleep-value {
          font-size: 1.5rem;
          font-weight: 800;
          min-width: 50px;
          text-align: center;
          color: #FBFF00;
        }

        .sleep-verdict {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 6px;
        }

        .stress-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .stress-chip {
          padding: 10px 16px;
          border-radius: var(--radius-full);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .stress-chip:hover {
          background: var(--glass-bg-hover);
        }

        .stress-selected {
          background: rgba(251, 255, 0, 0.12) !important;
          border-color: #FBFF00 !important;
        }

        .vibe-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .vibe-card {
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-smooth);
        }

        .vibe-icon {
          font-size: 2.5rem;
        }

        .vibe-label {
          font-weight: 700;
          font-size: 1rem;
        }

        .vibe-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .step-nav {
          display: flex;
          gap: 12px;
          padding-bottom: 20px;
        }

        @media (max-width: 500px) {
          .option-grid, .vibe-grid { grid-template-columns: 1fr; }
          .diet-grid { grid-template-columns: repeat(2, 1fr); }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
