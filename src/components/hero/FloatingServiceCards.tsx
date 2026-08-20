import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Warehouse } from 'lucide-react';

export const FloatingServiceCards: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(68);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Card 1: SHIPMENT STATUS */}
      <div className="absolute top-[8%] left-[2%] sm:left-[5%] z-20 animate-float-slow">
        <div className="glass-panel p-3.5 rounded-2xl w-[190px] text-left space-y-2 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#AAB6C8] uppercase tracking-wider">
              SHIPMENT STATUS
            </span>
            <Activity className="w-3.5 h-3.5 text-[#4DE7FF] animate-pulse" />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span>In Transit</span>
            <span className="font-mono text-[#4DE7FF]">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4DA3FF] to-[#4DE7FF] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[9px] text-[#AAB6C8] block text-right font-mono">
            {progress}% Complete
          </span>
        </div>
      </div>

      {/* Card 2: LOGISTICS NETWORK */}
      <div className="absolute bottom-[28%] left-[0%] sm:left-[3%] z-20 animate-float-reverse">
        <div className="glass-panel p-3.5 rounded-2xl w-[200px] text-left space-y-2 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#AAB6C8] uppercase tracking-wider">
              LOGISTICS NETWORK
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#4DA3FF]" />
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-[10px] text-center">
            <div className="bg-white/5 p-1 rounded-lg border border-white/10">
              <span className="block text-[#AAB6C8] text-[9px]">AIR</span>
              <span className="text-[#4DE7FF] font-bold">✓</span>
            </div>
            <div className="bg-white/5 p-1 rounded-lg border border-white/10">
              <span className="block text-[#AAB6C8] text-[9px]">SEA</span>
              <span className="text-[#4DE7FF] font-bold">✓</span>
            </div>
            <div className="bg-white/5 p-1 rounded-lg border border-white/10">
              <span className="block text-[#AAB6C8] text-[9px]">ROAD</span>
              <span className="text-[#4DE7FF] font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: SMART ROUTING */}
      <div className="absolute top-[12%] right-[2%] sm:right-[5%] z-20 animate-float-reverse">
        <div className="glass-panel p-3.5 rounded-2xl w-[190px] text-left space-y-1.5 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#AAB6C8] uppercase tracking-wider">
              SMART ROUTING
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <div className="text-xs font-semibold text-white">Route Optimization</div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </div>
        </div>
      </div>

      {/* Card 4: WAREHOUSE & FULFILLMENT */}
      <div className="absolute bottom-[10%] right-[4%] sm:right-[8%] z-20 animate-float-slow">
        <div className="glass-panel p-3.5 rounded-2xl w-[195px] text-left space-y-1.5 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#AAB6C8] uppercase tracking-wider">
              WAREHOUSE
            </span>
            <Warehouse className="w-3.5 h-3.5 text-[#8B6CFF]" />
          </div>

          <div className="text-xs font-semibold text-white">FULFILLMENT</div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#4DE7FF]">
            <span className="w-2 h-2 rounded-full bg-[#4DE7FF] animate-ping" />
            <span>OPERATIONAL</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingServiceCards;
