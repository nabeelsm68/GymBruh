'use client';

import { useEffect, useState, useMemo, useRef } from 'react';

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
const GOAL_HOURS = 8;

/* ── Types ── */
interface SleepEntry {
  date: string;
  hours: number;
}

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [logDate, setLogDate] = useState(getDateKey(new Date()));
  const [logHours, setLogHours] = useState('7');
  const [logMinutes, setLogMinutes] = useState('30');

  /* ── Load all entries from localStorage ── */
  useEffect(() => {
    const loaded: SleepEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const date = key.replace(STORAGE_PREFIX, '');
        const val = parseFloat(localStorage.getItem(key) || '0');
        if (val > 0) loaded.push({ date, hours: val });
      }
    }
    loaded.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(loaded);
  }, []);

  /* ── Save entry ── */
  const saveEntry = () => {
    const h = parseInt(logHours, 10) || 0;
    const m = parseInt(logMinutes, 10) || 0;
    const total = h + m / 60;
    if (total <= 0 || total > 24) return;

    const key = STORAGE_PREFIX + logDate;
    localStorage.setItem(key, String(total));

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== logDate);
      const updated = [...filtered, { date: logDate, hours: total }];
      updated.sort((a, b) => a.date.localeCompare(b.date));
      return updated;
    });
  };

  /* ── Delete entry ── */
  const deleteEntry = (date: string) => {
    localStorage.removeItem(STORAGE_PREFIX + date);
    setEntries((prev) => prev.filter((e) => e.date !== date));
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
      return { date: dt, hours: entry?.hours || 0 };
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
      return { date: dt, hours: entry?.hours || 0 };
    });
  }, [entries]);

  const avg7 = useMemo(() => {
    const logged = last7.filter((d) => d.hours > 0);
    if (logged.length === 0) return 0;
    return logged.reduce((s, d) => s + d.hours, 0) / logged.length;
  }, [last7]);

  const isGood = avg7 >= GOAL_HOURS;

  /* ── Insights ── */
  const insights = useMemo(() => {
    const logged = entries.filter((e) => e.hours > 0);
    if (logged.length < 2) return null;

    // Consistency = std deviation of last 7 logged days
    const recent = logged.slice(-7);
    const recentAvg = recent.reduce((s, e) => s + e.hours, 0) / recent.length;
    const variance = recent.reduce((s, e) => s + Math.pow(e.hours - recentAvg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const consistency = stdDev < 0.5 ? 'Very Consistent' : stdDev < 1.0 ? 'Fairly Consistent' : stdDev < 1.5 ? 'Somewhat Irregular' : 'Irregular';
    const consistencyColor = stdDev < 0.5 ? '#4ade80' : stdDev < 1.0 ? '#60a5fa' : stdDev < 1.5 ? '#facc15' : '#f87171';

    // Trend: this week avg vs last week
    const thisWeek = last7.filter((d) => d.hours > 0);
    const prevWeekDates: string[] = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      prevWeekDates.push(getDateKey(d));
    }
    const prevWeek = prevWeekDates.map((dt) => entries.find((e) => e.date === dt)?.hours || 0).filter((h) => h > 0);

    let trend = 'Stable';
    let trendIcon = '➡️';
    if (thisWeek.length > 0 && prevWeek.length > 0) {
      const thisAvg = thisWeek.reduce((s, d) => s + d.hours, 0) / thisWeek.length;
      const prevAvg = prevWeek.reduce((s, h) => s + h, 0) / prevWeek.length;
      const diff = thisAvg - prevAvg;
      if (diff > 0.3) { trend = 'Improving'; trendIcon = '📈'; }
      else if (diff < -0.3) { trend = 'Declining'; trendIcon = '📉'; }
    }

    // Best & Worst day of week
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

  /* ── Smooth Area Chart ── */
  const chartW = 700;
  const chartH = 240;
  const chartPadL = 40;
  const chartPadR = 20;
  const chartPadT = 16;
  const chartPadB = 36;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;
  const maxHours = 12;
  const goalY = chartPadT + plotH * (1 - GOAL_HOURS / maxHours);

  const [chartAnimated, setChartAnimated] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  // Build smooth cubic bezier path
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
      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
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

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setChartAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="sleep-page">
      {/* ═══ Header ═══ */}
      <div className="sleep-header">
        <div>
          <h1 className="sleep-title">😴 Sleep Tracker</h1>
          <p className="sleep-subtitle">Monitor your rest and build better habits</p>
        </div>
      </div>

      {/* ═══ Top Row: Average + Log Form ═══ */}
      <div className="top-row">
        {/* Average Sleep Card */}
        <section className={`glass-card-static widget-sleep avg-card ${isGood ? 'avg-good' : 'avg-bad'}`}>
          <h3 className="section-title">Weekly Average</h3>
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
              <span className="avg-goal">/ {GOAL_HOURS}h</span>
            </div>
          </div>
          <div className={`avg-badge ${isGood ? 'badge-good' : 'badge-bad'}`}>
            {avg7 === 0 ? '📊 No data yet' : isGood ? '✅ Good Rest' : '⚠️ Sleep Debt'}
          </div>
        </section>

        {/* Log Form */}
        <section className="glass-card-static widget-sleep log-card">
          <h3 className="section-title">📝 Log Sleep</h3>
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
            <button className="glass-btn glass-btn-primary log-btn" onClick={saveEntry}>
              💤 Log Sleep
            </button>
          </div>
        </section>
      </div>

      {/* ═══ Sleep Trends Chart ═══ */}
      <section className="glass-card-static widget-sleep chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Sleep Trends</h3>
            <p className="chart-sub">Duration over time</p>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot legend-dot-duration" /> Duration</span>
            <span className="legend-item"><span className="legend-dot legend-dot-goal" /> 8h Goal</span>
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

            {/* 8h Goal line */}
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

            {/* X-axis date labels — show a few for readability */}
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

      {/* ═══ Bottom Row: History + Insights ═══ */}
      <div className="bottom-row">
        {/* Recent History */}
        <section className="glass-card-static widget-sleep history-card">
          <h3 className="section-title">📋 This Week</h3>
          <div className="history-list">
            {last7.slice().reverse().map((d) => {
              const dateObj = new Date(d.date + 'T00:00:00');
              return (
                <div key={d.date} className="history-item">
                  <div className="history-left">
                    <span className={`history-dot ${d.hours >= GOAL_HOURS ? 'dot-green' : d.hours > 0 ? 'dot-red' : 'dot-empty'}`} />
                    <div className="history-date-block">
                      <span className="history-date">{formatDateShort(dateObj)}</span>
                      {d.hours > 0 && (
                        <span className={`history-label ${d.hours >= GOAL_HOURS ? 'label-good' : 'label-bad'}`}>
                          {d.hours >= GOAL_HOURS ? 'Good Rest' : 'Sleep Debt'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="history-right">
                    <span className={`history-hours ${d.hours > 0 ? '' : 'history-no-data'}`}>
                      {d.hours > 0 ? hoursToHM(d.hours) : 'No data'}
                    </span>
                    {d.hours > 0 && (
                      <button className="history-del" onClick={() => deleteEntry(d.date)}>×</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Insights */}
        <section className="glass-card-static widget-sleep insights-card">
          <h3 className="section-title">💡 Sleep Insights</h3>
          {insights ? (
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-icon">🎯</span>
                <div className="insight-body">
                  <span className="insight-label">Consistency</span>
                  <span className="insight-value" style={{ color: insights.consistencyColor }}>{insights.consistency}</span>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">{insights.trendIcon}</span>
                <div className="insight-body">
                  <span className="insight-label">Weekly Trend</span>
                  <span className="insight-value">{insights.trend}</span>
                </div>
              </div>
              {insights.bestDay && (
                <div className="insight-item">
                  <span className="insight-icon">🌟</span>
                  <div className="insight-body">
                    <span className="insight-label">Best Sleep Day</span>
                    <span className="insight-value" style={{ color: '#4ade80' }}>{insights.bestDay.day} ({hoursToHM(insights.bestDay.avg)})</span>
                  </div>
                </div>
              )}
              {insights.worstDay && (
                <div className="insight-item">
                  <span className="insight-icon">😵</span>
                  <div className="insight-body">
                    <span className="insight-label">Least Sleep Day</span>
                    <span className="insight-value" style={{ color: '#f87171' }}>{insights.worstDay.day} ({hoursToHM(insights.worstDay.avg)})</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="insights-empty">
              <span style={{ fontSize: '2rem' }}>📊</span>
              <p>Log at least 2 days of sleep to unlock insights</p>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .sleep-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeInUp 0.5s ease-out;
        }

        /* ── Header ── */
        .sleep-header {
          margin-bottom: 4px;
        }
        .sleep-title {
          font-size: 1.6rem;
          font-weight: 800;
        }
        .sleep-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #d4d4d8;
          letter-spacing: 0.02em;
          margin-bottom: 18px;
        }

        .widget-sleep {
          padding: 24px;
        }

        /* ── Top Row ── */
        .top-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── Average Card ── */
        .avg-ring-wrap {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 18px;
        }
        .avg-ring {
          width: 100%;
          height: 100%;
        }
        .avg-ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          display: flex;
          flex-direction: column;
        }
        .avg-value {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
        }
        .avg-good .avg-value { color: #4ade80; }
        .avg-bad .avg-value { color: #f87171; }
        .avg-goal {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .avg-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          text-align: center;
        }
        .badge-good {
          background: rgba(74,222,128,0.1);
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.2);
        }
        .badge-bad {
          background: rgba(248,113,113,0.1);
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.2);
        }

        /* ── Log Form ── */
        .log-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .duration-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .log-btn {
          margin-top: 4px;
        }

        /* ── Chart ── */
        .chart-card {
          overflow: hidden;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .chart-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .chart-legend {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .legend-dot-duration {
          background: #FBFF00;
          box-shadow: 0 0 6px rgba(251,255,0,0.5);
        }
        .legend-dot-goal {
          background: transparent;
          border: 2px dashed rgba(251,255,0,0.4);
        }
        .chart-scroll {
          overflow-x: auto;
          margin: 0 -8px;
          padding: 0 8px;
        }
        .sleep-chart {
          width: 100%;
          min-width: 500px;
          height: auto;
        }
        .chart-label {
          fill: var(--text-muted);
          font-size: 9px;
          font-family: var(--font-family);
        }
        .chart-grid {
          stroke: rgba(255,255,255,0.05);
          stroke-width: 0.5;
          stroke-dasharray: 4 4;
        }
        .goal-line {
          stroke: rgba(251,255,0,0.35);
          stroke-width: 1.5;
          stroke-dasharray: 6 4;
        }
        .chart-date-label {
          fill: var(--text-muted);
          font-size: 9px;
          font-family: var(--font-family);
          font-weight: 600;
        }

        /* Area + Line animation */
        .area-path {
          opacity: 0;
          transition: opacity 1.2s ease-out 0.3s;
        }
        .area-visible {
          opacity: 1;
        }
        .line-path {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          transition: stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .line-visible {
          stroke-dashoffset: 0;
        }

        /* Data dots */
        .data-dot-group {
          opacity: 0;
        }
        .dot-visible {
          animation: dotFadeIn 0.4s ease-out forwards;
        }
        @keyframes dotFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .data-dot {
          transition: r 0.2s ease;
          cursor: pointer;
        }
        .data-dot:hover {
          r: 7;
        }
        .dot-label {
          fill: var(--text-secondary);
          font-size: 8px;
          font-family: var(--font-family);
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .data-dot-group:hover .dot-label {
          opacity: 1;
        }

        /* ── Bottom Row ── */
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── History ── */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-xs);
          border: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s ease;
        }
        .history-item:hover {
          background: rgba(255,255,255,0.06);
        }
        .history-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .history-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-green {
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.4);
        }
        .dot-red {
          background: #f87171;
          box-shadow: 0 0 8px rgba(248,113,113,0.4);
        }
        .dot-empty {
          background: rgba(255,255,255,0.1);
        }
        .history-date-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .history-date {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .history-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .label-good { color: #4ade80; }
        .label-bad { color: #f87171; }
        .history-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .history-hours {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .history-no-data {
          color: var(--text-muted);
          font-weight: 400;
          font-size: 0.8rem;
        }
        .history-del {
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
        .history-del:hover {
          background: rgba(248,113,113,0.25);
        }

        /* ── Insights ── */
        .insights-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .insight-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-xs);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .insight-icon {
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .insight-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .insight-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .insight-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .insights-empty {
          text-align: center;
          padding: 24px 16px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .bottom-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .top-row {
            grid-template-columns: 1fr;
          }
          .bottom-row {
            grid-template-columns: 1fr;
          }
          .sleep-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
