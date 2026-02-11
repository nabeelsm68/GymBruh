'use client';

import { useState, useEffect } from 'react';

interface Professional {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    distance_km: number;
    phone: string;
    email: string;
    address: string;
    image_emoji: string;
    availability: string;
}

// Demo data — in production, this would come from a real API
const demoProfessionals: Professional[] = [
    {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialty: 'Sports Nutrition',
        rating: 4.9,
        distance_km: 1.2,
        phone: '+91-9876543210',
        email: 'dr.priya@example.com',
        address: '123 Health Ave, Sector 15',
        image_emoji: '👩‍⚕️',
        availability: 'Available Today',
    },
    {
        id: '2',
        name: 'Dr. Arjun Mehta',
        specialty: 'Clinical Dietitian',
        rating: 4.7,
        distance_km: 2.5,
        phone: '+91-9876543211',
        email: 'dr.arjun@example.com',
        address: '456 Wellness Blvd, MG Road',
        image_emoji: '👨‍⚕️',
        availability: 'Next Available: Tomorrow',
    },
    {
        id: '3',
        name: 'Neha Kapoor',
        specialty: 'Certified Nutritionist & Fitness Coach',
        rating: 4.8,
        distance_km: 3.1,
        phone: '+91-9876543212',
        email: 'neha@example.com',
        address: '789 Fit Street, Koramangala',
        image_emoji: '💪',
        availability: 'Available Today',
    },
    {
        id: '4',
        name: 'Dr. Ravi Kumar',
        specialty: 'Ayurvedic Nutrition',
        rating: 4.6,
        distance_km: 4.0,
        phone: '+91-9876543213',
        email: 'dr.ravi@example.com',
        address: '321 Herbal Lane, Indiranagar',
        image_emoji: '🌿',
        availability: 'Available This Week',
    },
    {
        id: '5',
        name: 'Sarah Johnson',
        specialty: 'Vegan & Plant-Based Nutrition',
        rating: 4.9,
        distance_km: 5.2,
        phone: '+91-9876543214',
        email: 'sarah@example.com',
        address: '654 Green Park, HSR Layout',
        image_emoji: '🥗',
        availability: 'Available Today',
    },
    {
        id: '6',
        name: 'Dr. Amit Patel',
        specialty: 'Pediatric & Family Nutrition',
        rating: 4.5,
        distance_km: 6.8,
        phone: '+91-9876543215',
        email: 'dr.amit@example.com',
        address: '987 Care Center, Whitefield',
        image_emoji: '👨‍👩‍👧',
        availability: 'Next Available: Thursday',
    },
];

export default function NutritionistsPage() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState('');
    const [professionals] = useState<Professional[]>(demoProfessionals);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    setLocationError('Location access denied. Showing demo results.');
                }
            );
        }
    }, []);

    const getDirectionsUrl = (address: string) => {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
    };

    return (
        <div className="nutritionists-page">
            <div className="page-header">
                <h1>👨‍⚕️ Nutritionists Near You</h1>
                <p className="page-subtitle">
                    Find certified professionals in your area for personalized guidance.
                </p>
                {location && (
                    <div className="badge badge-success" style={{ marginTop: '8px' }}>
                        📍 Location detected
                    </div>
                )}
                {locationError && (
                    <div className="badge badge-warning" style={{ marginTop: '8px' }}>
                        {locationError}
                    </div>
                )}
            </div>

            <div className="professionals-list">
                {professionals.map((pro) => (
                    <div key={pro.id} className="glass-card-static pro-card">
                        <div className="pro-main">
                            <div className="pro-avatar">
                                <span>{pro.image_emoji}</span>
                            </div>
                            <div className="pro-info">
                                <h3 className="pro-name">{pro.name}</h3>
                                <p className="pro-specialty">{pro.specialty}</p>
                                <div className="pro-meta">
                                    <span className="pro-rating" style={{ color: '#facc15' }}>
                                        {renderStars(pro.rating)} {pro.rating}
                                    </span>
                                    <span className="pro-distance">📍 {pro.distance_km} km</span>
                                </div>
                                <span className={`badge ${pro.availability.includes('Today') ? 'badge-success' : 'badge-info'}`} style={{ marginTop: '6px' }}>
                                    {pro.availability}
                                </span>
                            </div>
                        </div>

                        <div className="pro-actions">
                            <a href={`tel:${pro.phone}`} className="glass-btn glass-btn-sm pro-action-btn">
                                📞 Call
                            </a>
                            <a href={`mailto:${pro.email}`} className="glass-btn glass-btn-sm pro-action-btn">
                                ✉️ Email
                            </a>
                            <a
                                href={getDirectionsUrl(pro.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-btn glass-btn-sm glass-btn-primary pro-action-btn"
                            >
                                🗺️ Directions
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .nutritionists-page {
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

        .professionals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pro-card {
          padding: 24px;
        }

        .pro-main {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .pro-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: var(--glass-bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          flex-shrink: 0;
        }

        .pro-info {
          flex: 1;
        }

        .pro-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .pro-specialty {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .pro-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .pro-distance {
          color: var(--text-muted);
        }

        .pro-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pro-action-btn {
          flex: 1;
          min-width: 100px;
          text-decoration: none;
          text-align: center;
        }

        @media (max-width: 500px) {
          .pro-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
}
