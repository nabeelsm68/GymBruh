'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/ui/Icons';
import { initUserId, userKey } from '@/lib/user-storage';

interface ScanResult {
  food_name: string;
  food_items?: string[];
  serving_size?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: 'homemade' | 'outside';
  health_score?: number;
  health_verdict?: string;
  healthy_recipe?: string;
  confidence: string;
}

interface ScanHistoryItem {
  food_name: string;
  calories: number;
  health_score?: number;
  category: string;
  timestamp: number;
}

/* ── Nutrition Tips ── */
const nutritionTips = [
  { tip: "Adding lemon to water can boost vitamin C intake by 30%", icon: "water" as const },
  { tip: "Protein keeps you full longer — aim for 20-30g per meal", icon: "muscle" as const },
  { tip: "Colorful plates = more nutrients. Eat the rainbow!", icon: "salad" as const },
  { tip: "Greek yogurt has 2x more protein than regular yogurt", icon: "sparkles" as const },
  { tip: "Fiber slows sugar absorption, keeping energy stable", icon: "leaf" as const },
  { tip: "Almonds have more calcium than any other nut", icon: "lightbulb" as const },
  { tip: "Sweet potatoes are one of the most nutrient-dense foods", icon: "fire" as const },
  { tip: "Eating slowly can reduce calorie intake by up to 12%", icon: "brain" as const },
];

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [tipIdx, setTipIdx] = useState(0);
  const [tipFade, setTipFade] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  /* ── Load scan history ── */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initUserId().then(() => {
      const stored = localStorage.getItem(userKey('scan-history'));
      if (stored) {
        try { setScanHistory(JSON.parse(stored)); } catch { /* ignore */ }
      }
      setReady(true);
    });
  }, []);

  /* ── Rotating tips ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIdx(i => (i + 1) % nutritionTips.length);
        setTipFade(true);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  /* ── Scanning messages ── */
  const scanMessages = [
    "Identifying food items...",
    "Analyzing nutritional content...",
    "Calculating macros...",
    "Checking health score...",
    "Almost there...",
  ];
  const [scanMsg, setScanMsg] = useState(scanMessages[0]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (scanning) {
      setScanProgress(0);
      const msgInterval = setInterval(() => {
        setScanMsg(scanMessages[Math.floor(Math.random() * scanMessages.length)]);
      }, 2000);
      const progressInterval = setInterval(() => {
        setScanProgress(p => Math.min(p + Math.random() * 15, 90));
      }, 500);
      return () => { clearInterval(msgInterval); clearInterval(progressInterval); };
    } else {
      setScanProgress(0);
    }
  }, [scanning]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setSaved(false);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadFile(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    setError('');

    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      setResult(data);
      setScanProgress(100);

      // Save to scan history
      const historyItem: ScanHistoryItem = {
        food_name: data.food_name,
        calories: data.calories,
        health_score: data.health_score,
        category: data.category,
        timestamp: Date.now(),
      };
      const updated = [historyItem, ...scanHistory].slice(0, 10);
      setScanHistory(updated);
      localStorage.setItem(userKey('scan-history'), JSON.stringify(updated));
    } catch (err: any) {
      setError(err.message || 'Failed to scan food. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveLog = async () => {
    if (!result) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: result.food_name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        category: result.category,
      });
      if (error) console.error('Supabase save error:', error);
    }

    const todayKey = userKey(`meals-${new Date().toISOString().split('T')[0]}`);
    const existing = localStorage.getItem(todayKey);
    let meals = { breakfast: [] as any[], lunch: [] as any[], dinner: [] as any[] };
    if (existing) {
      try { meals = JSON.parse(existing); } catch { /* ignore */ }
    }
    const hour = new Date().getHours();
    const mealSlot: 'breakfast' | 'lunch' | 'dinner' =
      hour < 11 ? 'breakfast' : hour < 16 ? 'lunch' : 'dinner';
    meals[mealSlot].push({
      id: Date.now().toString(),
      name: result.food_name,
      calories: result.calories,
    });
    localStorage.setItem(todayKey, JSON.stringify(meals));
    setSaved(true);
  };

  const getDeliveryLinks = (foodName: string) => {
    const encoded = encodeURIComponent(foodName);
    return [
      { name: 'Swiggy', url: `https://www.swiggy.com/search?query=${encoded}`, color: '#FC8019' },
      { name: 'Zomato', url: `https://www.zomato.com/search?q=${encoded}`, color: '#E23744' },
      { name: 'Uber Eats', url: `https://www.ubereats.com/search?q=${encoded}`, color: '#06C167' },
    ];
  };

  const getHealthColor = (score: number) => {
    if (score >= 7) return '#4ade80';
    if (score >= 4) return '#facc15';
    return '#f87171';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Healthy';
    if (score >= 5) return 'Moderate';
    if (score >= 3) return 'Fair';
    return 'Unhealthy';
  };

  const getConfidenceColor = (conf: string) => {
    if (conf === 'high') return '#4ade80';
    if (conf === 'medium') return '#facc15';
    return '#f87171';
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const todayScans = scanHistory.filter(s => {
    const d = new Date(s.timestamp);
    const now = new Date();
    return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
  });
  const todayCalories = todayScans.reduce((s, i) => s + i.calories, 0);

  return (
    <div className="scanner-page">
      <div className="page-header">
        <h1><Icon name="camera" size={24} /> Food Scanner</h1>
        <p className="page-subtitle">Snap a pic, get instant macros. AI-powered nutrition analysis.</p>
      </div>

      {/* ═══ Today's Stats Bar ═══ */}
      {!result && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{todayScans.length}</span>
            <span className="stat-label">Scans Today</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{todayCalories}</span>
            <span className="stat-label">Calories Logged</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{scanHistory.length}</span>
            <span className="stat-label">Total Scans</span>
          </div>
        </div>
      )}

      {/* ═══ Upload Area ═══ */}
      <div
        className={`glass-card-static upload-area ${dragOver ? 'upload-drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        {image ? (
          <img src={image} alt="Food preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-ring">
              <div className="upload-icon-inner">
                <Icon name="cameraPlus" size={36} />
              </div>
            </div>
            <p className="upload-title">Tap to take a photo or upload</p>
            <p className="upload-hint">Drag & drop also works • JPG, PNG, HEIC</p>
            <div className="upload-features">
              <span><Icon name="sparkles" size={14} /> AI Analysis</span>
              <span><Icon name="lightning" size={14} /> Instant Macros</span>
              <span><Icon name="target" size={14} /> Health Score</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Scanning State ═══ */}
      {image && !result && (
        <button
          className="glass-btn glass-btn-rainbow glass-btn-lg scan-button"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? (
            <div className="scan-progress-content">
              <div className="scan-progress-bar">
                <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="scan-msg">{scanMsg}</span>
            </div>
          ) : (
            <><Icon name="search" size={18} /> Scan This Food</>
          )}
        </button>
      )}

      {error && (
        <div className="error-card">
          <Icon name="warning" size={16} /> {error}
        </div>
      )}

      {/* ═══ Nutrition Tip (shown when idle) ═══ */}
      {!image && !result && (
        <div className="glass-card-static tip-card">
          <div className="tip-badge">DID YOU KNOW?</div>
          <div className={`tip-content ${tipFade ? 'tip-in' : 'tip-out'}`}>
            <Icon name={nutritionTips[tipIdx].icon} size={20} />
            <p>{nutritionTips[tipIdx].tip}</p>
          </div>
          <div className="tip-dots">
            {nutritionTips.map((_, i) => (
              <span key={i} className={`tip-dot ${i === tipIdx ? 'tip-dot-active' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ How It Works (shown when no image) ═══ */}
      {!image && !result && (
        <div className="how-it-works">
          <h3 className="section-title">How It Works</h3>
          <div className="steps-row">
            {[
              { icon: 'camera' as const, title: 'Snap', desc: 'Take a photo of your food' },
              { icon: 'brain' as const, title: 'Analyze', desc: 'AI identifies nutrients' },
              { icon: 'chart' as const, title: 'Track', desc: 'Save to your food log' },
            ].map((step, i) => (
              <div key={i} className="step-card glass-card-static">
                <div className="step-number">{i + 1}</div>
                <div className="step-icon"><Icon name={step.icon} size={24} /></div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Recent Scans ═══ */}
      {!image && !result && scanHistory.length > 0 && (
        <div className="history-section">
          <h3 className="section-title">Recent Scans</h3>
          <div className="history-list">
            {scanHistory.slice(0, 5).map((item, i) => (
              <div key={i} className="glass-card-static history-item">
                <div className="history-info">
                  <span className="history-name">{item.food_name}</span>
                  <span className="history-time">{timeAgo(item.timestamp)}</span>
                </div>
                <div className="history-meta">
                  <span className="history-cals">{item.calories} kcal</span>
                  {item.health_score && (
                    <span className="history-score" style={{ color: getHealthColor(item.health_score) }}>
                      {item.health_score}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Results ═══ */}
      {result && (
        <div className="results-container">
          <div className="results-header">
            <div>
              <h2 className="food-name">{result.food_name}</h2>
              {result.serving_size && (
                <p className="serving-size">Serving: {result.serving_size}</p>
              )}
            </div>
            <div className="header-badges">
              <span className={`badge ${result.category === 'homemade' ? 'badge-success' : 'badge-warning'}`}>
                {result.category === 'homemade' ? <><Icon name="home" size={14} /> Homemade</> : <><Icon name="burger" size={14} /> Outside Food</>}
              </span>
              <span className="badge" style={{
                background: getConfidenceColor(result.confidence) + '22',
                color: getConfidenceColor(result.confidence),
                border: `1px solid ${getConfidenceColor(result.confidence)}44`,
              }}>
                <Icon name="eye" size={12} /> {result.confidence}
              </span>
            </div>
          </div>

          {/* Health Score */}
          {result.health_score && (
            <div className="glass-card-static health-score-card">
              <div className="health-score-row">
                <div className="health-score-circle" style={{ borderColor: getHealthColor(result.health_score) }}>
                  <span className="health-score-num" style={{ color: getHealthColor(result.health_score) }}>
                    {result.health_score}
                  </span>
                  <span className="health-score-of">/10</span>
                </div>
                <div className="health-score-info">
                  <span className="health-label" style={{ color: getHealthColor(result.health_score) }}>
                    {getHealthLabel(result.health_score)}
                  </span>
                  {result.health_verdict && (
                    <p className="health-verdict">{result.health_verdict}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Macro Cards */}
          <div className="macro-cards">
            {[
              { label: 'Calories', value: result.calories, unit: 'kcal', className: 'macro-bg-calories macro-calories' },
              { label: 'Protein', value: result.protein, unit: 'g', className: 'macro-bg-protein macro-protein' },
              { label: 'Carbs', value: result.carbs, unit: 'g', className: 'macro-bg-carbs macro-carbs' },
              { label: 'Fats', value: result.fats, unit: 'g', className: 'macro-bg-fats macro-fats' },
            ].map((macro) => (
              <div key={macro.label} className={`glass-card-static macro-card ${macro.className}`}>
                <span className="macro-card-label">{macro.label}</span>
                <span className="macro-card-value">{macro.value}</span>
                <span className="macro-card-unit">{macro.unit}</span>
              </div>
            ))}
          </div>

          {/* Detailed Nutrition */}
          {(result.fiber !== undefined || result.sugar !== undefined || result.sodium !== undefined) && (
            <div className="glass-card-static detail-nutrition-card">
              <h3 className="detail-title"><Icon name="clipboard" size={16} /> Detailed Nutrition</h3>
              <div className="detail-grid">
                {result.fiber !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label"><Icon name="leaf" size={14} /> Fiber</span>
                    <span className="detail-value">{result.fiber}g</span>
                  </div>
                )}
                {result.sugar !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label"><Icon name="sparkles" size={14} /> Sugar</span>
                    <span className="detail-value">{result.sugar}g</span>
                  </div>
                )}
                {result.sodium !== undefined && (
                  <div className="detail-item">
                    <span className="detail-label"><Icon name="lightning" size={14} /> Sodium</span>
                    <span className="detail-value">{result.sodium}mg</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food Items Detected */}
          {result.food_items && result.food_items.length > 1 && (
            <div className="glass-card-static food-items-card">
              <h3 className="detail-title"><Icon name="eye" size={16} /> Detected Items</h3>
              <div className="food-items-list">
                {result.food_items.map((item, i) => (
                  <span key={i} className="food-item-chip">{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Healthy Recipe */}
          {result.category === 'outside' && result.healthy_recipe && (
            <div className="glass-card-static recipe-card">
              <h3><Icon name="salad" size={18} /> Healthy Homemade Version</h3>
              <div className="recipe-content">
                <ol className="recipe-steps">
                  {result.healthy_recipe.split('\n').filter(l => l.trim()).map((line, i) => (
                    <li key={i}>{line.replace(/^\d+[.\)]\s*/, '')}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Delivery Links */}
          {result.category === 'outside' && (
            <div className="glass-card-static delivery-card">
              <h3><Icon name="delivery" size={18} /> Get it Now</h3>
              <div className="delivery-links">
                {getDeliveryLinks(result.food_name).map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="glass-btn glass-btn-sm delivery-btn"
                    style={{ borderColor: link.color + '44' }}>
                    <span style={{ color: link.color, fontWeight: 700 }}>{link.name}</span> →
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="result-actions">
            <button
              className={`glass-btn ${saved ? 'glass-btn-primary' : 'glass-btn-rainbow'}`}
              onClick={handleSaveLog}
              disabled={saved}
            >
              {saved ? <><Icon name="checkCircle" size={16} /> Saved to Log!</> : <><Icon name="save" size={16} /> Save to Food Log</>}
            </button>
            <button className="glass-btn" onClick={() => { setImage(null); setResult(null); setSaved(false); }}>
              <Icon name="camera" size={16} /> Scan Another
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .scanner-page {
          max-width: 600px;
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

        /* ── Stats Bar ── */
        .stats-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 16px 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-value {
          font-size: 1.3rem;
          font-weight: 800;
          color: #FBFF00;
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .stat-divider {
          width: 1px;
          height: 30px;
          background: var(--glass-border);
        }

        /* ── Upload Area ── */
        .upload-area {
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .upload-area:hover {
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-shadow-lg);
        }

        .upload-drag-over {
          border-color: #FBFF00 !important;
          box-shadow: 0 0 30px rgba(251, 255, 0, 0.15) !important;
        }

        .upload-placeholder {
          text-align: center;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .upload-icon-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(251, 255, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .upload-icon-inner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(251, 255, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FBFF00;
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); border-color: rgba(251, 255, 0, 0.3); }
          50% { transform: scale(1.08); border-color: rgba(251, 255, 0, 0.5); }
        }

        .upload-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .upload-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .upload-features {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .upload-features span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .preview-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
        }

        /* ── Scan Button with Progress ── */
        .scan-button {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .scan-progress-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .scan-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .scan-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FBFF00, #4ade80);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .scan-msg {
          font-size: 0.85rem;
          animation: fadeInUp 0.3s ease;
        }

        /* ── Error ── */
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

        /* ── Tip Card ── */
        .tip-card {
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .tip-card::before {
          content: '';
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

        .tip-badge {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #FBFF00;
          margin-bottom: 12px;
        }

        .tip-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .tip-in { opacity: 1; transform: translateY(0); }
        .tip-out { opacity: 0; transform: translateY(-8px); }

        .tip-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .tip-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
        }

        .tip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .tip-dot-active {
          background: #FBFF00;
          width: 16px;
          border-radius: 3px;
        }

        /* ── How It Works ── */
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .steps-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .step-card {
          padding: 20px 16px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-4px);
          border-color: var(--glass-border-hover);
        }

        .step-number {
          position: absolute;
          top: 10px;
          left: 12px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-icon {
          color: #FBFF00;
          margin-bottom: 10px;
        }

        .step-card h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .step-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        /* ── History ── */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .history-item {
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
        }

        .history-item:hover {
          border-color: var(--glass-border-hover);
        }

        .history-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .history-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .history-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .history-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-cals {
          font-size: 0.85rem;
          font-weight: 700;
          color: #FBFF00;
        }

        .history-score {
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* ── Results ── */
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInUp 0.4s ease-out;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }

        .food-name {
          font-size: 1.5rem;
          font-weight: 800;
        }

        .serving-size {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .header-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .health-score-card { padding: 20px; }

        .health-score-row {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .health-score-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .health-score-num {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .health-score-of {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .health-score-info { flex: 1; }

        .health-label {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .health-verdict {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }

        .macro-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .macro-card {
          padding: 16px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .macro-card-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .macro-card-value {
          font-size: 1.6rem;
          font-weight: 800;
        }

        .macro-card-unit {
          font-size: 0.7rem;
          opacity: 0.6;
        }

        .detail-nutrition-card { padding: 20px; }

        .detail-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-value {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .food-items-card { padding: 20px; }

        .food-items-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .food-item-chip {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .recipe-card { padding: 20px; }

        .recipe-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .recipe-steps {
          list-style: none;
          counter-reset: recipe-step;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recipe-steps li {
          counter-increment: recipe-step;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          padding-left: 32px;
          position: relative;
        }

        .recipe-steps li::before {
          content: counter(recipe-step);
          position: absolute;
          left: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .delivery-card { padding: 20px; }

        .delivery-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .delivery-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .result-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 500px) {
          .macro-cards { grid-template-columns: repeat(2, 1fr); }
          .steps-row { grid-template-columns: 1fr; }
          .stats-bar { gap: 16px; }
        }
      `}</style>
    </div>
  );
}
