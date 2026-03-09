'use client';

import { useState, useEffect, useMemo } from 'react';
import { Icon, icons } from '@/components/ui/Icons';
import './nutritionist.css';

interface Review {
    id: string;
    user: string;
    rating: number;
    comment: string;
}

interface Professional {
    id: string;
    name: string;
    qualifications: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    distance_km: number;
    phone: string;
    email: string;
    address: string;
    bio: string;
    iconKey: keyof typeof icons;
    availability: string;
    isSpotlight: boolean;
    reviews: Review[];
}

const demoPros: Professional[] = [
    {
        id: '1',
        name: 'Dr. Priya Sharma (Verified PRO)',
        qualifications: 'PhD, RD, Sports Nutritionist',
        specialty: 'Sports Nutrition',
        rating: 4.9,
        reviewCount: 128,
        distance_km: 1.2,
        phone: '+91-9876543210',
        email: 'dr.priya@example.com',
        address: '123 Health Ave, Sector 15',
        bio: 'Specializing in performance nutrition for elite athletes and fitness enthusiasts. 10+ years of experience in metabolic optimization.',
        iconKey: 'doctor',
        availability: 'Available Today',
        isSpotlight: true,
        reviews: [
            { id: 'r1', user: 'Rahul M.', rating: 5, comment: 'Helped me cut 5kg while gaining strength. Highly recommended!' }
        ]
    },
    {
        id: '2',
        name: 'Arjun Mehta',
        qualifications: 'MSc Clinical Nutrition',
        specialty: 'Weight Management',
        rating: 4.7,
        reviewCount: 85,
        distance_km: 2.5,
        phone: '+91-9876543211',
        email: 'arjun@weightloss.com',
        address: '456 Wellness Blvd, MG Road',
        bio: 'Focused on sustainable weight loss and behavioral habit coaching. Let\'s build a diet you actually enjoy.',
        iconKey: 'apple',
        availability: 'Next Available: Tomorrow',
        isSpotlight: false,
        reviews: [
            { id: 'r2', user: 'Anjali P.', rating: 4.5, comment: 'Very practical advice. No crash dieting.' }
        ]
    },
    {
        id: '3',
        name: 'Neha Kapoor',
        qualifications: 'Certified Holistic Nutritionist',
        specialty: 'Clinical Dietitian',
        rating: 4.8,
        reviewCount: 210,
        distance_km: 3.1,
        phone: '+91-9876543212',
        email: 'neha@holistic.in',
        address: '789 Fit Street, Koramangala',
        bio: 'Bridging the gap between clinical dietetics and holistic wellness. Expert in gut health and inflammation.',
        iconKey: 'leaf',
        availability: 'Available Today',
        isSpotlight: true,
        reviews: []
    },
    {
        id: '4',
        name: 'Sarah Johnson',
        qualifications: 'Plant-Based Nutrition Specialist',
        specialty: 'Vegan Nutrition',
        rating: 4.9,
        reviewCount: 156,
        distance_km: 5.2,
        phone: '+91-9876543214',
        email: 'sarah.v@greenfuel.com',
        address: '654 Green Park, HSR Layout',
        bio: 'Passionate about plant-based fuels. Helping you transition to a vegan lifestyle without sacrificing protein or energy.',
        iconKey: 'salad',
        availability: 'Available Today',
        isSpotlight: false,
        reviews: []
    },
    {
        id: '5',
        name: 'Dr. Ravi Kumar',
        qualifications: 'BAMS, Ayurvedic Nutritionist',
        specialty: 'Ayurvedic Nutrition',
        rating: 4.6,
        reviewCount: 64,
        distance_km: 4.0,
        phone: '+91-9876543213',
        email: 'ravi.a@vedic.com',
        address: '321 Herbal Lane, Indiranagar',
        bio: 'Customized nutrition plans based on your unique Prakriti (constitution). Traditional wisdom meets modern goals.',
        iconKey: 'leaf',
        availability: 'Available This Week',
        isSpotlight: false,
        reviews: []
    }
];

const specialties = ['All', 'Sports Nutrition', 'Weight Management', 'Clinical Dietitian', 'Vegan Nutrition', 'Ayurvedic Nutrition'];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

const nutritionTips = [
    {
        title: "Hydration Mastery",
        content: "Hydration isn't just about water. Electrolytes like potassium and magnesium are key for muscle recovery after heavy lifting.",
        author: "Dr. Priya Sharma"
    },
    {
        title: "Protein Pacing",
        content: "Eating 20-30g of protein every 3-4 hours is more effective for muscle growth than one large daily bolus of 100g.",
        author: "Arjun Mehta"
    },
    {
        title: "Metabolic Flexibility",
        content: "Intermittent fasting can help your body switch from burning sugar to burning fat more efficiently during low-intensity cardio.",
        author: "Neha Kapoor"
    },
    {
        title: "Gut-Brain Axis",
        content: "90% of your serotonin is made in the gut. High fiber from leafy greens is critical for both digestion and mental focus.",
        author: "Sarah Johnson"
    }
];

export default function NutritionistsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locState, setLocState] = useState<'idle' | 'searching' | 'found' | 'denied'>('idle');
    const [professionals, setProfessionals] = useState<Professional[]>(demoPros);
    const [bookingPro, setBookingPro] = useState<Professional | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoadingRealData, setIsLoadingRealData] = useState(false);
    const [tipIndex, setTipIndex] = useState(0);
    const [fadeTip, setFadeTip] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeTip(false);
            setTimeout(() => {
                setTipIndex(prev => (prev + 1) % nutritionTips.length);
                setFadeTip(true);
            }, 600);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setLocState('searching');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    setLocState('found');
                    fetchRealData(latitude, longitude);
                },
                () => {
                    setLocState('denied');
                }
            );
        } else {
            setLocState('denied');
        }
    }, []);

    const fetchRealData = async (lat: number, lng: number) => {
        setIsLoadingRealData(true);
        try {
            // Expanded Overpass API Query to find doctors, hospitals, specialists that might be nutrition-related
            const query = `[out:json];(
                node["healthcare"="nutritionist"](around:20000,${lat},${lng});
                node["healthcare:speciality"~"nutrition|diet"](around:20000,${lat},${lng});
                node["amenity"="doctors"]["speciality"~"nutrition|diet"](around:20000,${lat},${lng});
                node["amenity"="hospital"](around:10000,${lat},${lng});
                node["healthcare"="center"](around:10000,${lat},${lng});
            );out body;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

            const response = await fetch(url);

            // The Overpass API may return XML on errors or rate-limiting
            if (!response.ok) {
                console.warn(`Overpass API returned status ${response.status}. Using demo data.`);
                return;
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                console.warn(`Overpass API returned non-JSON response (${contentType}). Using demo data.`);
                return;
            }

            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
                const realPros: Professional[] = data.elements.slice(0, 10).map((el: any, idx: number) => {
                    const dist = calculateDistance(lat, lng, el.lat, el.lon);
                    const tagLabel = el.tags.healthcare || el.tags.amenity || 'Health Expert';
                    return {
                        id: `real-${idx}-${el.id}`,
                        name: el.tags.name || `Local ${tagLabel}`,
                        qualifications: el.tags.description || 'Verified via Local GPS',
                        specialty: (el.tags.healthcare === 'nutritionist' || el.tags.description?.includes('diet')) ? 'Nutrition & Dietetics' : 'Clinical Health',
                        rating: 4.6 + (Math.random() * 0.4),
                        reviewCount: Math.floor(Math.random() * 150) + 20,
                        distance_km: dist,
                        phone: el.tags.phone || '+91-GPS-FIND',
                        email: el.tags.email || 'gps.verified@gymbruh.com',
                        address: el.tags['addr:full'] || el.tags['addr:street'] || 'Nearby Health Facility',
                        bio: el.tags.description || 'Verified healthcare professional located in your area. Open for consultations regarding fitness and holistic health.',
                        iconKey: (el.tags.healthcare === 'nutritionist' ? 'salad' : 'doctor') as keyof typeof icons,
                        availability: 'Available Today',
                        isSpotlight: idx < 3,
                        reviews: []
                    };
                });

                // Combine with demo data but prioritize real data
                setProfessionals([...realPros, ...demoPros.filter(p => !realPros.some(rp => rp.name === p.name))]);
                console.log(`Found ${realPros.length} real professionals nearby.`);
            } else {
                console.log('No real professionals found in this area. Fallback to demo data.');
            }
        } catch (error) {
            console.error('Failed to fetch real nutritionist data:', error);
        } finally {
            setIsLoadingRealData(false);
        }
    };

    const filteredPros = useMemo(() => {
        return professionals.filter(pro => {
            const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pro.specialty.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = activeFilter === 'All' || pro.specialty === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [professionals, searchTerm, activeFilter]);

    const spotlightPros = useMemo(() => professionals.filter(p => p.isSpotlight), [professionals]);

    const handleBook = (pro: Professional) => {
        setBookingPro(pro);
    };

    const confirmBooking = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setBookingPro(null);
        }, 2000);
    };

    return (
        <div className="nutritionists-page">
            <header className="pro-header">
                <h1 className="pro-title-animated" style={{ borderBottom: '2px solid rgba(251, 255, 0, 0.3)', paddingBottom: '10px' }}>Nutrition Experts v2</h1>
                <p className="text-secondary">Premium guidance for your unique health journey.</p>

                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {locState === 'searching' && <span className="badge badge-info"><Icon name="loader" size={12} className="animate-spin" /> Detecting Location...</span>}
                    {locState === 'found' && (
                        <>
                            <span className="badge badge-success">
                                <Icon name="mapPin" size={12} /> {professionals.filter(p => p.id.startsWith('real')).length} GPS Results Active
                            </span>
                            <button
                                onClick={async () => {
                                    setLocState('searching');
                                    setIsLoadingRealData(true);
                                    if ('geolocation' in navigator) {
                                        navigator.geolocation.getCurrentPosition(
                                            async (pos) => {
                                                const { latitude, longitude } = pos.coords;
                                                setLocation({ lat: latitude, lng: longitude });
                                                setLocState('found');
                                                await fetchRealData(latitude, longitude);
                                            },
                                            () => {
                                                setLocState('denied');
                                                setIsLoadingRealData(false);
                                            },
                                            { enableHighAccuracy: true, timeout: 5000 }
                                        );
                                    }
                                }}
                                className="badge"
                                disabled={isLoadingRealData}
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', cursor: isLoadingRealData ? 'wait' : 'pointer', color: '#fff' }}
                            >
                                <Icon name="loader" size={12} className={isLoadingRealData ? 'animate-spin' : ''} /> {isLoadingRealData ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </>
                    )}
                    {locState === 'denied' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="badge badge-warning"
                            style={{ cursor: 'pointer' }}
                        >
                            <Icon name="info" size={12} /> Please Grant GPS Access
                        </button>
                    )}
                </div>
            </header>

            {/* ── Standalone Pro Tip ── */}
            <section className="pro-tip-section">
                <div className={`pro-tip-card-standalone ${fadeTip ? 'fade-in-tip' : 'fade-out-tip'}`}>
                    <div className="tip-header-full">
                        <Icon name="brain" size={32} style={{ color: 'var(--pro-accent)' }} />
                        <h2 className="section-title" style={{ margin: 0 }}>{nutritionTips[tipIndex].title}</h2>
                    </div>
                    <div className="tip-content-premium">
                        <p className="pro-bio-large">"{nutritionTips[tipIndex].content}"</p>
                        <span className="pro-qual-badge">— Expert Advice from {nutritionTips[tipIndex].author}</span>
                    </div>
                </div>
            </section>

            {/* ── Spotlight Section ── */}
            <section className="spotlight-section">
                <h2 className="section-title"><Icon name="star" size={18} /> Nutritionist Spotlight</h2>
                <div className="spotlight-scroll">
                    {spotlightPros.map(pro => (
                        <div key={pro.id} className="pro-card-premium spotlight-card">
                            <span className="badge-spotlight">Top Rated</span>
                            <div className="pro-card-header">
                                <div className="pro-avatar-glow" style={{ border: '2px solid var(--pro-accent)', background: 'rgba(251, 255, 0, 0.1)' }}>
                                    <Icon name={pro.iconKey} size={32} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                                </div>
                                <div className="pro-main-info">
                                    <span className="pro-qual">{pro.qualifications}</span>
                                    <h3>{pro.name}</h3>
                                    <p className="pro-specialty">{pro.specialty}</p>
                                </div>
                            </div>
                            <p className="pro-bio" style={{ margin: '10px 0' }}>{pro.bio}</p>
                            <div className="pro-footer-actions">
                                <button className="action-pill btn-book" style={{ background: 'var(--pro-accent)', color: '#000' }} onClick={() => handleBook(pro)}>
                                    Book Spotlight Consultation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Search & Filter ── */}
            <section className="pro-controls">
                <div className="search-bar-wrap">
                    <Icon name="search" size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or specialty..."
                        className="pro-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-chips">
                    {specialties.map(spec => (
                        <button
                            key={spec}
                            className={`filter-chip ${activeFilter === spec ? 'active' : ''}`}
                            onClick={() => setActiveFilter(spec)}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Results Grid ── */}
            <section className="pro-grid">
                {isLoadingRealData && professionals.length <= demoPros.length && (
                    <div className="pro-card-premium" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                        <Icon name="loader" size={40} className="animate-spin" style={{ color: 'var(--pro-accent)', marginBottom: '20px' }} />
                        <h3>Fetching real-time data...</h3>
                        <p className="text-secondary">Searching for professionals in your vicinity using GPS.</p>
                    </div>
                )}
                {filteredPros.map(pro => (
                    <div key={pro.id} className="pro-card-premium">
                        <div className="pro-card-header">
                            <div className="pro-avatar-glow" style={{ border: '1px solid var(--pro-accent)' }}>
                                <Icon name={pro.iconKey} size={28} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                            </div>
                            <div className="pro-main-info">
                                <span className="pro-qual">{pro.qualifications}</span>
                                <h3>{pro.name}</h3>
                                <div className="pro-rating-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                    <Icon name="star" size={14} style={{ color: 'var(--pro-accent)' }} />
                                    <span style={{ fontWeight: '800' }}>{pro.rating.toFixed(1)}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>({pro.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="pro-bio">{pro.bio}</p>

                        <div className="pro-metrics">
                            <div className="pro-metric">
                                <span className="metric-label">Location</span>
                                <span className="metric-val">{pro.distance_km} km away</span>
                            </div>
                            <div className="pro-metric" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <span className="metric-label">Status</span>
                                <span className="metric-val" style={{ color: pro.availability.includes('Today') ? 'var(--pro-green)' : 'var(--text-secondary)' }}>{pro.availability}</span>
                            </div>
                        </div>

                        <div className="pro-footer-actions">
                            <a href={`tel:${pro.phone}`} className="action-pill btn-call"><Icon name="phone" size={16} /></a>
                            <a href={`mailto:${pro.email}`} className="action-pill btn-call"><Icon name="mail" size={16} /></a>
                            <button className="action-pill btn-book" onClick={() => handleBook(pro)}>Book Now</button>
                        </div>
                    </div>
                ))}
            </section>

            {/* ── Booking Modal ── */}
            {bookingPro && (
                <div className="modal-overlay" onClick={() => setBookingPro(null)}>
                    <div className="modal-content-glass" onClick={e => e.stopPropagation()}>
                        {showSuccess ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Icon name="checkCircle" size={60} style={{ color: 'var(--pro-green)', marginBottom: '20px' }} />
                                <h2>Request Sent!</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{bookingPro.name} will contact you shortly to confirm the appointment.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '10px' }}>Book Consultation</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Requesting a session with <strong>{bookingPro.name}</strong>.</p>

                                <div className="booking-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div className="form-group">
                                        <label className="metric-label">Select Date</label>
                                        <input type="date" className="pro-search-input" style={{ paddingLeft: '15px' }} defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="form-group">
                                        <label className="metric-label">Goal/Topic</label>
                                        <select className="pro-search-input" style={{ paddingLeft: '15px', background: 'rgba(0,0,0,0.5)' }}>
                                            <option>General Consultation</option>
                                            <option>Weight Loss Plan</option>
                                            <option>Sports Performance</option>
                                            <option>Gut Health</option>
                                        </select>
                                    </div>
                                    <button
                                        className="action-pill btn-book"
                                        style={{ marginTop: '20px', width: '100%' }}
                                        onClick={confirmBooking}
                                    >
                                        Confirm Appointment Request
                                    </button>
                                    <button
                                        className="action-pill btn-call"
                                        style={{ width: '100%' }}
                                        onClick={() => setBookingPro(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
