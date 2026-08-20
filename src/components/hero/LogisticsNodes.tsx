import React from 'react';

export const LogisticsNodes: React.FC = () => {
  const hubs = [
    { id: 'dubai', x: 420, y: 330, name: 'DUBAI HUB', active: true },
    { id: 'riyadh', x: 400, y: 350, name: 'RIYADH HUB', active: false },
    { id: 'london', x: 400, y: 270, name: 'LONDON HUB', active: false },
    { id: 'singapore', x: 520, y: 310, name: 'SINGAPORE HUB', active: false },
    { id: 'newyork', x: 250, y: 300, name: 'NEW YORK HUB', active: false },
  ];

  return (
    <g className="logistics-nodes-group">
      {hubs.map((hub) => (
        <g key={hub.id} transform={`translate(${hub.x}, ${hub.y})`}>
          {/* Outer Pulsing Aura */}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="none"
            stroke="#4DE7FF"
            strokeWidth="1"
            className="animate-ping opacity-50"
          />

          {/* Node Outer Glow */}
          <circle cx="0" cy="0" r="6" fill="#4DA3FF" opacity="0.4" />

          {/* Node Center Solid Dot */}
          <circle cx="0" cy="0" r="4" fill="#4DE7FF" />

          {/* Tooltip Badge for Hub */}
          {hub.active && (
            <g transform="translate(10, -18)">
              <rect x="0" y="0" width="105" height="22" rx="6" fill="#0B1220" fillOpacity="0.95" stroke="#4DE7FF" strokeWidth="1" />
              <text x="8" y="14" fill="#FFFFFF" fontSize="8" fontFamily="Inter" fontWeight="700">
                LOGISTICS HUB
              </text>
              <circle cx="88" cy="11" r="3" fill="#4DE7FF" className="animate-pulse" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
};

export default LogisticsNodes;
