import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymBruh – AI-Powered Health & Fitness',
  description: 'Your personalized AI health & fitness companion. Track macros, scan food, get custom workout and diet plans, and find nutritionists near you.',
  keywords: ['fitness', 'health', 'AI', 'workout', 'diet', 'macro tracker', 'food scanner'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="breathing-bg" />
        <div className="stars-global" />
        <div className="stars-global stars-global-2" />
        <div className="stars-global stars-global-3" />
        <div className="stars-global-4" />
        {children}
      </body>
    </html>
  );
}
