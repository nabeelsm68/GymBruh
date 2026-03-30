import React from 'react';

/* ═══════════════════════════════════════════════════════
   GymBruh SVG Icon Library
   ─────────────────────────────────────────────────────
   All icons are 24×24 line-style SVGs with
   stroke="currentColor", matching the sidebar aesthetic.
   ═══════════════════════════════════════════════════════ */

interface IconProps {
    name: keyof typeof icons;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function Icon({ name, size = 20, className, style }: IconProps) {
    const svg = icons[name];
    if (!svg) return null;
    return (
        <span className={`gb-icon ${className || ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0, ...style }}>
            {React.cloneElement(svg as React.ReactElement<React.SVGAttributes<SVGElement>>, { width: size, height: size })}
        </span>
    );
}

// ── Shared SVG props ──
const s = { fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const icons = {
    // ───── Fitness ─────
    fire: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2c.5 3.5-1.5 6-1.5 6A5.5 5.5 0 0 0 14 16a5 5 0 0 0 3-4.5c0-2.5-1-4-2-5.5a8.5 8.5 0 0 1-1-4z" />
            <path d="M10 16.5a2.5 2.5 0 0 1 0-5c.5 0 1 .2 1.5.5A3 3 0 0 1 13 14.5a2.5 2.5 0 0 1-3 2z" />
        </svg>
    ),
    muscle: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M3 12h1l2-4 2 8 2-6 2 4h2l2-4 2 8 2-6h1" />
        </svg>
    ),
    trophy: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
            <path d="M18 9h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" />
            <path d="M6 4v6a6 6 0 0 0 12 0V4" />
            <path d="M10 16v2h4v-2" />
            <path d="M8 22h8" />
            <path d="M12 18v4" />
        </svg>
    ),
    runner: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="14" cy="4" r="2" />
            <path d="M7 22l3-7 3 2v5" />
            <path d="M17 11l-3-4-3 1-2 3" />
            <path d="M5 16l3-3 3 2" />
        </svg>
    ),
    flexibility: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="4" r="2" />
            <path d="M6 20l3-10" />
            <path d="M18 20l-3-10" />
            <path d="M9 10h6" />
            <path d="M12 6v4" />
        </svg>
    ),
    dumbbell: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M6.5 6.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5" />
            <path d="M17.5 6.5H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2.5" />
            <rect x="6.5" y="4" width="3" height="16" rx="1" />
            <rect x="14.5" y="4" width="3" height="16" rx="1" />
            <path d="M9.5 12h5" />
        </svg>
    ),
    lightning: (
        <svg viewBox="0 0 24 24" {...s}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    scale: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 3v18" />
            <path d="M4 7h16" />
            <path d="M4 7l4 8h0a4 4 0 0 0 0 0" />
            <path d="M4 7c0 0 1.5 5.5 4 8" />
            <path d="M20 7c0 0-1.5 5.5-4 8" />
            <circle cx="12" cy="3" r="1" />
        </svg>
    ),

    // ───── Food & Diet ─────
    utensils: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
    ),
    salad: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M3 11h18" />
            <path d="M5 11c0 5.5 2.5 9 7 9s7-3.5 7-9" />
            <path d="M9 7c-.5-2 .5-4 3-4s3.5 2 3 4" />
            <path d="M12 7v4" />
        </svg>
    ),
    leaf: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22c-4-2-8-8-8-14 6 0 12 2 16 8-2 4-5 5-8 6z" />
            <path d="M4 8c8-1 13 3 16 8" />
        </svg>
    ),
    pizza: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2L2 20h20L12 2z" />
            <circle cx="10" cy="13" r="1" />
            <circle cx="14" cy="13" r="1" />
            <circle cx="12" cy="9" r="1" />
        </svg>
    ),
    meat: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M15 11c2.5-2.5 4-4 4-6s-1-3-3-3-3 1-3 3" />
            <path d="M4 20c3 1 7 0 10-3s4-7 3-10L7 17c-2 2-4 2-3 3z" />
            <circle cx="10" cy="14" r="1" />
        </svg>
    ),
    apple: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 4a8 8 0 0 1 8 6.2c0 7.3-8 11.8-8 11.8z" />
            <path d="M12 4V2" />
        </svg>
    ),

    // ───── Health & Wellness ─────
    moon: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    sun: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    ),
    sunrise: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M17 18a5 5 0 0 0-10 0" />
            <line x1="12" y1="9" x2="12" y2="2" />
            <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
            <line x1="1" y1="18" x2="3" y2="18" />
            <line x1="21" y1="18" x2="23" y2="18" />
            <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
            <line x1="23" y1="22" x2="1" y2="22" />
            <polyline points="8 6 12 2 16 6" />
        </svg>
    ),
    brain: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2a5 5 0 0 1 4 8v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a5 5 0 0 1 4-8z" />
            <path d="M8 14v4a4 4 0 0 0 8 0v-4" />
            <path d="M12 2v4" />
            <path d="M8 6c-1-1-3-.5-3 1.5S7 10 8 10" />
            <path d="M16 6c1-1 3-.5 3 1.5S17 10 16 10" />
        </svg>
    ),
    sleep: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M2 4h6l-6 6h6" />
            <path d="M12 8h4l-4 4h4" />
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    stethoscope: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4 4v4a5 5 0 0 0 10 0V4" />
            <path d="M9 13v3a4 4 0 0 0 8 0v-1" />
            <circle cx="19" cy="14" r="2" />
            <path d="M4 4h2" />
            <path d="M12 4h2" />
        </svg>
    ),
    pill: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M8.5 2.5a4.95 4.95 0 0 0-7 7l7 7a4.95 4.95 0 0 0 7-7l-7-7z" />
            <path d="M5 12l7-7" />
            <path d="M16 11h5" />
            <path d="M16 15h5" />
            <path d="M18.5 9v8" />
        </svg>
    ),
    bandage: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M18 2l4 4-12 12-4-4L18 2z" />
            <path d="M6 18L2 22" />
            <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    water: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
        </svg>
    ),

    // ───── UI Actions ─────
    camera: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    ),
    cameraPlus: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    loader: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
    sparkles: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
            <path d="M20 4l.7 2.1L23 7l-2.3.9L20 10l-.7-2.1L17 7l2.3-.9L20 4z" />
        </svg>
    ),
    rocket: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    save: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    checkCircle: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" {...s}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    clipboard: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    ),
    target: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    lightbulb: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24" {...s}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    trendUp: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    trendDown: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    ),
    edit: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    hourglass: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M5 3h14" />
            <path d="M5 21h14" />
            <path d="M7 3v4l4 5-4 5v4" />
            <path d="M17 3v4l-4 5 4 5v4" />
        </svg>
    ),
    gear: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),

    // ───── People & Communication ─────
    wave: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M7 11V7a3 3 0 0 1 6 0v4" />
            <path d="M16 7V5a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8H9a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0" />
            <path d="M13 7V3a2 2 0 0 1 4 0v4" />
        </svg>
    ),
    doctor: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <line x1="12" y1="11" x2="12" y2="14" />
            <line x1="10.5" y1="12.5" x2="13.5" y2="12.5" />
        </svg>
    ),
    family: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="8" cy="5" r="2.5" />
            <circle cx="16" cy="5" r="2.5" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h2" />
            <path d="M15 15h2a4 4 0 0 1 4 4v2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M9 21v-1a3 3 0 0 1 6 0v1" />
        </svg>
    ),
    phone: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22 6 12 13 2 6" />
        </svg>
    ),
    mapPin: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    map: (
        <svg viewBox="0 0 24 24" {...s}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    delivery: (
        <svg viewBox="0 0 24 24" {...s}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),

    // ───── Lifestyle & Mood ─────
    lock: (
        <svg viewBox="0 0 24 24" {...s}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    couch: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
            <path d="M2 14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v0" />
            <path d="M4 14v3h16v-3" />
            <line x1="6" y1="17" x2="6" y2="20" />
            <line x1="18" y1="17" x2="18" y2="20" />
        </svg>
    ),
    walk: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="5" r="2" />
            <path d="M10 22l2-7" />
            <path d="M14 22l-2-7" />
            <path d="M8 13l4-4 4 4" />
            <path d="M12 9v4" />
        </svg>
    ),
    home: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
    ),
    burger: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4 15h16a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4z" />
            <path d="M4 11h16" />
            <path d="M20 11a8 8 0 0 0-16 0" />
        </svg>
    ),
    medal: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="15" r="6" />
            <path d="M8.21 13.89L7 2h10l-1.21 11.89" />
            <path d="M12 9v6" />
            <path d="M9 12h6" />
        </svg>
    ),
    handshake: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M11 17l-5-5 3-3 2 2 5-5 3 3-5 5" />
            <path d="M3 7l4-4 4 4" />
            <path d="M13 3l4 4 4-4" />
            <path d="M7 11l-4 4v4h4l2-2" />
            <path d="M17 11l4 4v4h-4l-2-2" />
        </svg>
    ),
    sunglasses: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="8" cy="14" r="4" />
            <circle cx="16" cy="14" r="4" />
            <path d="M12 14h0" />
            <path d="M4 14h0" />
            <path d="M20 14h0" />
            <path d="M2 10l3 1" />
            <path d="M22 10l-3 1" />
        </svg>
    ),
    masks: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M15 11c0-2.2-1.3-4-3-4s-3 1.8-3 4" />
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    alertCircle: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),

    // ───── Allergy-specific icons ─────
    peanut: (
        <svg viewBox="0 0 24 24" {...s}>
            <ellipse cx="12" cy="8" rx="4" ry="5" />
            <ellipse cx="12" cy="17" rx="3.5" ry="4.5" />
            <path d="M12 13v0" />
        </svg>
    ),
    nut: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4v4" />
            <path d="M8 8l3 3" />
            <path d="M16 8l-3 3" />
        </svg>
    ),
    milk: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M8 2h8l2 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6l2-4z" />
            <path d="M6 6h12" />
            <path d="M6 12c2 1 4 1 6 0s4-1 6 0" />
        </svg>
    ),
    wheat: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22V8" />
            <path d="M8 6l4 2 4-2" />
            <path d="M6 10l6 3 6-3" />
            <path d="M7 14l5 2 5-2" />
        </svg>
    ),
    egg: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2C8 2 5 8 5 14a7 7 0 0 0 14 0c0-6-3-12-7-12z" />
        </svg>
    ),
    fish: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M6.5 12c3-6 10-6 14-2l-4 2 4 2c-4 4-11 4-14-2z" />
            <path d="M2 12l3-2v4l-3-2z" />
            <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    shrimp: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M18 6a4 4 0 0 0-4-4 8 8 0 0 0-8 8c0 3 2 5 5 5" />
            <path d="M11 15c0 3-2 5-2 7h6c0-2-2-4-2-7" />
            <path d="M18 6c2 0 4 1 4 3s-2 3-4 3" />
        </svg>
    ),
    bean: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2C7 2 3 6 3 12s4 10 9 10 9-4 9-10S17 2 12 2z" />
            <path d="M12 2c-2 4-2 8 0 12s2 8 0 8" />
        </svg>
    ),
    honey: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M10 4l-2 6h8l-2-6" />
            <path d="M6 10v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-8H6z" />
            <path d="M10 4h4" />
            <path d="M12 2v2" />
        </svg>
    ),
    corn: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2c-3 0-5 4-5 10s2 10 5 10 5-4 5-10S15 2 12 2z" />
            <path d="M12 2v20" />
            <path d="M7 8h10" />
            <path d="M7 14h10" />
        </svg>
    ),

    // ───── Extra diet icons ─────
    fork: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
        </svg>
    ),
    avocado: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2C8 2 4 7 4 14a8 8 0 0 0 16 0c0-7-4-12-8-12z" />
            <circle cx="12" cy="15" r="3" />
        </svg>
    ),
    bone: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M5 5a2 2 0 1 1 3 2l-1 1 6 6 1-1a2 2 0 1 1 2 3 2 2 0 1 1-3-2l1-1-6-6-1 1a2 2 0 1 1-2-3z" />
        </svg>
    ),
    olive: (
        <svg viewBox="0 0 24 24" {...s}>
            <ellipse cx="12" cy="12" rx="6" ry="8" />
            <path d="M12 4c-2 3-2 8 0 8s2-5 0-8" />
        </svg>
    ),
    desert: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M2 22h20" />
            <path d="M12 2v4" />
            <path d="M8 8c0-2 1.8-4 4-4s4 2 4 4" />
            <path d="M4 22c0-3 2-6 4-8h8c2 2 4 5 4 8" />
        </svg>
    ),
    faucet: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 2v6" />
            <path d="M6 8h12" />
            <path d="M6 8c-2 0-3 1-3 3v2h6" />
            <path d="M9 13v4a5 5 0 0 0 10 0v-4" />
            <path d="M18 8v5" />
        </svg>
    ),
    waves: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M2 6c3-2 5 2 8 0s5-2 8 0s5 2 8 0" />
            <path d="M2 12c3-2 5 2 8 0s5-2 8 0s5 2 8 0" />
            <path d="M2 18c3-2 5 2 8 0s5-2 8 0s5 2 8 0" />
        </svg>
    ),

    // ───── Mood icons ─────
    calm: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    ),
    neutral: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    ),
    angry: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
            <path d="M7.5 8l3 1" />
            <path d="M16.5 8l-3 1" />
        </svg>
    ),
    exploding: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
        </svg>
    ),
    happy: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    ),
    tired: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <path d="M8 9l2 1" />
            <path d="M14 9l2 1" />
        </svg>
    ),
    stressed: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    ),
    sports: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
        </svg>
    ),
    leafy: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M6 3v18" />
            <path d="M6 9c8-2 12 2 12 8" />
            <path d="M6 15c4-1 6 0 8 2" />
        </svg>
    ),
    plant: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22V10" />
            <path d="M4 10c0-4 4-8 8-8s8 4 8 8c-4 0-8 2-8 6-4 0-8-2-8-6z" />
        </svg>
    ),
    goldMedal: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="15" r="6" />
            <path d="M9 2l3 7 3-7" />
            <path d="M12 15v0" />
            <path d="M10 13l2 2 2-2" />
        </svg>
    ),

    // ───── Journal icons ─────
    book: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="9" y1="7" x2="16" y2="7" />
            <line x1="9" y1="11" x2="14" y2="11" />
        </svg>
    ),
    calendarDays: (
        <svg viewBox="0 0 24 24" {...s}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <rect x="7" y="13" width="2" height="2" rx="0.5" />
            <rect x="11" y="13" width="2" height="2" rx="0.5" />
            <rect x="15" y="13" width="2" height="2" rx="0.5" />
            <rect x="7" y="17" width="2" height="2" rx="0.5" />
            <rect x="11" y="17" width="2" height="2" rx="0.5" />
        </svg>
    ),
    heartFill: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    thought: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="13" y2="12" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    ),
    wine: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M8 2h8l-1 7a5 5 0 0 1-3 4.5A5 5 0 0 1 9 9L8 2z" />
            <path d="M12 13.5V22" />
            <path d="M8 22h8" />
        </svg>
    ),
    droplet: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5L12 2 8 9.5c-2 1.6-3 3.5-3 5.5a7 7 0 0 0 7 7z" />
        </svg>
    ),
    plus: (
        <svg viewBox="0 0 24 24" {...s}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    chevronRight: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" {...s}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),

    // ───── Settings Hub Icons ─────
    user: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    award: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    zap: (
        <svg viewBox="0 0 24 24" {...s}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    droplets: (
        <svg viewBox="0 0 24 24" {...s}>
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 14.69c1.43 0 2.6-1.19 2.6-2.64 0-.75-.37-1.47-1.11-2.08S12.73 8.5 12.56 7.6c-.19.94-.74 1.85-1.49 2.45s-1.11 1.32-1.11 2.08c0 1.45 1.17 2.56 2.6 2.56z" />
            <path d="M17 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S17.29 6.75 17 5.3c-.29 1.45-1.14 2.84-2.29 3.76S13 11.1 13 12.25c0 2.22 1.8 4.05 4 4.05z" />
        </svg>
    ),
    activity: (
        <svg viewBox="0 0 24 24" {...s}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
};

export default Icon;
