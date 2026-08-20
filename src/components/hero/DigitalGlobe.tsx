import React from 'react';

export const DigitalGlobe: React.FC = () => {
  return (
    <g className="digital-globe-group">
      {/* Outer Atmospheric Glow */}
      <circle
        cx="400"
        cy="400"
        r="280"
        fill="url(#globeGlow)"
        className="opacity-60"
      />

      {/* Main Globe Sphere Outline */}
      <circle
        cx="400"
        cy="400"
        r="250"
        fill="#070B16"
        fillOpacity="0.8"
        stroke="rgba(77, 163, 255, 0.25)"
        strokeWidth="1.5"
      />

      {/* Latitude Lines */}
      <ellipse cx="400" cy="400" rx="250" ry="80" fill="none" stroke="rgba(77, 163, 255, 0.15)" strokeWidth="1" />
      <ellipse cx="400" cy="400" rx="250" ry="160" fill="none" stroke="rgba(77, 163, 255, 0.15)" strokeWidth="1" />
      <ellipse cx="400" cy="400" rx="250" ry="220" fill="none" stroke="rgba(77, 163, 255, 0.12)" strokeWidth="1" />

      {/* Longitude Lines */}
      <ellipse cx="400" cy="400" rx="80" ry="250" fill="none" stroke="rgba(77, 163, 255, 0.15)" strokeWidth="1" />
      <ellipse cx="400" cy="400" rx="160" ry="250" fill="none" stroke="rgba(77, 163, 255, 0.15)" strokeWidth="1" />
      <ellipse cx="400" cy="400" rx="220" ry="250" fill="none" stroke="rgba(77, 163, 255, 0.12)" strokeWidth="1" />

      {/* Equatorial Ring */}
      <line x1="150" y1="400" x2="650" y2="400" stroke="rgba(77, 231, 255, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="400" y1="150" x2="400" y2="650" stroke="rgba(77, 231, 255, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Stylized Continents Outlines (SVG Paths overlay) */}
      <g stroke="rgba(77, 231, 255, 0.45)" strokeWidth="1.5" fill="rgba(77, 163, 255, 0.08)">
        {/* Europe & Middle East */}
        <path d="M 380 280 Q 420 270 440 290 T 460 350 T 420 380 T 370 340 Z" />
        {/* Asia */}
        <path d="M 450 260 Q 520 250 560 300 T 580 370 T 510 390 T 460 320 Z" />
        {/* Africa */}
        <path d="M 370 350 Q 430 360 440 440 T 400 500 T 350 430 Z" />
        {/* Americas */}
        <path d="M 220 270 Q 280 260 290 340 T 260 420 T 200 480 Z" />
        {/* Australia */}
        <path d="M 540 460 Q 590 470 580 520 T 530 510 Z" />
      </g>

      {/* Center Globe Control Badge Label */}
      <g transform="translate(400, 400)">
        <rect x="-85" y="-22" width="170" height="44" rx="10" fill="#0B1220" fillOpacity="0.9" stroke="rgba(77, 231, 255, 0.4)" strokeWidth="1" />
        <text textAnchor="middle" y="-4" fill="#FFFFFF" fontSize="10" fontFamily="Inter" fontWeight="700" letterSpacing="1">
          GLOBAL CONTROL
        </text>
        <text textAnchor="middle" y="12" fill="#4DE7FF" fontSize="9" fontFamily="Inter" fontWeight="600" letterSpacing="0.5">
          24/7 LOGISTICS VISIBILITY
        </text>
      </g>
    </g>
  );
};

export default DigitalGlobe;
