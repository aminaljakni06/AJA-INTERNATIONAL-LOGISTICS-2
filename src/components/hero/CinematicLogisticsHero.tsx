import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, ShieldCheck, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import ajaHeroBanner from '../../assets/images/aja_hero_banner_1785524086125.jpg';
import ajaWarehouseHub from '../../assets/images/aja_warehouse_hub_1785524100999.jpg';
import ajaAirFreight from '../../assets/images/aja_air_freight_1785524347851.jpg';
import ajaRoadFreight from '../../assets/images/aja_road_freight_1785524363510.jpg';
import ajaCustomsClearance from '../../assets/images/aja_customs_clearance_1785524377489.jpg';
import ajaLastMile from '../../assets/images/aja_last_mile_1785524391224.jpg';

export interface Scene {
  id: string;
  num: string;
  titleEn: string;
  titleAr: string;
  overlayTitleEn: string;
  overlayTitleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  video: string;
  poster: string;
}

export const SCENES: Scene[] = [
  {
    id: 'ocean',
    num: '01',
    titleEn: 'OCEAN',
    titleAr: 'بحري',
    overlayTitleEn: 'OCEAN FREIGHT',
    overlayTitleAr: 'الشحن البحري الدولي',
    subtitleEn: 'Global cargo movement across international trade routes',
    subtitleAr: 'نقل البضائع الحاويات عبر الموانئ والمسارات التجارية العالمية',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-container-ship-sailing-in-the-sea-41228-large.mp4',
    poster: ajaHeroBanner,
  },
  {
    id: 'air',
    num: '02',
    titleEn: 'AIR',
    titleAr: 'جوي',
    overlayTitleEn: 'AIR FREIGHT',
    overlayTitleAr: 'الشحن الجوي السريع',
    subtitleEn: 'Fast connections for time-sensitive cargo worldwide',
    subtitleAr: 'ربط جوي فائق السرعة للشحنات الثمينة والعاجلة للوقت',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-airplane-taking-off-from-an-airport-41132-large.mp4',
    poster: ajaAirFreight,
  },
  {
    id: 'road',
    num: '03',
    titleEn: 'ROAD',
    titleAr: 'بري',
    overlayTitleEn: 'ROAD FREIGHT',
    overlayTitleAr: 'النقل البري الإقليمي',
    subtitleEn: 'Reliable regional transportation from hub to destination',
    subtitleAr: 'شحن بري موثوق بأسطول شاحنات حديث عبر الشبكات الإقليمية',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-semi-truck-driving-on-a-highway-41185-large.mp4',
    poster: ajaRoadFreight,
  },
  {
    id: 'warehouse',
    num: '04',
    titleEn: 'WAREHOUSE',
    titleAr: 'تخزين',
    overlayTitleEn: 'WAREHOUSING & FULFILLMENT',
    overlayTitleAr: 'التخزين وإدارة المبيعات',
    subtitleEn: 'Store. Process. Prepare. Dispatch.',
    subtitleAr: 'تخزين آمن. معالجة دقيقة. تجهيز كفء. إرسال فوري.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-warehouse-worker-moving-boxes-with-a-forklift-41203-large.mp4',
    poster: ajaWarehouseHub,
  },
  {
    id: 'customs',
    num: '05',
    titleEn: 'CUSTOMS',
    titleAr: 'تخليص',
    overlayTitleEn: 'CUSTOMS CLEARANCE',
    overlayTitleAr: 'التخليص الجمركي المعتمد',
    subtitleEn: 'Simplifying the journey across international borders',
    subtitleAr: 'تسهيل وإنهاء كافة إجراءات التخليص الجمركي عبر المنافذ',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-cargo-containers-in-a-port-terminal-41188-large.mp4',
    poster: ajaCustomsClearance,
  },
  {
    id: 'lastmile',
    num: '06',
    titleEn: 'LAST MILE',
    titleAr: 'ميل أخير',
    overlayTitleEn: 'LAST-MILE DELIVERY',
    overlayTitleAr: 'توصيل الميل الأخير',
    subtitleEn: 'From distribution hub directly to final destination',
    subtitleAr: 'تسليم مباشر إلى باب العميل بأعلى معايير الدقة والأمان',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-delivery-person-handing-a-package-to-a-customer-41221-large.mp4',
    poster: ajaLastMile,
  },
  {
    id: 'overview',
    num: '07',
    titleEn: 'ECOSYSTEM',
    titleAr: 'شامل',
    overlayTitleEn: 'ONE LOGISTICS ECOSYSTEM',
    overlayTitleAr: 'منظومة لوجستية متكاملة',
    subtitleEn: 'Ocean • Air • Road • Warehousing • Customs • Last Mile',
    subtitleAr: 'شحن بحري • جوي • بري • تخزين • تخليص جمركي • توصيل نهائي',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-cargo-ship-in-the-sea-at-sunset-41130-large.mp4',
    poster: ajaHeroBanner,
  },
];

const SCENE_DURATION_MS = 5500; // 5.5 seconds per scene

export const CinematicLogisticsHero: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoErrorMap, setVideoErrorMap] = useState<Record<string, boolean>>({});

  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const currentScene = SCENES[activeSceneIndex];

  // Manage Scene Timer & Progress
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      return;
    }

    setProgress(0);
    lastTimeRef.current = Date.now();

    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / SCENE_DURATION_MS) * 100, 100);
      setProgress(currentProgress);

      if (elapsed < SCENE_DURATION_MS) {
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Advance to next scene
        setActiveSceneIndex((prev) => (prev + 1) % SCENES.length);
      }
    };

    progressAnimRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    };
  }, [activeSceneIndex, isPlaying, prefersReducedMotion]);

  // Handle active video playback
  useEffect(() => {
    SCENES.forEach((scene, index) => {
      const videoEl = videoRefs.current[index];
      if (videoEl) {
        if (index === activeSceneIndex && isPlaying && !videoErrorMap[scene.id]) {
          videoEl.currentTime = 0;
          videoEl.muted = isMuted;
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn(`Video playback prevented for scene ${scene.id}:`, err);
              // Fallback gracefully to poster image without breaking UI
              setVideoErrorMap((prev) => ({ ...prev, [scene.id]: true }));
            });
          }
        } else {
          videoEl.pause();
        }
      }
    });
  }, [activeSceneIndex, isPlaying, isMuted, videoErrorMap]);

  // Toggle Mute
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const activeVideo = videoRefs.current[activeSceneIndex];
    if (activeVideo) {
      activeVideo.muted = newMuted;
    }
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Jump to Scene
  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    setProgress(0);
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[75vh] max-h-[720px] min-h-[400px] rounded-2xl lg:rounded-[28px] overflow-hidden border border-white/15 bg-[#050711] shadow-[0_20px_60px_rgba(0,0,0,0.8)] group selection:bg-none">
      
      {/* SCENE VIDEOS & POSTERS */}
      {SCENES.map((scene, index) => {
        const isActive = index === activeSceneIndex;
        const hasError = videoErrorMap[scene.id];

        return (
          <div
            key={scene.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Poster Image */}
            <img
              src={scene.poster}
              alt={isAr ? scene.overlayTitleAr : scene.overlayTitleEn}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                isActive && !prefersReducedMotion ? 'scale-105' : 'scale-100'
              }`}
              loading={index <= 1 ? 'eager' : 'lazy'}
            />

            {/* Video Player overlay (if no error and video is present) */}
            {!hasError && (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={scene.video}
                poster={scene.poster}
                playsInline
                muted={isMuted}
                loop
                preload={isActive || index === (activeSceneIndex + 1) % SCENES.length ? 'auto' : 'metadata'}
                onError={() => {
                  setVideoErrorMap((prev) => ({ ...prev, [scene.id]: true }));
                }}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isActive && !prefersReducedMotion ? 'scale-105' : 'scale-100'
                }`}
              />
            )}
          </div>
        );
      })}

      {/* CINEMATIC OVERLAYS */}
      {/* 10. Gradient overlays for legibility */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(90deg, rgba(5,7,17,0.80) 0%, rgba(5,7,17,0.25) 55%, rgba(5,7,17,0.40) 100%)',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(0deg, rgba(5,7,17,0.88) 0%, rgba(5,7,17,0.15) 50%, transparent 100%)',
        }}
      />

      {/* TOP FLOATING CONTROLS & LIVE BADGE */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-30 flex items-center justify-between gap-2 pointer-events-auto">
        
        {/* Real-world Operations Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050711]/70 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold tracking-wider uppercase text-emerald-300">
            {isAr ? 'بث العمليات المباشرة' : 'REAL OPERATIONS'}
          </span>
        </div>

        {/* Play/Pause & Sound Controls */}
        <div className="flex items-center gap-2 bg-[#082F49]/90 p-1 rounded-full border border-white/20 shadow-xl backdrop-blur-md">
          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer flex items-center gap-1.5 px-3 text-[11px] font-bold font-mono"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#5DA9E9]" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#5DA9E9]" />
                <span className="hidden sm:inline">PLAY</span>
              </>
            )}
          </button>

          <div className="w-[1px] h-4 bg-white/20" />

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer flex items-center gap-1.5 px-3 text-[11px] font-bold font-mono"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#5DA9E9]" />
                <span className="hidden sm:inline">SOUND ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CENTER / BOTTOM SCENE CAPTION OVERLAY */}
      <div className="absolute left-6 sm:left-8 bottom-20 sm:bottom-24 right-6 sm:right-8 z-30 pointer-events-none space-y-1.5 rtl:text-right ltr:text-left">
        <div className="inline-block px-2.5 py-1 rounded bg-[#082F49]/80 border border-white/20 text-white text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase">
          {currentScene.num} • {isAr ? currentScene.titleAr : currentScene.titleEn}
        </div>
        
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-urbanist font-bold text-white tracking-tight drop-shadow-md">
          {isAr ? currentScene.overlayTitleAr : currentScene.overlayTitleEn}
        </h3>

        <p className="text-xs sm:text-sm text-slate-200 font-inter max-w-xl leading-relaxed drop-shadow">
          {isAr ? currentScene.subtitleAr : currentScene.subtitleEn}
        </p>
      </div>

      {/* 11. BOTTOM SCENE INDICATORS & PROGRESS BARS */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-30 pointer-events-auto">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {SCENES.map((scene, idx) => {
            const isCurrent = idx === activeSceneIndex;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSelectScene(idx)}
                className={`group text-left rtl:text-right transition-all cursor-pointer ${
                  isCurrent ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* Scene Label */}
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-white mb-1 truncate">
                  <span className="text-[#5DA9E9]">{scene.num}</span>
                  <span className="hidden lg:inline text-slate-300 truncate pl-1">
                    {isAr ? scene.titleAr : scene.titleEn}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCurrent 
                        ? 'bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]' 
                        : 'bg-white/40'
                    }`}
                    style={{
                      width: isCurrent ? `${progress}%` : idx < activeSceneIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
