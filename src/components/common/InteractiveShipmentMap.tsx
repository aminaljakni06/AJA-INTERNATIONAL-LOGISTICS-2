import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Compass, Layers, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface InteractiveShipmentMapProps {
  shipment: any;
  height?: string;
}

// Known coordinates dictionary for ports, cities, and maritime waypoints
const LOCATION_COORDS: Record<string, [number, number]> = {
  // Saudi Arabia
  'RIYADH': [24.7136, 46.6753],
  'الرياض': [24.7136, 46.6753],
  'JEDDAH': [21.4858, 39.1925],
  'جدة': [21.4858, 39.1925],
  'DAMMAM': [26.4340, 50.1033],
  'الدمام': [26.4340, 50.1033],
  'KHOBAR': [26.2172, 50.1971],
  'الخبر': [26.2172, 50.1971],
  'YANBU': [24.0891, 38.0637],
  'ينبع': [24.0891, 38.0637],
  'JUBIAL': [27.0046, 49.6601],
  'الجبيل': [27.0046, 49.6601],
  'KHAMRA': [21.3200, 39.2200],
  'الخمرة': [21.3200, 39.2200],

  // China
  'SHANGHAI': [31.2304, 121.4737],
  'شنغهاي': [31.2304, 121.4737],
  'NINGBO': [29.8683, 121.5440],
  'نينغبو': [29.8683, 121.5440],
  'GUANGZHOU': [23.1291, 113.2644],
  'غوانزو': [23.1291, 113.2644],
  'SHENZHEN': [22.5431, 114.0579],
  'شينزن': [22.5431, 114.0579],

  // UAE & GCC
  'JEBEL_ALI': [24.9857, 55.0611],
  'جبل علي': [24.9857, 55.0611],
  'DUBAI': [25.2048, 55.2708],
  'دبي': [25.2048, 55.2708],
  'ABU_DHABI': [24.4539, 54.3773],
  'أبوظبي': [24.4539, 54.3773],
  'KUWAIT': [29.3759, 47.9774],
  'الكويت': [29.3759, 47.9774],
  'BAHRAIN': [26.0667, 50.5577],
  'البحرين': [26.0667, 50.5577],
  'QATAR': [25.2854, 51.5310],
  'قطر': [25.2854, 51.5310],

  // Maritime Strategic Waypoints
  'SINGAPORE': [1.3521, 103.8198],
  'سنغافورة': [1.3521, 103.8198],
  'MALACCA': [2.2, 102.25],
  'BAB_EL_MANDEB': [12.5833, 43.3333],
  'باب المندب': [12.5833, 43.3333],
  'RED_SEA': [19.0, 38.5],
  'البحر الأحمر': [19.0, 38.5],
  'ARABIAN_SEA': [18.5, 62.0],
  'بحر العرب': [18.5, 62.0],
  'SUEZ': [29.9667, 32.5500],
  'قناة السويس': [29.9667, 32.5500],
};

function resolveCoords(str?: string, fallback: [number, number] = [24.7136, 46.6753]): [number, number] {
  if (!str) return fallback;
  const upper = str.toUpperCase();
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (upper.includes(key)) {
      return coords;
    }
  }
  return fallback;
}

export const InteractiveShipmentMap: React.FC<InteractiveShipmentMapProps> = ({ shipment, height = '400px' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('dark');

  // Dynamically derive Origin, Current Location, and Destination
  const originText = shipment?.origin || (isAr ? 'شنغهاي، الصين' : 'Shanghai, China');
  const destText = shipment?.destination || (isAr ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia');
  const currentLocText = shipment?.currentLocation || (isAr ? 'في الطريق الجوي/البحري' : 'In Transit');

  const originCoords = resolveCoords(originText, [31.2304, 121.4737]);
  const destCoords = resolveCoords(destText, [24.7136, 46.6753]);

  // Determine an intermediate current position coordinate
  let currentCoords = resolveCoords(currentLocText, [18.5, 62.0]);

  // If current location matches origin or destination or was unresolved, compute midpoint offset
  if (
    currentCoords[0] === originCoords[0] &&
    currentCoords[1] === originCoords[1] &&
    shipment?.progressPercent &&
    shipment.progressPercent > 0 &&
    shipment.progressPercent < 100
  ) {
    const ratio = (shipment.progressPercent || 50) / 100;
    currentCoords = [
      originCoords[0] + (destCoords[0] - originCoords[0]) * ratio,
      originCoords[1] + (destCoords[1] - originCoords[1]) * ratio,
    ];
  }

  // Construct waypoints sequence
  const waypoints: {
    id: 'origin' | 'current' | 'destination' | 'waypoint';
    labelAr: string;
    labelEn: string;
    coords: [number, number];
    time?: string;
    status: 'completed' | 'active' | 'pending';
  }[] = [];

  // 1. Origin
  waypoints.push({
    id: 'origin',
    labelAr: `نقطة الانطلاق: ${originText}`,
    labelEn: `Origin: ${originText}`,
    coords: originCoords,
    time: shipment?.pickupDate || '2026-07-15',
    status: 'completed',
  });

  // 2. Intermediate Waypoint (if Ocean Freight from Asia to GCC)
  if (shipment?.shipmentType === 'SEA_FREIGHT' || !shipment?.shipmentType) {
    if (originCoords[1] > 90) {
      // Asia Origin -> Add Malacca / Singapore Waypoint
      waypoints.push({
        id: 'waypoint',
        labelAr: 'مضيق ملتقى الملاحة - سنغافورة',
        labelEn: 'Malacca Strait Transit Point - Singapore',
        coords: [1.3521, 103.8198],
        time: '2026-07-20',
        status: (shipment?.progressPercent || 0) > 30 ? 'completed' : 'pending',
      });
    }
  }

  // 3. Current Location
  if (shipment?.progressPercent && shipment.progressPercent < 100) {
    waypoints.push({
      id: 'current',
      labelAr: `الموقع الحالي: ${currentLocText}`,
      labelEn: `Current Position: ${currentLocText}`,
      coords: currentCoords,
      time: isAr ? 'تحديث حي مباشر (GPS)' : 'Live GPS Feed',
      status: 'active',
    });
  }

  // 4. Destination
  waypoints.push({
    id: 'destination',
    labelAr: `وجهة التوصيل: ${destText}`,
    labelEn: `Destination: ${destText}`,
    coords: destCoords,
    time: shipment?.estimatedDelivery ? (isAr ? `متوقع: ${shipment.estimatedDelivery}` : `ETA: ${shipment.estimatedDelivery}`) : undefined,
    status: shipment?.progressPercent === 100 ? 'completed' : 'pending',
  });

  const activeWaypoint = waypoints.find((w) => w.id === 'current') || waypoints[waypoints.length - 1];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const tileUrls = {
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer(tileUrls[mapStyle], {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: isAr ? 'topright' : 'topleft' }).addTo(map);

    // Marker Icon Generator
    const createCustomIcon = (type: 'origin' | 'current' | 'destination' | 'waypoint') => {
      let bg = '#0F4C75';
      let symbol = '📦';
      let borderColor = '#FFFFFF';

      if (type === 'origin') {
        bg = '#0F4C75';
        symbol = '🛫';
        borderColor = '#00F0FF';
      } else if (type === 'current') {
        bg = '#EA580C';
        symbol = '📡';
        borderColor = '#FFEDD5';
      } else if (type === 'destination') {
        bg = '#10B981';
        symbol = '🏁';
        borderColor = '#D1FAE5';
      } else {
        bg = '#64748B';
        symbol = '⚓';
      }

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bg};
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            border: 2px solid ${borderColor};
            position: relative;
          ">
            ${symbol}
            ${type === 'current' ? `<span style="position:absolute; inset:-6px; border-radius:50%; border:2px solid #EA580C; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    };

    // Add Markers
    waypoints.forEach((wp) => {
      const marker = L.marker(wp.coords, { icon: createCustomIcon(wp.id) }).addTo(map);

      const popupTitle = isAr ? wp.labelAr : wp.labelEn;
      const timeStr = wp.time || '';

      marker.bindPopup(`
        <div style="direction: ${isAr ? 'rtl' : 'ltr'}; font-family: system-ui, sans-serif; padding: 4px; text-align: ${isAr ? 'right' : 'left'}; min-width: 180px;">
          <strong style="color: #0F4C75; font-size: 13px; display: block; margin-bottom: 2px;">${popupTitle}</strong>
          ${timeStr ? `<div style="margin-top: 4px; padding: 3px 8px; background: #0F4C75; color: white; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-block;">${timeStr}</div>` : ''}
        </div>
      `);
    });

    // Draw Polylines
    const allCoords = waypoints.map((w) => w.coords);
    const activeIndex = waypoints.findIndex((w) => w.id === 'current');

    let completedSlice: [number, number][] = [];
    let remainingSlice: [number, number][] = [];

    if (activeIndex !== -1) {
      completedSlice = allCoords.slice(0, activeIndex + 1);
      remainingSlice = allCoords.slice(activeIndex);
    } else {
      completedSlice = allCoords;
    }

    // Traversed Polyline (Solid Electric Cyan)
    if (completedSlice.length >= 2) {
      L.polyline(completedSlice, {
        color: '#00F0FF',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);
    }

    // Remaining Polyline (Dashed Amber)
    if (remainingSlice.length >= 2) {
      L.polyline(remainingSlice, {
        color: '#F59E0B',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);
    }

    // Fit map bounds cleanly
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle, shipment, isAr]);

  const handleCenterCurrent = () => {
    if (mapInstanceRef.current && activeWaypoint) {
      mapInstanceRef.current.flyTo(activeWaypoint.coords, 6, { duration: 1.2 });
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map((w) => w.coords));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#082F49] text-white p-3 rounded-2xl border border-[#0F4C75] text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping"></span>
          <span className="font-bold text-[#00F0FF] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#00F0FF]" />
            <span>
              {isAr
                ? 'تتبع المسار الملاحي المباشر عبر الخريطة التفاعلية (Leaflet GPS Route)'
                : 'Real-time Interactive Transit Route Map'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCenterCurrent}
            className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer text-[11px]"
            title={isAr ? 'تركيز الشاشة على موقع الشحنة الحالي' : 'Center on active shipment location'}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isAr ? 'الموقع الحالي' : 'Live Position'}</span>
          </button>

          <button
            onClick={handleFitAll}
            className="px-3 py-1.5 bg-[#0F4C75] hover:bg-[#0F4C75]/80 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all border border-slate-600 cursor-pointer text-[11px]"
            title={isAr ? 'إظهار المسار بالكامل' : 'Fit entire route'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'رؤية كاملة' : 'Fit Route'}</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Map Tile Style Switcher */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                mapStyle === 'dark' ? 'bg-[#00F0FF] text-[#030712] font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'داكن' : 'Dark'}
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                mapStyle === 'streets' ? 'bg-[#00F0FF] text-[#030712] font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'شوارع' : 'Streets'}
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-[#00F0FF] text-[#030712] font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'أقمار' : 'Satellite'}
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas Box */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F4C75] shadow-xl bg-slate-950">
        <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

        {/* Floating Route Legend overlay */}
        <div className="absolute bottom-3 end-3 bg-[#0B172A]/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 shadow-2xl text-[11px] space-y-2 z-10 max-w-[240px]">
          <div className="font-extrabold text-[#00F0FF] border-b border-white/10 pb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'دليل خريطة الشحنة' : 'Route Legend'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-[#00F0FF] rounded-full"></span>
            <span className="text-slate-200">{isAr ? 'المسار المقطوع' : 'Traversed Path'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 border-b-2 border-dashed border-amber-400"></span>
            <span className="text-slate-200">{isAr ? 'المسار المتبقي' : 'Remaining Leg'}</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping shrink-0" />
            <span className="text-amber-200 font-bold truncate">
              {isAr ? activeWaypoint.labelAr : activeWaypoint.labelEn}
            </span>
          </div>
        </div>
      </div>

      {/* Route Real-time Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-[#082F49]/70 border border-[#0F4C75] rounded-xl text-center space-y-0.5">
          <span className="text-slate-400 text-[10px] block">{isAr ? 'مكان الاستلام (Origin):' : 'Origin:'}</span>
          <span className="font-bold text-white truncate block">{originText}</span>
        </div>

        <div className="p-3 bg-[#082F49]/70 border border-[#0F4C75] rounded-xl text-center space-y-0.5">
          <span className="text-slate-400 text-[10px] block">{isAr ? 'الموقع الحالي (Live):' : 'Current Location:'}</span>
          <span className="font-bold text-[#00F0FF] truncate block">{currentLocText}</span>
        </div>

        <div className="p-3 bg-[#082F49]/70 border border-[#0F4C75] rounded-xl text-center space-y-0.5">
          <span className="text-slate-400 text-[10px] block">{isAr ? 'جهة الوصول (Destination):' : 'Destination:'}</span>
          <span className="font-bold text-emerald-400 truncate block">{destText}</span>
        </div>

        <div className="p-3 bg-[#082F49]/70 border border-[#0F4C75] rounded-xl text-center space-y-0.5">
          <span className="text-slate-400 text-[10px] block">{isAr ? 'نسبة إنجاز المسار:' : 'Completed Progress:'}</span>
          <span className="font-mono font-black text-amber-300 block">{shipment?.progressPercent || 60}%</span>
        </div>
      </div>
    </div>
  );
};
