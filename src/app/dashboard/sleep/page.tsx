'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Icon from '@/components/ui/Icons';
import './sleep.css';

/* ── Helpers ── */
function getDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDayName(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function hoursToHM(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

const STORAGE_PREFIX = 'gymbruh-sleep-';
const QUALITY_PREFIX = 'gymbruh-sleepq-';

/* ── Sleep Tips ── */
const sleepTips = [
  { tip: "Keep your bedroom between 60-67°F (15-19°C) for optimal sleep", icon: "moon" as const },
  { tip: "The blue light from screens suppresses melatonin for up to 3 hours", icon: "lightning" as const },
  { tip: "A consistent sleep schedule is more important than total hours", icon: "target" as const },
  { tip: "Caffeine has a half-life of 5-6 hours — stop by early afternoon", icon: "fire" as const },
  { tip: "Regular exercise can improve sleep quality by up to 65%", icon: "muscle" as const },
  { tip: "Power naps of 10-20 minutes can boost alertness without grogginess", icon: "brain" as const },
  { tip: "Magnesium-rich foods like almonds and bananas promote better sleep", icon: "leaf" as const },
  { tip: "Deep breathing exercises can reduce time to fall asleep by 50%", icon: "sparkles" as const },
];

/* ── Types ── */
interface SleepEntry {
  date: string;
  hours: number;
  quality?: number; // 1-5 stars
}

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [logDate, setLogDate] = useState(getDateKey(new Date()));
  const [logHours, setLogHours] = useState('7');
  const [logMinutes, setLogMinutes] = useState('30');
  const [logQuality, setLogQuality] = useState(4);
  const [goalHours, setGoalHours] = useState(8);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [tipFade, setTipFade] = useState(true);

  /* ── Load entries + goal ── */
  useEffect(() => {
    const loaded: SleepEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const date = key.replace(STORAGE_PREFIX, '');
        const val = parseFloat(localStorage.getItem(key) || '0');
        const quality = parseInt(localStorage.getItem(QUALITY_PREFIX + date) || '0', 10) || undefined;
        if (val > 0) loaded.push({ date, hours: val, quality });
      }
    }
    loaded.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(loaded);

    const savedGoal = localStorage.getItem('gymbruh-sleep-goal');
    if (savedGoal) setGoalHours(parseFloat(savedGoal));
  }, []);

  /* ── Rotating tips ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIdx(i => (i + 1) % sleepTips.length);
        setTipFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ── Save entry ── */
  const saveEntry = () => {
    const h = parseInt(logHours, 10) || 0;
    const m = parseInt(logMinutes, 10) || 0;
    const total = h + m / 60;
    if (total <= 0 || total > 24) return;

    localStorage.setItem(STORAGE_PREFIX + logDate, String(total));
    localStorage.setItem(QUALITY_PREFIX + logDate, String(logQuality));

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== logDate);
      const updated = [...filtered, { date: logDate, hours: total, quality: logQuality }];
      updated.sort((a, b) => a.date.localeCompare(b.date));
      return updated;
    });
  };

  /* ── Delete entry ── */
  const deleteEntry = (date: string) => {
    localStorage.removeItem(STORAGE_PREFIX + date);
    localStorage.removeItem(QUALITY_PREFIX + date);
    setEntries((prev) => prev.filter((e) => e.date !== date));
  };

  const saveGoal = (val: number) => {
    setGoalHours(val);
    localStorage.setItem('gymbruh-sleep-goal', String(val));
    setEditingGoal(false);
  };

  /* ── Computed Data ── */
  const last7 = useMemo(() => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(getDateKey(d));
    }
    return dates.map((dt) => {
      const entry = entries.find((e) => e.date === dt);
      return { date: dt, hours: entry?.hours || 0, quality: entry?.quality };
    });
  }, [entries]);

  const last14 = useMemo(() => {
    const dates: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(getDateKey(d));
    }
    return dates.map((dt) => {
      const entry = entries.find((e) => e.date === dt);
      return { date: dt, hours: entry?.hours || 0, quality: entry?.quality };
    });
  }, [entries]);

  const avg7 = useMemo(() => {
    const logged = last7.filter((d) => d.hours > 0);
    if (logged.length === 0) return 0;
    return logged.reduce((s, d) => s + d.hours, 0) / logged.length;
  }, [last7]);

  const isGood = avg7 >= goalHours;

  /* ── Streak ── */
  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getDateKey(d);
      const entry = entries.find(e => e.date === key);

      if (entry && entry.hours >= goalHours) {
        count++;
      } else if (i === 0 && !entry) {
        // Skip today if empty
        continue;
      } else {
        // Missing entry or below goal breaks the streak
        break;
      }
    }
    return count;
  }, [entries, goalHours]);

  /* ── Sleep Debt ── */
  const sleepDebt = useMemo(() => {
    const logged = last7.filter(d => d.hours > 0);
    if (logged.length === 0) return 0;
    const totalDebt = logged.reduce((s, d) => s + Math.max(0, goalHours - d.hours), 0);
    return totalDebt;
  }, [last7, goalHours]);

  /* ── Average Quality ── */
  const avgQuality = useMemo(() => {
    const withQuality = last7.filter(d => d.quality && d.quality > 0);
    if (withQuality.length === 0) return 0;
    return withQuality.reduce((s, d) => s + (d.quality || 0), 0) / withQuality.length;
  }, [last7]);

  /* ── Insights ── */
  const insights = useMemo(() => {
    const logged = entries.filter((e) => e.hours > 0);
    if (logged.length < 2) return null;

    const recent = logged.slice(-7);
    const recentAvg = recent.reduce((s, e) => s + e.hours, 0) / recent.length;
    const variance = recent.reduce((s, e) => s + Math.pow(e.hours - recentAvg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const consistency = stdDev < 0.5 ? 'Very Consistent' : stdDev < 1.0 ? 'Fairly Consistent' : stdDev < 1.5 ? 'Somewhat Irregular' : 'Irregular';
    const consistencyColor = stdDev < 0.5 ? '#4ade80' : stdDev < 1.0 ? '#60a5fa' : stdDev < 1.5 ? '#facc15' : '#f87171';

    const thisWeek = last7.filter((d) => d.hours > 0);
    const prevWeekDates: string[] = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      prevWeekDates.push(getDateKey(d));
    }
    const prevWeek = prevWeekDates.map((dt) => entries.find((e) => e.date === dt)?.hours || 0).filter((h) => h > 0);

    let trend = 'Stable';
    let trendIcon: 'trendUp' | 'trendDown' | 'neutral' = 'neutral';
    if (thisWeek.length > 0 && prevWeek.length > 0) {
      const thisAvg = thisWeek.reduce((s, d) => s + d.hours, 0) / thisWeek.length;
      const prevAvg = prevWeek.reduce((s, h) => s + h, 0) / prevWeek.length;
      const diff = thisAvg - prevAvg;
      if (diff > 0.3) { trend = 'Improving'; trendIcon = 'trendUp'; }
      else if (diff < -0.3) { trend = 'Declining'; trendIcon = 'trendDown'; }
    }

    const dayTotals: Record<string, { sum: number; count: number }> = {};
    for (const e of logged) {
      const day = getDayName(new Date(e.date + 'T00:00:00'));
      if (!dayTotals[day]) dayTotals[day] = { sum: 0, count: 0 };
      dayTotals[day].sum += e.hours;
      dayTotals[day].count++;
    }
    const dayAvgs = Object.entries(dayTotals).map(([day, { sum, count }]) => ({ day, avg: sum / count }));
    dayAvgs.sort((a, b) => b.avg - a.avg);
    const bestDay = dayAvgs[0];
    const worstDay = dayAvgs[dayAvgs.length - 1];

    return { consistency, consistencyColor, trend, trendIcon, bestDay, worstDay, stdDev };
  }, [entries, last7]);

  /* ── Chart ── */
  const chartW = 700;
  const chartH = 240;
  const chartPadL = 40;
  const chartPadR = 20;
  const chartPadT = 16;
  const chartPadB = 36;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;
  const maxHours = useMemo(() => {
    const vals = entries.map(e => e.hours);
    return Math.max(12, goalHours + 2, ...vals);
  }, [entries, goalHours]);
  const goalY = chartPadT + plotH * (1 - goalHours / maxHours);

  const [chartAnimated, setChartAnimated] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  const chartPoints = useMemo(() => {
    return last14.map((d, i) => {
      const x = chartPadL + (i / (last14.length - 1)) * plotW;
      const h = d.hours > 0 ? d.hours : 0;
      const y = chartPadT + plotH * (1 - h / maxHours);
      return { x, y, hours: d.hours, date: d.date };
    });
  }, [last14, plotW, plotH]);

  const smoothPath = useMemo(() => {
    const pts = chartPoints;
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      let cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      let cp2y = p2.y - (p3.y - p1.y) * tension;

      // Clamp Y control points to prevent exceeding bounds
      cp1y = Math.max(chartPadT, Math.min(chartPadT + plotH, cp1y));
      cp2y = Math.max(chartPadT, Math.min(chartPadT + plotH, cp2y));

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!smoothPath) return '';
    const bottomY = chartPadT + plotH;
    const pts = chartPoints;
    return `${smoothPath} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
  }, [smoothPath, chartPoints, plotH]);

  useEffect(() => {
    const timer = setTimeout(() => setChartAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getQualityLabel = (q: number) => {
    if (q >= 5) return 'Excellent';
    if (q >= 4) return 'Good';
    if (q >= 3) return 'Fair';
    if (q >= 2) return 'Poor';
    return 'Very Poor';
  };

  const getQualityColor = (q: number) => {
    if (q >= 4) return '#4ade80';
    if (q >= 3) return '#facc15';
    return '#f87171';
  };

  return (
    <div className="sleep-page">
      {/* ═══ Header ═══ */}
      <div className="sleep-header">
        <div>
          <h1 className="sleep-title"><Icon name="sleep" size={24} /> <span className="serif">Sleep Tracker</span></h1>
          <p className="sleep-subtitle">Monitor your rest and build better habits</p>
        </div>
      </div>

      {/* ═══ Quick Stats Row ═══ */}
      <div className="quick-stats">
        <div className="quick-stat glass-card-static">
          <div className="qs-icon qs-icon-streak"><Icon name="fire" size={18} /></div>
          <div className="qs-content">
            <span className="qs-value">{streak}</span>
            <span className="qs-label">Day Streak</span>
          </div>
        </div>
        <div className="quick-stat glass-card-static">
          <div className="qs-icon qs-icon-debt"><Icon name="moon" size={18} /></div>
          <div className="qs-content">
            <span className="qs-value">{sleepDebt > 0 ? hoursToHM(sleepDebt) : '0h'}</span>
            <span className="qs-label">Sleep Debt</span>
          </div>
        </div>
        <div className="quick-stat glass-card-static">
          <div className="qs-icon qs-icon-quality"><Icon name="star" size={18} /></div>
          <div className="qs-content">
            <span className="qs-value">{avgQuality > 0 ? avgQuality.toFixed(1) : '--'}</span>
            <span className="qs-label">Avg Quality</span>
          </div>
        </div>
        <div className="quick-stat glass-card-static">
          <div className="qs-icon qs-icon-logged"><Icon name="checkCircle" size={18} /></div>
          <div className="qs-content">
            <span className="qs-value">{entries.length}</span>
            <span className="qs-label">Total Logs</span>
          </div>
        </div>
      </div>

      {/* ═══ Top Row: Average + Log Form ═══ */}
      <div className="top-row">
        {/* Average Sleep Card */}
        <section className={`glass-card-static widget-sleep avg-card ${isGood ? 'avg-good' : 'avg-bad'}`}>
          <div className="avg-header">
            <h3 className="section-title">Weekly Average</h3>
            {editingGoal ? (
              <div className="goal-editor">
                <input
                  type="number"
                  className="glass-input goal-input"
                  min="4" max="12" step="0.5"
                  value={goalHours}
                  onChange={e => setGoalHours(parseFloat(e.target.value) || 8)}
                />
                <button className="glass-btn glass-btn-sm glass-btn-primary" onClick={() => saveGoal(goalHours)}>
                  Save
                </button>
              </div>
            ) : (
              <button className="goal-btn" onClick={() => setEditingGoal(true)}>
                <Icon name="target" size={12} /> Goal: {goalHours}h
              </button>
            )}
          </div>
          <div className="avg-ring-wrap">
            <svg viewBox="0 0 120 120" className="avg-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={isGood ? '#4ade80' : '#f87171'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((avg7 / maxHours) * 314, 314)} 314`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
              />
            </svg>
            <div className="avg-ring-text">
              <span className="avg-value">{avg7 > 0 ? hoursToHM(avg7) : '--'}</span>
              <span className="avg-goal">/ {goalHours}h</span>
            </div>
          </div>
          <div className={`avg-badge ${isGood ? 'badge-good' : 'badge-bad'}`}>
            {avg7 === 0 ? <><Icon name="chart" size={14} /> No data yet</> : isGood ? <><Icon name="checkCircle" size={14} /> Good Rest</> : <><Icon name="warning" size={14} /> Sleep Debt</>}
          </div>
        </section>

        {/* Log Form */}
        <section className="glass-card-static widget-sleep log-card">
          <h3 className="section-title"><Icon name="edit" size={16} /> Log Sleep</h3>
          <div className="log-form">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="glass-input"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            <div className="duration-inputs">
              <div className="form-group">
                <label className="form-label">Hours</label>
                <input
                  type="number"
                  className="glass-input"
                  min="0"
                  max="24"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minutes</label>
                <input
                  type="number"
                  className="glass-input"
                  min="0"
                  max="59"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                />
              </div>
            </div>

            {/* Sleep Quality Stars */}
            <div className="form-group">
              <label className="form-label">Sleep Quality</label>
              <div className="quality-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${star <= logQuality ? 'star-active' : ''}`}
                    onClick={() => setLogQuality(star)}
                  >
                    <Icon name="star" size={22} />
                  </button>
                ))}
                <span className="quality-text" style={{ color: getQualityColor(logQuality) }}>
                  {getQualityLabel(logQuality)}
                </span>
              </div>
            </div>

            <button className="glass-btn glass-btn-primary log-btn" onClick={saveEntry}>
              <Icon name="sleep" size={16} /> Log Sleep
            </button>
          </div>
        </section>
      </div>

      {/* ═══ Sleep Tip ═══ */}
      <div className="glass-card-static tip-card">
        <div className="tip-badge">SLEEP TIP</div>
        <div className={`tip-content ${tipFade ? 'tip-in' : 'tip-out'}`}>
          <Icon name={sleepTips[tipIdx].icon} size={20} />
          <p>{sleepTips[tipIdx].tip}</p>
        </div>
        <div className="tip-dots">
          {sleepTips.map((_, i) => (
            <span key={i} className={`tip-dot ${i === tipIdx ? 'tip-dot-active' : ''}`} />
          ))}
        </div>
      </div>

      {/* ═══ Sleep Trends Chart ═══ */}
      <section className="glass-card-static widget-sleep chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Sleep Trends</h3>
            <p className="chart-sub">Duration over the last 14 days</p>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot legend-dot-duration" /> Duration</span>
            <span className="legend-item"><span className="legend-dot legend-dot-goal" /> {goalHours}h Goal</span>
          </div>
        </div>
        <div className="chart-scroll">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="sleep-chart" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBFF00" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#FBFF00" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FBFF00" stopOpacity="0" />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 2, 4, 6, 8, 10, 12].map((h) => {
              const y = chartPadT + plotH * (1 - h / maxHours);
              return (
                <g key={h}>
                  <text x={chartPadL - 8} y={y + 4} textAnchor="end" className="chart-label">{h}</text>
                  <line x1={chartPadL} y1={y} x2={chartW - chartPadR} y2={y} className="chart-grid" />
                </g>
              );
            })}

            {/* Goal line */}
            <line x1={chartPadL} y1={goalY} x2={chartW - chartPadR} y2={goalY} className="goal-line" />

            {/* Area fill */}
            {areaPath && (
              <path
                ref={areaRef}
                d={areaPath}
                fill="url(#areaGrad)"
                className={`area-path ${chartAnimated ? 'area-visible' : ''}`}
              />
            )}

            {/* Smooth line */}
            {smoothPath && (
              <path
                ref={pathRef}
                d={smoothPath}
                fill="none"
                stroke="#FBFF00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
                className={`line-path ${chartAnimated ? 'line-visible' : ''}`}
              />
            )}

            {/* Data dots */}
            {chartPoints.map((pt, i) => (
              pt.hours > 0 && (
                <g key={i} className={`data-dot-group ${chartAnimated ? 'dot-visible' : ''}`} style={{ animationDelay: `${0.8 + i * 0.05}s` }}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#0a0a0a" stroke="#FBFF00" strokeWidth="2" className="data-dot" />
                  <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="dot-label">{hoursToHM(pt.hours)}</text>
                </g>
              )
            ))}

            {/* X-axis labels */}
            {last14.map((d, i) => {
              if (i % 3 !== 0 && i !== last14.length - 1) return null;
              const x = chartPadL + (i / (last14.length - 1)) * plotW;
              const dateObj = new Date(d.date + 'T00:00:00');
              const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <text key={d.date} x={x} y={chartH - 8} textAnchor="middle" className="chart-date-label">{label}</text>
              );
            })}
          </svg>
        </div>
      </section>

      {/* ═══ Weekly Bar Chart ═══ */}
      <section className="glass-card-static widget-sleep bar-chart-card">
        <h3 className="chart-title"><Icon name="chart" size={16} /> This Week at a Glance</h3>
        <div className="bar-chart">
          {last7.map((d) => {
            const pct = Math.min((d.hours / maxHours) * 100, 100);
            const goalPct = (goalHours / maxHours) * 100;
            const dateObj = new Date(d.date + 'T00:00:00');
            const dayLabel = getDayName(dateObj);
            const meetsGoal = d.hours >= goalHours;
            return (
              <div key={d.date} className="bar-col">
                <span className="bar-value">{d.hours > 0 ? hoursToHM(d.hours) : ''}</span>
                <div className="bar-track">
                  <div className="bar-goal-marker" style={{ bottom: `${goalPct}%` }} />
                  <div
                    className={`bar-fill ${meetsGoal ? 'bar-good' : d.hours > 0 ? 'bar-low' : 'bar-empty'}`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="bar-day">{dayLabel}</span>
                {d.quality && (
                  <div className="bar-quality">
                    {Array.from({ length: d.quality }, (_, i) => (
                      <span key={i} className="bar-star"><Icon name="star" size={8} /></span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Bottom Row: History + Insights ═══ */}
      <div className="bottom-row">
        {/* Recent History */}
        <section className="glass-card-static widget-sleep history-card">
          <h3 className="section-title"><Icon name="clipboard" size={16} /> This Week</h3>
          <div className="history-list">
            {last7.slice().reverse().map((d) => {
              const dateObj = new Date(d.date + 'T00:00:00');
              return (
                <div key={d.date} className="history-item">
                  <div className="history-left">
                    <span className={`history-dot ${d.hours >= goalHours ? 'dot-green' : d.hours > 0 ? 'dot-red' : 'dot-empty'}`} />
                    <div className="history-date-block">
                      <span className="history-date">{formatDateShort(dateObj)}</span>
                      <div className="history-sub-row">
                        {d.hours > 0 && (
                          <span className={`history-label ${d.hours >= goalHours ? 'label-good' : 'label-bad'}`}>
                            {d.hours >= goalHours ? 'Good Rest' : 'Sleep Debt'}
                          </span>
                        )}
                        {d.quality && d.quality > 0 && (
                          <span className="history-quality-stars">
                            {Array.from({ length: d.quality }, (_, i) => (
                              <span key={i} style={{ color: getQualityColor(d.quality!) }}><Icon name="star" size={8} /></span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="history-right">
                    <span className={`history-hours ${d.hours > 0 ? '' : 'history-no-data'}`}>
                      {d.hours > 0 ? hoursToHM(d.hours) : 'No data'}
                    </span>
                    {d.hours > 0 && (
                      <button className="history-del" onClick={() => deleteEntry(d.date)}><Icon name="trash" size={14} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Insights */}
        <section className="glass-card-static widget-sleep insights-card">
          <h3 className="section-title"><Icon name="lightbulb" size={16} /> Sleep Insights</h3>
          {insights ? (
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-icon"><Icon name="target" size={20} /></span>
                <div className="insight-body">
                  <span className="insight-label">Consistency</span>
                  <span className="insight-value" style={{ color: insights.consistencyColor }}>{insights.consistency}</span>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon"><Icon name={insights.trendIcon} size={20} /></span>
                <div className="insight-body">
                  <span className="insight-label">Weekly Trend</span>
                  <span className="insight-value">{insights.trend}</span>
                </div>
              </div>
              {insights.bestDay && (
                <div className="insight-item">
                  <span className="insight-icon"><Icon name="star" size={20} /></span>
                  <div className="insight-body">
                    <span className="insight-label">Best Sleep Day</span>
                    <span className="insight-value" style={{ color: '#4ade80' }}>{insights.bestDay.day} ({hoursToHM(insights.bestDay.avg)})</span>
                  </div>
                </div>
              )}
              {insights.worstDay && (
                <div className="insight-item">
                  <span className="insight-icon"><Icon name="alertCircle" size={20} /></span>
                  <div className="insight-body">
                    <span className="insight-label">Least Sleep Day</span>
                    <span className="insight-value" style={{ color: '#f87171' }}>{insights.worstDay.day} ({hoursToHM(insights.worstDay.avg)})</span>
                  </div>
                </div>
              )}
              {sleepDebt > 0 && (
                <div className="insight-item insight-debt">
                  <span className="insight-icon"><Icon name="alertCircle" size={20} /></span>
                  <div className="insight-body">
                    <span className="insight-label">Weekly Sleep Debt</span>
                    <span className="insight-value" style={{ color: '#f87171' }}>{hoursToHM(sleepDebt)} behind goal</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="insights-empty">
              <span style={{ fontSize: '2rem' }}><Icon name="chart" size={32} /></span>
              <p>Log at least 2 days of sleep to unlock insights</p>
            </div>
          )}
        </section>
      </div>


    </div>
  );
}
