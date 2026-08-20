import React, { useState, useEffect } from 'react';

export const BackgroundEffects: React.FC = () => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Layer 1: Base Dark Oceanic Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#050B14] to-[#082F49]" />

      {/* Layer 2: Subtle Electric Cyan & Oceanic Brand Color Glows */}
      <div
        className="absolute top-1/4 right-[-5%] w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] rounded-full opacity-35 blur-[140px] transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.25), rgba(0, 240, 255, 0.15) 50%, transparent 100%)',
          transform: `translate3d(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px, 0)`,
        }}
      />

      <div
        className="absolute bottom-1/4 left-[-10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full opacity-30 blur-[130px] transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(15, 76, 117, 0.4), transparent 70%)',
          transform: `translate3d(${-mouseOffset.x}px, ${-mouseOffset.y}px, 0)`,
        }}
      />

      {/* Layer 3: Subtle Logistics Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.08] hidden sm:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0EA5E9 1px, transparent 1px),
            linear-gradient(to bottom, #0EA5E9 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Layer 4: Global Shipping Route Lines & Connection Points Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="routeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4C75" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#EA580C" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0F4C75" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="routeGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F4C75" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#0F4C75" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5DA9E9" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Global Arc Routes */}
        <path
          d="M 150 650 Q 400 250, 720 420 T 1300 280"
          stroke="url(#routeGradient1)"
          strokeWidth="2"
          strokeDasharray="6 8"
          fill="none"
          className="animate-pulse"
        />

        <path
          d="M 220 300 Q 600 550, 950 320 T 1380 520"
          stroke="url(#routeGradient2)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Fine Digital Grid Dot Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0F4C75 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default BackgroundEffects;


