'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ScanResult {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: 'homemade' | 'outside';
  healthy_recipe?: string;
  confidence: string;
}

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setSaved(false);
      setError('');
    };
    reader.readAsDataURL(file);
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

      if (!res.ok) throw new Error('Scan failed');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Failed to scan food. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveLog = async () => {
    if (!result) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('food_logs').insert({
      user_id: user.id,
      food_name: result.food_name,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fats: result.fats,
      category: result.category,
    });

    if (!error) setSaved(true);
  };

  const getDeliveryLinks = (foodName: string) => {
    const encoded = encodeURIComponent(foodName);
    return [
      { name: 'Swiggy', url: `https://www.swiggy.com/search?query=${encoded}`, color: '#FC8019' },
      { name: 'Zomato', url: `https://www.zomato.com/search?q=${encoded}`, color: '#E23744' },
      { name: 'Uber Eats', url: `https://www.ubereats.com/search?q=${encoded}`, color: '#06C167' },
    ];
  };

  return (
    <div className="scanner-page">
      <div className="page-header">
        <h1>📸 Food Scanner</h1>
        <p className="page-subtitle">Snap a pic, get instant macros. AI-powered nutrition analysis.</p>
      </div>

      {/* Upload Area */}
      <div className="glass-card-static upload-area" onClick={() => fileInputRef.current?.click()}>
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
            <span style={{ fontSize: '3rem' }}>📷</span>
            <p style={{ fontWeight: 600 }}>Tap to take a photo or upload</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Supports JPG, PNG, HEIC
            </p>
          </div>
        )}
      </div>

      {image && !result && (
        <button
          className="glass-btn glass-btn-rainbow glass-btn-lg scan-button"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <span className="scanning-animation">🔍</span>
              Analyzing with AI...
            </>
          ) : (
            '🔍 Scan This Food'
          )}
        </button>
      )}

      {error && (
        <div className="auth-error" style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="results-container">
          <div className="results-header">
            <h2 className="food-name">{result.food_name}</h2>
            <span className={`badge ${result.category === 'homemade' ? 'badge-success' : 'badge-warning'}`}>
              {result.category === 'homemade' ? '🏠 Homemade' : '🍔 Outside Food'}
            </span>
          </div>

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

          {/* Healthy Recipe Alternative */}
          {result.category === 'outside' && result.healthy_recipe && (
            <div className="glass-card-static recipe-card">
              <h3>🥗 Healthy Homemade Version</h3>
              <div className="recipe-content">
                {result.healthy_recipe.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Get it Now (Delivery Links) */}
          {result.category === 'outside' && (
            <div className="glass-card-static delivery-card">
              <h3>🛵 Get it Now</h3>
              <div className="delivery-links">
                {getDeliveryLinks(result.food_name).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn glass-btn-sm delivery-btn"
                    style={{ borderColor: link.color + '44' }}
                  >
                    <span style={{ color: link.color, fontWeight: 700 }}>{link.name}</span>
                    →
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
              {saved ? '✅ Saved to Log!' : '💾 Save to Food Log'}
            </button>
            <button
              className="glass-btn"
              onClick={() => { setImage(null); setResult(null); setSaved(false); }}
            >
              📸 Scan Another
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
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .upload-area {
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition-smooth);
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-area:hover {
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-shadow-lg);
        }

        .upload-placeholder {
          text-align: center;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }

        .preview-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
        }

        .scan-button {
          width: 100%;
        }

        .scanning-animation {
          display: inline-block;
          animation: bounce 0.6s ease-in-out infinite alternate;
        }

        @keyframes bounce {
          from { transform: translateY(-4px); }
          to { transform: translateY(4px); }
        }

        .results-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInUp 0.4s ease-out;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .food-name {
          font-size: 1.5rem;
          font-weight: 800;
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

        .recipe-card {
          padding: 20px;
        }

        .recipe-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .recipe-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 4px;
        }

        .delivery-card {
          padding: 20px;
        }

        .delivery-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
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
          .macro-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
