import React, { useState, useEffect, useRef } from 'react';
import { DigitalGlobe } from './DigitalGlobe';
import { LogisticsRoutes } from './LogisticsRoutes';
import { LogisticsNodes } from './LogisticsNodes';
import { TransportAnimations } from './TransportAnimations';
import { TrackingCard } from './TrackingCard';
import { FloatingServiceCards } from './FloatingServiceCards';

export interface LogisticsNetworkProps {
  className?: string;
}

export const LogisticsNetwork: React.FC<LogisticsNetworkProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Mouse parallax interaction (disabled on touch or reduced motion)
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Clamp movement max 12px
      setParallax({
        x: Math.max(-12, Math.min(12, deltaX * 12)),
        y: Math.max(-12, Math.min(12, deltaY * 12)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center w-[min(760px,90vw)] h-[min(760px,90vw)] xl:w-[min(760px,52vw)] xl:h-[min(760px,52vw)] mx-auto ${className}`}
      style={{
        transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0px)`,
        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 rounded-full bg-[#4DA3FF]/10 blur-3xl pointer-events-none scale-90" />

      {/* SVG Digital Globe & Network Composition */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full drop-shadow-[0_0_50px_rgba(77,163,255,0.25)] relative z-10"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#4DE7FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050711" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Digital Globe */}
        <DigitalGlobe />

        {/* 2. Global Routes */}
        <LogisticsRoutes />

        {/* 3. Logistics Hub Nodes */}
        <LogisticsNodes />

        {/* 4. Transport Animations */}
        <TransportAnimations />
      </svg>

      {/* 5. Floating Glassmorphism Cards */}
      <FloatingServiceCards />

      {/* 6. Highly Visible Tracking UI Card Overlay */}
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-30 animate-float-slow">
        <TrackingCard />
      </div>

      {/* 20. Global Data Counters (Neutral Placeholders) */}
      <div className="absolute top-[2%] right-[20%] z-20 hidden md:flex items-center gap-4 px-4 py-2 rounded-2xl bg-[#0B1220]/80 backdrop-blur-md border border-white/10 shadow-xl font-mono text-[11px] text-[#AAB6C8]">
        <div className="flex flex-col">
          <span className="text-white font-bold">[GLOBAL COVERAGE]</span>
          <span className="text-[10px]">Countries</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[#4DE7FF] font-bold">24/7</span>
          <span className="text-[10px]">Visibility</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[#4DA3FF] font-bold">01</span>
          <span className="text-[10px]">Connected Platform</span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsNetwork;
