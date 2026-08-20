import React from 'react';

export const LogisticsRoutes: React.FC = () => {
  // Routes connecting coordinates on our 800x800 viewBox
  const routes = [
    { id: 'route-asia-me', d: 'M 520,310 Q 470,290 420,330' },
    { id: 'route-me-eu', d: 'M 420,330 Q 400,280 400,270' },
    { id: 'route-eu-na', d: 'M 400,270 Q 300,220 250,300' },
    { id: 'route-me-af', d: 'M 420,330 Q 390,400 380,450' },
    { id: 'route-asia-au', d: 'M 520,310 Q 560,420 560,480' },
  ];

  return (
    <g className="logistics-routes-group">
      {routes.map((route) => (
        <g key={route.id}>
          {/* Base Curved Line - Gentian Blue */}
          <path
            d={route.d}
            fill="none"
            stroke="var(--color-brand-gentian-blue, #0F4C75)"
            strokeWidth="2"
            strokeOpacity="0.5"
          />

          {/* Flowing Pulse Glow along route - Active Route in Brand White */}
          <path
            d={route.d}
            fill="none"
            stroke="var(--color-brand-white, #FFFFFF)"
            strokeWidth="2.5"
            strokeDasharray="20 180"
            className="animate-[dash-flow_4s_linear_infinite]"
            style={{
              filter: 'drop-shadow(0 0 6px #FFFFFF)',
            }}
          />
        </g>
      ))}
    </g>
  );
};

export default LogisticsRoutes;
