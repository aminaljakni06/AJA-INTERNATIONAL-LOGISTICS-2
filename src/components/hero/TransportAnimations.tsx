import React from 'react';

export const TransportAnimations: React.FC = () => {
  return (
    <g className="transport-animations-group">
      {/* AIR FREIGHT ANIMATION */}
      <g className="animate-float-slow" transform="translate(430, 240)">
        <g transform="rotate(-15)">
          {/* Aircraft SVG Icon */}
          <path
            d="M 0 -8 L 4 0 L 12 2 L 4 4 L 2 10 L -2 10 L -1 4 L -8 2 L -8 -1 Z"
            fill="#4DE7FF"
            stroke="#050711"
            strokeWidth="0.5"
          />
          {/* Air Freight Badge */}
          <rect x="15" y="-12" width="70" height="18" rx="4" fill="#0B1220" fillOpacity="0.9" stroke="rgba(77,231,255,0.4)" strokeWidth="0.8" />
          <text x="20" y="0" fill="#4DE7FF" fontSize="8" fontFamily="Inter" fontWeight="700">
            ✈ AIR FREIGHT
          </text>
        </g>
      </g>

      {/* OCEAN FREIGHT ANIMATION */}
      <g className="animate-float-reverse" transform="translate(470, 390)">
        {/* Cargo Ship SVG Icon */}
        <path
          d="M -10 2 L 10 2 L 8 8 L -8 8 Z M -6 -2 L 2 -2 L 2 2 L -6 2 Z M 3 -4 L 6 -4 L 6 2 L 3 2 Z"
          fill="#4DA3FF"
        />
        {/* Ocean Freight Badge */}
        <rect x="14" y="-10" width="85" height="18" rx="4" fill="#0B1220" fillOpacity="0.9" stroke="rgba(77,163,255,0.4)" strokeWidth="0.8" />
        <text x="20" y="2" fill="#FFFFFF" fontSize="8" fontFamily="Inter" fontWeight="700">
          🚢 OCEAN FREIGHT
        </text>
      </g>

      {/* ROAD FREIGHT ANIMATION */}
      <g transform="translate(320, 360)">
        {/* Truck SVG Icon */}
        <rect x="-8" y="-4" width="10" height="8" rx="1" fill="#8B6CFF" />
        <rect x="2" y="-2" width="5" height="6" rx="1" fill="#4DE7FF" />
        <circle cx="-4" cy="5" r="2" fill="#FFFFFF" />
        <circle cx="4" cy="5" r="2" fill="#FFFFFF" />
        {/* Road Freight Badge */}
        <rect x="12" y="-12" width="80" height="18" rx="4" fill="#0B1220" fillOpacity="0.9" stroke="rgba(139,108,255,0.4)" strokeWidth="0.8" />
        <text x="18" y="0" fill="#8B6CFF" fontSize="8" fontFamily="Inter" fontWeight="700">
          🚚 ROAD FREIGHT
        </text>
      </g>

      {/* LAST MILE ANIMATION */}
      <g transform="translate(370, 480)">
        <circle cx="0" cy="0" r="4" fill="#4DE7FF" />
        <rect x="8" y="-10" width="68" height="18" rx="4" fill="#0B1220" fillOpacity="0.9" stroke="rgba(77,231,255,0.4)" strokeWidth="0.8" />
        <text x="14" y="2" fill="#4DE7FF" fontSize="8" fontFamily="Inter" fontWeight="700">
          📍 LAST MILE
        </text>
      </g>
    </g>
  );
};

export default TransportAnimations;
