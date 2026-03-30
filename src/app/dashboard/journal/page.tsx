'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icons';
import { initUserId, userKey } from '@/lib/user-storage';
import './journal.css';

/* ═══ Types ═══ */
type MoodKey = 'happy' | 'relaxed' | 'energized' | 'grateful' | 'tired' | 'stressed' | 'neutral' | 'inspired';
interface Entry { id: string; date: string; time: string; note: string; photos: string[]; mood: MoodKey; rating: number; tags: string[]; cuisine: string; location: string; isFavorite: boolean; }
interface Goal { perWeek: number; }
interface XPData { total: number; level: number; }

/* ═══ Constants ═══ */
const sk = () => userKey('cj-entries'), gk = () => userKey('cj-goal'), xk = () => userKey('cj-xp');
const MOODS: { key: MoodKey; icon: string; label: string; color: string }[] = [
  { key: 'happy', icon: 'happy', label: 'Happy', color: '#facc15' },
  { key: 'relaxed', icon: 'calm', label: 'Relaxed', color: '#60a5fa' },
  { key: 'energized', icon: 'lightning', label: 'Energized', color: '#fb923c' },
  { key: 'grateful', icon: 'sparkles', label: 'Grateful', color: '#a78bfa' },
  { key: 'tired', icon: 'tired', label: 'Tired', color: '#94a3b8' },
  { key: 'stressed', icon: 'stressed', label: 'Stressed', color: '#f87171' },
  { key: 'neutral', icon: 'neutral', label: 'Neutral', color: '#71717a' },
  { key: 'inspired', icon: 'sparkles', label: 'Inspired', color: '#34d399' },
];
const TAGS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Fine Dining', 'Street Food', 'Homemade', 'Dessert', 'Healthy', 'Comfort Food'];
const CUISINES = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'American', 'French', 'Korean', 'Mediterranean', 'Other'];
const LEVELS = [{ name: 'Taste Explorer', xp: 0 }, { name: 'Flavor Curator', xp: 100 }, { name: 'Culinary Connoisseur', xp: 300 }, { name: 'Gastronomy Maestro', xp: 600 }];
const BADGES = [
  { id: 'streak7', label: '7-Day Streak', icon: 'fire', check: (e: Entry[], s: number) => s >= 7 },
  { id: 'entries30', label: '30 Entries', icon: 'book', check: (e: Entry[]) => e.length >= 30 },
  { id: 'cuisines10', label: '10 Cuisines', icon: 'globe', check: (e: Entry[]) => new Set(e.map(x => x.cuisine).filter(Boolean)).size >= 10 },
  { id: 'photos', label: 'Photo Master', icon: 'camera', check: (e: Entry[]) => e.filter(x => x.photos.length > 0).length >= 20 },
  { id: 'streak3', label: '3-Day Streak', icon: 'sparkles', check: (e: Entry[], s: number) => s >= 3 },
  { id: 'entries10', label: '10 Entries', icon: 'book', check: (e: Entry[]) => e.length >= 10 },
];
const PROMPTS = ["What emotion did this meal bring?", "Describe the aroma in 3 words.", "Would you recommend this?", "What made this meal special?", "Rate the presentation.", "Who did you share this with?"];

/* ═══ Helpers ═══ */
const dk = (d: Date) => d.toISOString().split('T')[0];
const mk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const fmt = (s: string) => { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const ws = (d: Date) => { const t = new Date(d); t.setDate(t.getDate() - t.getDay()); return dk(t); };
const ago = (date: string, time: string) => { const t = new Date(`${date}T${time || '12:00'}`); const m = Math.floor((Date.now() - t.getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : d < 7 ? `${d}d ago` : fmt(date); };
const getLevel = (xp: number) => { for (let i = LEVELS.length - 1; i >= 0; i--)if (xp >= LEVELS[i].xp) return i; return 0; };
const nextLevelXP = (lvl: number) => lvl < LEVELS.length - 1 ? LEVELS[lvl + 1].xp : LEVELS[lvl].xp;

function getGreeting(): { text: string; icon: string } { const h = new Date().getHours(); if (h < 12) return { text: 'Good Morning', icon: 'sun' }; if (h < 18) return { text: 'Good Afternoon', icon: 'sunrise' }; return { text: 'Good Evening', icon: 'wine' }; }

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState<Goal>({ perWeek: 3 });
  const [xp, setXp] = useState<XPData>({ total: 0, level: 0 });
  const [tab, setTab] = useState<'home' | 'journal' | 'insights' | 'reflections'>('home');
  const [showModal, setShowModal] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [selMonth, setSelMonth] = useState(mk(new Date()));
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  // Composer
  const [cNote, setCNote] = useState('');
  const [cMood, setCMood] = useState<MoodKey>('happy');
  const [cPhotos, setCPhotos] = useState<string[]>([]);
  const [cDate, setCDate] = useState(dk(new Date()));
  const [cRating, setCRating] = useState(4);
  const [cTags, setCTags] = useState<string[]>([]);
  const [cCuisine, setCCuisine] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [dragging, setDragging] = useState(false);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load
  useEffect(() => {
    initUserId().then(() => {
      try { const s = localStorage.getItem(sk()); if (s) setEntries(JSON.parse(s)); } catch { }
      try { const g = localStorage.getItem(gk()); if (g) setGoal(JSON.parse(g)); } catch { }
      try { const x = localStorage.getItem(xk()); if (x) setXp(JSON.parse(x)); } catch { }
    });
  }, []);

  const save = (u: Entry[]) => { setEntries(u); localStorage.setItem(sk(), JSON.stringify(u)); };
  const saveGoal = (g: Goal) => { setGoal(g); localStorage.setItem(gk(), JSON.stringify(g)); setEditGoal(false); };
  const saveXP = (x: XPData) => { setXp(x); localStorage.setItem(xk(), JSON.stringify(x)); };

  const addXP = useCallback((pts: number) => {
    setXp(prev => {
      const t = prev.total + pts; const nl = getLevel(t); const x = { total: t, level: nl };
      localStorage.setItem(xk(), JSON.stringify(x));
      if (nl > prev.level) setLevelUp(LEVELS[nl].name); return x;
    });
  }, []);

  // Photos
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(f => {
      const r = new FileReader(); r.onload = () => {
        const img = new window.Image(); img.onload = () => {
          const c = document.createElement('canvas'); let w = img.width, h = img.height; const mx = 400;
          if (w > h) { h = (h / w) * mx; w = mx; } else { w = (w / h) * mx; h = mx; }
          c.width = w; c.height = h; c.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setCPhotos(p => [...p, c.toDataURL('image/jpeg', 0.7)]);
        }; img.src = r.result as string;
      }; r.readAsDataURL(f);
    });
  };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); };

  // Create
  const createEntry = () => {
    if (!cNote.trim() && cPhotos.length === 0) return;
    const now = new Date();
    const entry: Entry = { id: Date.now().toString(), date: cDate, time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, note: cNote.trim(), photos: cPhotos, mood: cMood, rating: cRating, tags: cTags, cuisine: cCuisine, location: cLocation, isFavorite: false };
    save([entry, ...entries]);
    let pts = 10; if (cPhotos.length > 0) pts += 5; if (cNote.length > 200) pts += 5; addXP(pts);
    setCNote(''); setCMood('happy'); setCPhotos([]); setCDate(dk(new Date())); setCRating(4); setCTags([]); setCCuisine(''); setCLocation(''); setShowModal(false);
  };

  const toggleFav = (id: string) => { save(entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e)); };
  const delEntry = (id: string) => { save(entries.filter(e => e.id !== id)); };

  // Computed
  const sorted = useMemo(() => [...entries].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)), [entries]);
  const favs = useMemo(() => sorted.filter(e => e.isFavorite), [sorted]);
  const streak = useMemo(() => { let c = 0; const t = new Date(); for (let i = 0; i < 365; i++) { const d = new Date(t); d.setDate(t.getDate() - i); if (entries.some(e => e.date === dk(d))) c++; else if (i > 0) break; } return c; }, [entries]);
  const weekProg = useMemo(() => { const w = ws(new Date()); return { done: entries.filter(e => e.date >= w).length, target: goal.perWeek }; }, [entries, goal]);
  const latestPhoto = useMemo(() => { for (const e of sorted) if (e.photos.length > 0) return e.photos[0]; return null; }, [sorted]);
  const lvl = getLevel(xp.total); const lvlName = LEVELS[lvl].name; const nxt = nextLevelXP(lvl); const lvlPct = lvl < LEVELS.length - 1 ? ((xp.total - LEVELS[lvl].xp) / (nxt - LEVELS[lvl].xp)) * 100 : 100;
  const earnedBadges = useMemo(() => BADGES.map(b => ({ ...b, earned: b.check(entries, streak) })), [entries, streak]);
  const displayEntries = filter === 'favorites' ? favs : sorted;
  const greeting = getGreeting();

  // Monthly insights
  const monthEntries = useMemo(() => entries.filter(e => mk(new Date(e.date + 'T00:00:00')) === selMonth), [entries, selMonth]);
  const moodCounts = useMemo(() => { const c: Record<string, number> = {}; monthEntries.forEach(e => { c[e.mood] = (c[e.mood] || 0) + 1; }); return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 3); }, [monthEntries]);
  const cuisineCounts = useMemo(() => { const c: Record<string, number> = {}; entries.forEach(e => { if (e.cuisine) c[e.cuisine] = (c[e.cuisine] || 0) + 1; }); return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 5); }, [entries]);
  const timeDist = useMemo(() => { let m = 0, a = 0, ev = 0; entries.forEach(e => { const h = parseInt(e.time?.split(':')[0] || '12'); if (h < 12) m++; else if (h < 18) a++; else ev++; }); return { morning: m, afternoon: a, evening: ev }; }, [entries]);
  const avgRating = useMemo(() => { const r = entries.filter(e => e.rating > 0); return r.length ? r.reduce((s, e) => s + e.rating, 0) / r.length : 0; }, [entries]);
  const avMonths = useMemo(() => { const s = new Set(entries.map(e => mk(new Date(e.date + 'T00:00:00')))); s.add(mk(new Date())); return Array.from(s).sort().reverse(); }, [entries]);
  const fmtMonth = (k: string) => { const [y, m] = k.split('-'); return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };

  // Heatmap (last 84 days = 12x7)
  const heatmap = useMemo(() => { const cells: number[] = []; const today = new Date(); for (let i = 83; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const key = dk(d); const cnt = entries.filter(e => e.date === key).length; cells.push(Math.min(cnt, 4)); } return cells; }, [entries]);

  // On This Day
  const onThisDay = useMemo(() => { const today = dk(new Date()).slice(5); return entries.filter(e => e.date.slice(5) === today && e.date !== dk(new Date())); }, [entries]);

  // AI personality
  const personality = useMemo(() => {
    if (entries.length < 3) return null;
    const topMood = moodCounts[0] ? MOODS.find(m => m.key === moodCounts[0][0]) : null;
    const topCuisine = cuisineCounts[0] ? cuisineCounts[0][0] : 'varied';
    const timeLabel = timeDist.evening >= timeDist.morning && timeDist.evening >= timeDist.afternoon ? 'evening' : timeDist.morning >= timeDist.afternoon ? 'morning' : 'afternoon';
    return `You gravitate toward ${topCuisine.toLowerCase()} cuisine with a ${topMood?.label.toLowerCase() || 'balanced'} emotional baseline. Your entries peak in the ${timeLabel}, suggesting a preference for ${timeLabel === 'evening' ? 'wind-down comfort meals' : 'energizing daytime bites'}. With ${entries.length} entries and a ${streak}-day streak, you're building a beautiful food story.`;
  }, [entries, moodCounts, cuisineCounts, timeDist, streak]);

  // Donut chart SVG
  const donutPaths = useMemo(() => { const colors = ['#D4FF00', '#FFB703', '#A3B18A', '#60a5fa', '#a78bfa']; const total = cuisineCounts.reduce((s, [, c]) => s + c, 0); if (!total) return []; let cum = 0; return cuisineCounts.map(([, count], i) => { const pct = count / total; const start = cum * 360; cum += pct; const end = cum * 360; const large = pct > 0.5 ? 1 : 0; const r = 50; const sx = 50 + r * Math.cos((start - 90) * Math.PI / 180); const sy = 50 + r * Math.sin((start - 90) * Math.PI / 180); const ex = 50 + r * Math.cos((end - 90) * Math.PI / 180); const ey = 50 + r * Math.sin((end - 90) * Math.PI / 180); return { d: `M50 50 L${sx} ${sy} A${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`, fill: colors[i % colors.length] }; }); }, [cuisineCounts]);

  const weekRingPct = Math.min((weekProg.done / Math.max(weekProg.target, 1)) * 100, 100);
  const ringCirc = 2 * Math.PI * 34; const ringOff = ringCirc * (1 - weekRingPct / 100);

  const TAB_ICONS: Record<string, string> = { home: 'home', journal: 'book', insights: 'chart', reflections: 'fire' };

  return (<div className="jp">
    {/* ═══ HEADER ═══ */}
    <div className="jp-head">
      <div><h1 className="jp-h1"><Icon name="book" size={26} style={{ color: 'var(--lime)' }} /> <span className="serif">Food Journal</span></h1><p className="jp-sub">Your cinematic food story</p></div>
      <div className="glass-badge"><Icon name="sparkles" size={14} /> {lvlName}</div>
    </div>

    {/* ═══ TABS ═══ */}
    <div className="tabs">
      {(['home', 'journal', 'insights', 'reflections'] as const).map(t => (
        <button key={t} className={`tab ${tab === t ? 'act' : ''}`} onClick={() => setTab(t)}>
          <Icon name={TAB_ICONS[t] as any} size={14} /> {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>

    {/* ═══════════ HOME TAB ═══════════ */}
    {tab === 'home' && <>
      {/* Hero */}
      <div className="hero">
        {latestPhoto && <div className="hero-bg" style={{ backgroundImage: `url(${latestPhoto})` }} />}
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-left">
            <h2 className="greet"><span className="serif">{greeting.text}</span> <Icon name={greeting.icon as any} size={24} style={{ color: 'var(--lime)' }} /></h2>
            <p className="hero-tagline">Capture today&apos;s flavor</p>
            {streak > 0 && <div className="streak-badge"><span className="flame"><Icon name="fire" size={14} /></span> {streak} day streak</div>}
          </div>
          <div className="ring-wrap">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#D4FF00" strokeWidth="4" strokeLinecap="round" strokeDasharray={ringCirc} strokeDashoffset={ringOff} transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className="ring-label"><span className="ring-val">{weekProg.done}/{weekProg.target}</span><span className="ring-sub">THIS WEEK</span></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="gc stat glass-animate" style={{ animationDelay: '0s' }}><div className="st-icon i1"><Icon name="book" size={18} /></div><div><div className="st-val">{entries.length}</div><div className="st-lbl">Entries</div></div></div>
        <div className="gc stat glass-animate" style={{ animationDelay: '0.05s' }}><div className="st-icon i2"><Icon name="camera" size={18} /></div><div><div className="st-val">{entries.reduce((s, e) => s + e.photos.length, 0)}</div><div className="st-lbl">Photos</div></div></div>
        <div className="gc stat glass-animate" style={{ animationDelay: '0.1s' }}><div className="st-icon i3"><Icon name="fire" size={18} /></div><div><div className="st-val">{streak}</div><div className="st-lbl">Streak</div></div></div>
        <div className="gc stat glass-animate" style={{ animationDelay: '0.15s' }}><div className="st-icon i4"><Icon name="lightning" size={18} /></div><div><div className="st-val">{xp.total}</div><div className="st-lbl">XP</div></div></div>
      </div>

      {/* Goal */}
      <div className="gc glass-animate" style={{ padding: '16px 20px', animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="target" size={14} style={{ color: 'var(--lime)' }} /> Weekly Goal</span>
          {editGoal ? <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" className="f-input" style={{ width: 50, padding: '4px 8px', textAlign: 'center' }} min={1} max={7} value={goal.perWeek} onChange={e => setGoal({ perWeek: parseInt(e.target.value) || 3 })} />
            <button className="submit-btn" style={{ width: 'auto', padding: '6px 14px', marginTop: 0, fontSize: '.7rem' }} onClick={() => saveGoal(goal)}>Save</button>
          </div> : <button onClick={() => setEditGoal(true)} style={{ background: 'none', border: '1px solid var(--brd)', borderRadius: 16, padding: '3px 10px', fontSize: '.65rem', fontWeight: 700, color: '#a1a1aa', cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>{goal.perWeek}x/week <Icon name="edit" size={11} /></button>}
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(weekRingPct, 100)}%`, background: weekProg.done >= weekProg.target ? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'linear-gradient(90deg,#D4FF00,#e6eb00)', transition: 'width .8s ease' }} />
        </div>
      </div>

      {/* Recent Entries */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '-8px' }}>Recent Entries</h3>
      {sorted.length === 0 ? <div className="gc empty"><div className="empty-icon"><Icon name="book" size={48} style={{ opacity: 0.3 }} /></div><h3>Your food story begins here</h3><p>Capture your first meal, tag your mood, and start building your personal food diary.</p><button className="empty-cta" onClick={() => setShowModal(true)}><Icon name="edit" size={14} /> Create First Entry</button></div>
        : <div className="masonry">{sorted.slice(0, 6).map(e => {
          const md = MOODS.find(m => m.key === e.mood); return (
            <article key={e.id} className="gc m-card glass-animate">
              {e.photos[0] && <img src={e.photos[0]} alt="" className="m-photo" onClick={() => setPhotoSrc(e.photos[0])} />}
              <div className="m-body">
                <div className="m-mood">
                  <span className="m-mood-badge" style={{ background: `${md?.color}18`, color: md?.color, border: `1px solid ${md?.color}30` }}><Icon name={md?.icon as any} size={13} /> {md?.label}</span>
                  <div className="m-stars">{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= e.rating ? '#FFB703' : '#3f3f46' }}><Icon name="star" size={12} /></span>)}</div>
                </div>
                {e.note && <p className="m-note">{e.note}</p>}
                {e.tags.length > 0 && <div className="m-tags">{e.tags.map(t => <span key={t} className="m-tag">{t}</span>)}</div>}
                <div className="m-foot"><span>{ago(e.date, e.time)}</span><button className={`fav-btn ${e.isFavorite ? 'act' : ''}`} onClick={() => toggleFav(e.id)}><Icon name="star" size={14} /></button></div>
              </div>
            </article>
          );
        })}</div>}
    </>}

    {/* ═══════════ JOURNAL TAB ═══════════ */}
    {tab === 'journal' && <>
      <div style={{ display: 'flex', gap: 6, marginBottom: '-8px' }}>
        <button className={`tag-chip ${filter === 'all' ? 'sel' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`tag-chip ${filter === 'favorites' ? 'sel' : ''}`} onClick={() => setFilter('favorites')}><Icon name="star" size={11} /> Favorites</button>
      </div>
      {displayEntries.length === 0 ? <div className="gc empty"><div className="empty-icon"><Icon name={filter === 'favorites' ? 'star' : 'book'} size={48} style={{ opacity: 0.3 }} /></div><h3>{filter === 'favorites' ? 'No favorites yet' : 'No entries yet'}</h3><p>{filter === 'favorites' ? 'Star entries to collect them here' : 'Start your cinematic food story'}</p></div>
        : <div className="masonry">{displayEntries.map(e => {
          const md = MOODS.find(m => m.key === e.mood); return (
            <article key={e.id} className="gc m-card glass-animate">
              {e.photos[0] && <img src={e.photos[0]} alt="" className="m-photo" onClick={() => setPhotoSrc(e.photos[0])} />}
              <div className="m-body">
                <div className="m-mood">
                  <span className="m-mood-badge" style={{ background: `${md?.color}18`, color: md?.color, border: `1px solid ${md?.color}30` }}><Icon name={md?.icon as any} size={13} /> {md?.label}</span>
                  <div className="m-stars">{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= e.rating ? '#FFB703' : '#3f3f46' }}><Icon name="star" size={12} /></span>)}</div>
                </div>
                {e.location && <div style={{ fontSize: '.7rem', color: '#71717a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="mapPin" size={11} /> {e.location}</div>}
                {e.note && <p className="m-note">{e.note}</p>}
                {e.tags.length > 0 && <div className="m-tags">{e.tags.map(t => <span key={t} className="m-tag">{t}</span>)}</div>}
                <div className="m-foot">
                  <span>{fmt(e.date)}{e.cuisine ? ` · ${e.cuisine}` : ''}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className={`fav-btn ${e.isFavorite ? 'act' : ''}`} onClick={() => toggleFav(e.id)}><Icon name="star" size={14} /></button>
                    <button className="fav-btn" onClick={() => delEntry(e.id)} style={{ fontSize: '.7rem' }}><Icon name="trash" size={13} /></button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}</div>}
    </>}

    {/* ═══════════ INSIGHTS TAB ═══════════ */}
    {tab === 'insights' && <>
      <div className="insight-grid">
        {/* Heatmap */}
        <div className="gc insight-full glass-animate"><div className="ins-title"><Icon name="calendarDays" size={16} style={{ color: 'var(--lime)' }} /> Activity Heatmap (12 weeks)</div>
          <div className="heatmap">{heatmap.map((v, i) => <div key={i} className={`hm-cell hm-${v}`} title={`${v} entries`} />)}</div>
        </div>

        {/* Cuisine Donut */}
        <div className="gc glass-animate"><div className="ins-title"><Icon name="utensils" size={16} style={{ color: 'var(--amber)' }} /> Cuisine Breakdown</div>
          {cuisineCounts.length > 0 ? <div className="donut-wrap">
            <svg viewBox="0 0 100 100" width="100" height="100">{donutPaths.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)}<circle cx="50" cy="50" r="28" fill="#0a0a0a" /></svg>
            <div className="donut-legend">{cuisineCounts.map(([name, count], i) => { const colors = ['#D4FF00', '#FFB703', '#A3B18A', '#60a5fa', '#a78bfa']; return <div key={name} className="donut-item"><div className="donut-dot" style={{ background: colors[i % colors.length] }} />{name} ({count})</div>; })}</div>
          </div> : <p style={{ color: '#71717a', fontSize: '.8rem' }}>Log cuisines to see breakdown</p>}
        </div>

        {/* Satisfaction */}
        <div className="gc glass-animate"><div className="ins-title"><Icon name="star" size={16} style={{ color: '#FFB703' }} /> Avg Satisfaction</div>
          <div style={{ textAlign: 'center', padding: '10px 0' }}><span style={{ fontSize: '2rem', fontWeight: 800, color: '#FFB703' }}>{avgRating.toFixed(1)}</span><span style={{ fontSize: '.85rem', color: '#71717a' }}> / 5</span>
            <div className="m-stars" style={{ justifyContent: 'center', marginTop: 6 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= Math.round(avgRating) ? '#FFB703' : '#3f3f46', fontSize: '1.2rem' }}><Icon name="star" size={18} /></span>)}</div>
          </div>
        </div>

        {/* Time Pattern */}
        <div className="gc insight-full glass-animate"><div className="ins-title"><Icon name="clock" size={16} style={{ color: '#a78bfa' }} /> Eating Patterns</div>
          <div className="time-bars">{[{ label: 'Morning', val: timeDist.morning, color: '#fb923c' }, { label: 'Afternoon', val: timeDist.afternoon, color: '#D4FF00' }, { label: 'Evening', val: timeDist.evening, color: '#a78bfa' }].map(t => { const mx = Math.max(timeDist.morning, timeDist.afternoon, timeDist.evening, 1); return <div key={t.label} className="time-bar-item"><span className="time-bar-label">{t.label}</span><div className="time-bar-track"><div className="time-bar-fill" style={{ width: `${(t.val / mx) * 100}%`, background: t.color }} /></div><span className="time-bar-count">{t.val}</span></div>; })}</div>
        </div>

        {/* AI Summary */}
        {personality && <div className="gc insight-full glass-animate"><div className="ins-title"><Icon name="brain" size={16} style={{ color: 'var(--lime)' }} /> Food Personality</div><div className="ai-summary">{personality}</div></div>}

        {/* Badges */}
        <div className="gc insight-full glass-animate"><div className="ins-title"><Icon name="trophy" size={16} style={{ color: 'var(--amber)' }} /> Badges</div>
          <div className="badges">{earnedBadges.map(b => <div key={b.id} className={`badge ${b.earned ? 'earned' : 'locked'}`}><Icon name={b.icon as any} size={14} /> {b.label}</div>)}</div>
        </div>
      </div>
    </>}

    {/* ═══════════ REFLECTIONS TAB ═══════════ */}
    {tab === 'reflections' && <>
      {/* On This Day */}
      {onThisDay.length > 0 && <div className="gc otd-card glass-animate"><div className="otd-label"><Icon name="camera" size={14} /> On This Day</div>{onThisDay.map(e => <div key={e.id} style={{ marginBottom: 8 }}>
        {e.photos[0] && <img src={e.photos[0]} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 8, maxHeight: 200, objectFit: 'cover' }} />}
        <p className="otd-note">{e.note || 'A meal memory'}</p>
        <span style={{ fontSize: '.65rem', color: '#71717a' }}>{fmt(e.date)}</span>
      </div>)}</div>}

      {/* Monthly Nav */}
      <div className="gc month-nav glass-animate">
        <button className="month-arrow" onClick={() => { const i = avMonths.indexOf(selMonth); if (i < avMonths.length - 1) setSelMonth(avMonths[i + 1]); }}>‹</button>
        <span className="month-label">{fmtMonth(selMonth)}</span>
        <button className="month-arrow" onClick={() => { const i = avMonths.indexOf(selMonth); if (i > 0) setSelMonth(avMonths[i - 1]); }}>›</button>
      </div>

      {/* Monthly Stats */}
      {monthEntries.length > 0 ? <>
        <div className="highlight-grid">
          <div className="gc hl-card glass-animate"><div className="hl-emoji"><Icon name="book" size={24} style={{ color: 'var(--lime)' }} /></div><div className="hl-val">{monthEntries.length}</div><div className="hl-lbl">Entries</div></div>
          <div className="gc hl-card glass-animate"><div className="hl-emoji"><Icon name="camera" size={24} style={{ color: 'var(--amber)' }} /></div><div className="hl-val">{monthEntries.reduce((s, e) => s + e.photos.length, 0)}</div><div className="hl-lbl">Photos</div></div>
          <div className="gc hl-card glass-animate"><div className="hl-emoji"><Icon name="star" size={24} style={{ color: '#FFB703' }} /></div><div className="hl-val">{(monthEntries.reduce((s, e) => s + e.rating, 0) / monthEntries.length).toFixed(1)}</div><div className="hl-lbl">Avg Rating</div></div>
          <div className="gc hl-card glass-animate"><div className="hl-emoji"><Icon name="heartFill" size={24} style={{ color: '#f87171' }} /></div><div className="hl-val">{monthEntries.filter(e => e.isFavorite).length}</div><div className="hl-lbl">Favorites</div></div>
        </div>
        {moodCounts.length > 0 && <div className="gc glass-animate" style={{ padding: 20 }}><div className="ins-title">Top Moods</div>
          <div style={{ display: 'flex', gap: 12 }}>{moodCounts.map(([key, count], i) => {
            const m = MOODS.find(x => x.key === key); return <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--brd)' }}>
              <span style={{ fontWeight: 800, color: '#71717a', fontSize: '.7rem' }}>#{i + 1}</span><Icon name={m?.icon as any} size={18} style={{ color: m?.color }} /><span style={{ fontSize: '.75rem', fontWeight: 700, color: m?.color }}>{m?.label}</span><span style={{ fontSize: '.65rem', color: '#52525b' }}>({count})</span>
            </div>;
          })}</div>
        </div>}
      </> : <div className="gc empty"><div className="empty-icon"><Icon name="calendarDays" size={48} style={{ opacity: 0.3 }} /></div><h3>No entries for {fmtMonth(selMonth)}</h3></div>}
    </>}

    {/* ═══ FAB ═══ */}
    <button className="fab" onClick={() => setShowModal(true)}>+</button>

    {/* ═══ NEW ENTRY MODAL ═══ */}
    {showModal && <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
      <div className="modal">
        <div className="modal-head"><span className="modal-title"><Icon name="sparkles" size={16} style={{ color: 'var(--lime)' }} /> New Entry</span><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>

        <div className="form-group"><label className="form-label">Date</label><input type="date" className="f-input" value={cDate} onChange={e => setCDate(e.target.value)} /></div>

        <div className="form-group"><label className="form-label"><Icon name="camera" size={13} /> Food Photo</label>
          <div className={`drop-zone ${dragging ? 'dragging' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
            <div className="dz-icon"><Icon name="cameraPlus" size={32} /></div><div className="dz-text">Drop photos or click to upload</div><div className="dz-sub">JPEG, PNG · Max 5 photos</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }} />
          {cPhotos.length > 0 && <div className="photo-row">{cPhotos.map((s, i) => <div key={i} className="photo-thumb"><img src={s} alt="" /><button className="photo-rm" onClick={() => setCPhotos(p => p.filter((_, j) => j !== i))}>✕</button></div>)}</div>}
        </div>

        <div className="form-group"><label className="form-label">How are you feeling?</label>
          <div className="mood-grid">{MOODS.map(m => <button key={m.key} className={`mood-chip ${cMood === m.key ? 'sel' : ''}`} style={{ borderColor: cMood === m.key ? m.color : 'transparent', background: cMood === m.key ? `${m.color}12` : undefined }} onClick={() => setCMood(m.key)}>
            <span className="mood-emoji"><Icon name={m.icon as any} size={22} /></span><span className="mood-name" style={{ color: cMood === m.key ? m.color : undefined }}>{m.label}</span>
          </button>)}</div>
        </div>

        <div className="form-group"><label className="form-label">Rating</label>
          <div className="rating-row">{[1, 2, 3, 4, 5].map(s => <button key={s} className={`rate-star ${s <= cRating ? 'lit' : ''}`} onClick={() => setCRating(s)}><Icon name="star" size={20} /></button>)}</div>
        </div>

        <div className="form-group"><label className="form-label"><Icon name="thought" size={13} /> {prompt}</label>
          <textarea className="f-input f-textarea" placeholder="Write your thoughts..." value={cNote} onChange={e => setCNote(e.target.value)} />
        </div>

        <div className="form-group"><label className="form-label">Tags</label>
          <div className="tag-row">{TAGS.map(t => <button key={t} className={`tag-chip ${cTags.includes(t) ? 'sel' : ''}`} onClick={() => setCTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}>{t}</button>)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group"><label className="form-label">Cuisine</label><select className="f-input" value={cCuisine} onChange={e => setCCuisine(e.target.value)}><option value="">Select...</option>{CUISINES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="form-group"><label className="form-label"><Icon name="mapPin" size={13} /> Location</label><input className="f-input" placeholder="Restaurant name..." value={cLocation} onChange={e => setCLocation(e.target.value)} /></div>
        </div>

        <button className="submit-btn" onClick={createEntry}>Save Entry <Icon name="sparkles" size={14} /></button>
      </div>
    </div>}

    {/* Photo Viewer */}
    {photoSrc && <div className="pv" onClick={() => setPhotoSrc(null)}><button className="pv-close">✕</button><img src={photoSrc} alt="Full" /></div>}

    {/* Level Up */}
    {levelUp && <div className="levelup-bg"><div className="gc" style={{ textAlign: 'center', padding: 40 }}>
      <div className="levelup-emoji"><Icon name="trophy" size={48} style={{ color: 'var(--lime)' }} /></div><div className="levelup-title">Level Up!</div><div className="levelup-sub">You&apos;re now a <strong>{levelUp}</strong></div>
      <button className="levelup-btn" onClick={() => setLevelUp(null)}>Continue</button>
    </div></div>}
  </div>);
}
