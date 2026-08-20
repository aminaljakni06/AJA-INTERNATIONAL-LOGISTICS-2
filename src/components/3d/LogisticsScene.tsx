import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';
import { Ocean } from './Ocean';
import { Port } from './Port';
import { CargoShip } from './CargoShip';
import { ShippingContainers } from './ShippingContainers';
import { ContainerCrane } from './ContainerCrane';
import { CargoTruck } from './CargoTruck';
import { LogisticsRoutes } from './LogisticsRoutes';
import { NetworkNodes } from './NetworkNodes';
import { LogisticsEntityData, TransformProps } from './types';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SceneTransforms {
  ocean?: TransformProps;
  port?: TransformProps;
  ship?: TransformProps;
  containers?: TransformProps;
  crane?: TransformProps;
  truck1?: TransformProps;
  truck2?: TransformProps;
  routes?: TransformProps;
  network?: TransformProps;
}

export interface LogisticsSceneProps {
  onSelectEntity?: (item: LogisticsEntityData) => void;
  className?: string;
  customTransforms?: SceneTransforms;
  sceneProgress?: number;
  enableScrollControl?: boolean;
  hideScrubber?: boolean;
  hideTopBar?: boolean;
  isHeroBackground?: boolean;
}

// Math helper functions
function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

function smoothProgress(val: number, start: number, end: number): number {
  const norm = clamp01((val - start) / (end - start));
  return norm * norm * (3 - 2 * norm);
}

// Predefined Initial & Final Transforms for Exploded 3D Infrastructure
const OBJECT_TRANSFORMS = {
  ocean: {
    initial: { position: [0, -0.5, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number], scale: 1, opacity: 0.95 },
    final: { position: [0, -18, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number], scale: 1.15, opacity: 0.35 },
  },
  port: {
    initial: { position: [12, 1.5, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [32, 2.0, -15] as [number, number, number], rotation: [0, -Math.PI / 12, 0] as [number, number, number], scale: 1.05, opacity: 0.95 },
  },
  ship: {
    initial: { position: [-28, 0, -8] as [number, number, number], rotation: [0, Math.PI / 6, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [-65, 12, -38] as [number, number, number], rotation: [-Math.PI / 24, Math.PI / 4, -Math.PI / 36] as [number, number, number], scale: 1.15, opacity: 0.95 },
  },
  containers: {
    initial: { position: [10, 3, 10] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [22, 24, 15] as [number, number, number], rotation: [0, Math.PI / 16, 0] as [number, number, number], scale: 1.1, opacity: 1 },
  },
  crane: {
    initial: { position: [-8, 3, -5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [-28, 20, -12] as [number, number, number], rotation: [0, -Math.PI / 8, 0] as [number, number, number], scale: 1.1, opacity: 1 },
  },
  truck1: {
    initial: { position: [0, 3.4, 26] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [-20, 8, 54] as [number, number, number], rotation: [0, -Math.PI / 6, 0] as [number, number, number], scale: 1.1, opacity: 1 },
  },
  truck2: {
    initial: { position: [38, 3.4, 30] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [60, 8, 48] as [number, number, number], rotation: [0, Math.PI + Math.PI / 6, 0] as [number, number, number], scale: 1.1, opacity: 1 },
  },
  routes: {
    initial: { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 1 },
    final: { position: [0, 4, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1.08, opacity: 1 },
  },
  network: {
    initial: { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1, opacity: 0.6 },
    final: { position: [0, 10, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1.25, opacity: 1 },
  },
};

const CameraRig: React.FC<{ sceneProgress: number }> = ({ sceneProgress }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    // Camera transitions smoothly during Phase 2..5 (0.2 to 1.0)
    const t = clamp01((sceneProgress - 0.2) / 0.8);
    const smoothT = t * t * (3 - 2 * t);

    const initialPos: [number, number, number] = [45, 35, 55];
    const finalPos: [number, number, number] = [75, 60, 85];

    const initialTarget: [number, number, number] = [0, 5, 0];
    const finalTarget: [number, number, number] = [0, 12, 0];

    camera.position.x = lerp(initialPos[0], finalPos[0], smoothT);
    camera.position.y = lerp(initialPos[1], finalPos[1], smoothT);
    camera.position.z = lerp(initialPos[2], finalPos[2], smoothT);

    if (controlsRef.current) {
      controlsRef.current.target.set(
        lerp(initialTarget[0], finalTarget[0], smoothT),
        lerp(initialTarget[1], finalTarget[1], smoothT),
        lerp(initialTarget[2], finalTarget[2], smoothT)
      );
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={15}
      maxDistance={180}
    />
  );
};

export const LogisticsSceneContent: React.FC<{
  isPlaying: boolean;
  isNightMode: boolean;
  sceneProgress: number;
  customTransforms?: SceneTransforms;
  onSelectEntity?: (item: LogisticsEntityData) => void;
}> = ({ isPlaying, isNightMode, sceneProgress, customTransforms, onSelectEntity }) => {
  // Compute overall deconstruction progress factor (0 in Phase 1, ramps up smoothly)
  const t_deconstruct = smoothProgress(sceneProgress, 0.2, 0.85);

  // Phase 2: Ambient motion slows down (20% to 40%)
  const waveSpeedFactor = isPlaying ? Math.max(0.1, 1 - smoothProgress(sceneProgress, 0.2, 0.4) * 0.75) : 0;

  // Ocean
  const oceanPos = customTransforms?.ocean?.position || lerpVec3(OBJECT_TRANSFORMS.ocean.initial.position, OBJECT_TRANSFORMS.ocean.final.position, t_deconstruct);
  const oceanRot = customTransforms?.ocean?.rotation || lerpVec3(OBJECT_TRANSFORMS.ocean.initial.rotation, OBJECT_TRANSFORMS.ocean.final.rotation, t_deconstruct);
  const oceanScale = customTransforms?.ocean?.scale || lerp(OBJECT_TRANSFORMS.ocean.initial.scale, OBJECT_TRANSFORMS.ocean.final.scale, t_deconstruct);
  const oceanOpacity = customTransforms?.ocean?.opacity ?? lerp(OBJECT_TRANSFORMS.ocean.initial.opacity, OBJECT_TRANSFORMS.ocean.final.opacity, t_deconstruct);

  // Port
  const portPos = customTransforms?.port?.position || lerpVec3(OBJECT_TRANSFORMS.port.initial.position, OBJECT_TRANSFORMS.port.final.position, t_deconstruct);
  const portRot = customTransforms?.port?.rotation || lerpVec3(OBJECT_TRANSFORMS.port.initial.rotation, OBJECT_TRANSFORMS.port.final.rotation, t_deconstruct);
  const portScale = customTransforms?.port?.scale || lerp(OBJECT_TRANSFORMS.port.initial.scale, OBJECT_TRANSFORMS.port.final.scale, t_deconstruct);

  // Ship
  const shipPos = customTransforms?.ship?.position || lerpVec3(OBJECT_TRANSFORMS.ship.initial.position, OBJECT_TRANSFORMS.ship.final.position, t_deconstruct);
  const shipRot = customTransforms?.ship?.rotation || lerpVec3(OBJECT_TRANSFORMS.ship.initial.rotation, OBJECT_TRANSFORMS.ship.final.rotation, t_deconstruct);
  const shipScale = customTransforms?.ship?.scale || lerp(OBJECT_TRANSFORMS.ship.initial.scale, OBJECT_TRANSFORMS.ship.final.scale, t_deconstruct);

  // Containers
  const containersPos = customTransforms?.containers?.position || lerpVec3(OBJECT_TRANSFORMS.containers.initial.position, OBJECT_TRANSFORMS.containers.final.position, t_deconstruct);
  const containersRot = customTransforms?.containers?.rotation || lerpVec3(OBJECT_TRANSFORMS.containers.initial.rotation, OBJECT_TRANSFORMS.containers.final.rotation, t_deconstruct);
  const containersScale = customTransforms?.containers?.scale || lerp(OBJECT_TRANSFORMS.containers.initial.scale, OBJECT_TRANSFORMS.containers.final.scale, t_deconstruct);

  // Crane
  const cranePos = customTransforms?.crane?.position || lerpVec3(OBJECT_TRANSFORMS.crane.initial.position, OBJECT_TRANSFORMS.crane.final.position, t_deconstruct);
  const craneRot = customTransforms?.crane?.rotation || lerpVec3(OBJECT_TRANSFORMS.crane.initial.rotation, OBJECT_TRANSFORMS.crane.final.rotation, t_deconstruct);
  const craneScale = customTransforms?.crane?.scale || lerp(OBJECT_TRANSFORMS.crane.initial.scale, OBJECT_TRANSFORMS.crane.final.scale, t_deconstruct);

  // Truck 1
  const truck1Pos = customTransforms?.truck1?.position || lerpVec3(OBJECT_TRANSFORMS.truck1.initial.position, OBJECT_TRANSFORMS.truck1.final.position, t_deconstruct);
  const truck1Rot = customTransforms?.truck1?.rotation || lerpVec3(OBJECT_TRANSFORMS.truck1.initial.rotation, OBJECT_TRANSFORMS.truck1.final.rotation, t_deconstruct);
  const truck1Scale = customTransforms?.truck1?.scale || lerp(OBJECT_TRANSFORMS.truck1.initial.scale, OBJECT_TRANSFORMS.truck1.final.scale, t_deconstruct);

  // Truck 2
  const truck2Pos = customTransforms?.truck2?.position || lerpVec3(OBJECT_TRANSFORMS.truck2.initial.position, OBJECT_TRANSFORMS.truck2.final.position, t_deconstruct);
  const truck2Rot = customTransforms?.truck2?.rotation || lerpVec3(OBJECT_TRANSFORMS.truck2.initial.rotation, OBJECT_TRANSFORMS.truck2.final.rotation, t_deconstruct);
  const truck2Scale = customTransforms?.truck2?.scale || lerp(OBJECT_TRANSFORMS.truck2.initial.scale, OBJECT_TRANSFORMS.truck2.final.scale, t_deconstruct);

  // Routes
  const routesPos = customTransforms?.routes?.position || lerpVec3(OBJECT_TRANSFORMS.routes.initial.position, OBJECT_TRANSFORMS.routes.final.position, t_deconstruct);
  const routesRot = customTransforms?.routes?.rotation || lerpVec3(OBJECT_TRANSFORMS.routes.initial.rotation, OBJECT_TRANSFORMS.routes.final.rotation, t_deconstruct);
  const routesScale = customTransforms?.routes?.scale || lerp(OBJECT_TRANSFORMS.routes.initial.scale, OBJECT_TRANSFORMS.routes.final.scale, t_deconstruct);

  // Network
  const networkPos = customTransforms?.network?.position || lerpVec3(OBJECT_TRANSFORMS.network.initial.position, OBJECT_TRANSFORMS.network.final.position, t_deconstruct);
  const networkRot = customTransforms?.network?.rotation || lerpVec3(OBJECT_TRANSFORMS.network.initial.rotation, OBJECT_TRANSFORMS.network.final.rotation, t_deconstruct);
  const networkScale = customTransforms?.network?.scale || lerp(OBJECT_TRANSFORMS.network.initial.scale, OBJECT_TRANSFORMS.network.final.scale, t_deconstruct);

  return (
    <>
      {/* Atmosphere Fog & Ambient Lighting */}
      <color attach="background" args={[isNightMode ? '#0A1128' : '#0F2C59']} />
      <fog attach="fog" args={[isNightMode ? '#0A1128' : '#0F2C59', 10, 240]} />

      <ambientLight intensity={isNightMode ? 0.6 : 1.2} />
      <directionalLight
        position={[50, 80, 40]}
        intensity={isNightMode ? 1.5 : 2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-25, 10, -10]} intensity={3} color="#0EA5E9" />
      <pointLight position={[15, 12, 10]} intensity={3} color="#F59E0B" />

      {/* BACKGROUND: Ocean */}
      <Ocean
        position={oceanPos}
        rotation={oceanRot}
        scale={oceanScale}
        visible={customTransforms?.ocean?.visible ?? true}
        opacity={oceanOpacity}
        waveSpeed={waveSpeedFactor}
      />

      {/* MIDGROUND: Port Terminal */}
      <Port
        position={portPos}
        rotation={portRot}
        scale={portScale}
        visible={customTransforms?.port?.visible ?? true}
        opacity={customTransforms?.port?.opacity ?? 1}
        onSelect={onSelectEntity}
      />

      {/* MIDGROUND: Cargo Ship */}
      <CargoShip
        position={shipPos}
        rotation={shipRot}
        scale={shipScale}
        visible={customTransforms?.ship?.visible ?? true}
        opacity={customTransforms?.ship?.opacity ?? 1}
        floatAnimation={isPlaying && sceneProgress < 0.8}
        onSelect={onSelectEntity}
      />

      {/* FOREGROUND: Shipping Containers Yard */}
      <ShippingContainers
        position={containersPos}
        rotation={containersRot}
        scale={containersScale}
        visible={customTransforms?.containers?.visible ?? true}
        opacity={customTransforms?.containers?.opacity ?? 1}
        deconstructionProgress={sceneProgress}
        onSelect={onSelectEntity}
      />

      {/* FOREGROUND: Container Crane */}
      <ContainerCrane
        position={cranePos}
        rotation={craneRot}
        scale={craneScale}
        visible={customTransforms?.crane?.visible ?? true}
        opacity={customTransforms?.crane?.opacity ?? 1}
        animated={isPlaying}
        onSelect={onSelectEntity}
      />

      {/* FOREGROUND: Cargo Truck 1 (Outbound) */}
      <CargoTruck
        id="AJA-TRK-771"
        truckName="Aja Heavy Duty Heavy Haulage Truck #771"
        position={truck1Pos}
        rotation={truck1Rot}
        scale={truck1Scale}
        visible={customTransforms?.truck1?.visible ?? true}
        opacity={customTransforms?.truck1?.opacity ?? 1}
        driveSpeed={isPlaying && sceneProgress < 0.6 ? 0.12 : 0}
        direction={1}
        onSelect={onSelectEntity}
      />

      {/* FOREGROUND: Cargo Truck 2 (Inbound) */}
      <CargoTruck
        id="AJA-TRK-784"
        truckName="Aja Temperature Controlled Truck #784"
        containerColor="#0284C7"
        position={truck2Pos}
        rotation={truck2Rot}
        scale={truck2Scale}
        visible={customTransforms?.truck2?.visible ?? true}
        opacity={customTransforms?.truck2?.opacity ?? 1}
        driveSpeed={isPlaying && sceneProgress < 0.6 ? 0.1 : 0}
        direction={-1}
        onSelect={onSelectEntity}
      />

      {/* ROUTES: Sea Lanes & Highways */}
      <LogisticsRoutes
        position={routesPos}
        rotation={routesRot}
        scale={routesScale}
        visible={customTransforms?.routes?.visible ?? true}
        opacity={customTransforms?.routes?.opacity ?? 1}
        sceneProgress={sceneProgress}
      />

      {/* NETWORK: Nodes, Beacons & Data Arcs */}
      <NetworkNodes
        position={networkPos}
        rotation={networkRot}
        scale={networkScale}
        visible={customTransforms?.network?.visible ?? true}
        opacity={customTransforms?.network?.opacity ?? 1}
        animated={isPlaying}
        sceneProgress={sceneProgress}
        onSelect={onSelectEntity}
      />

      {/* Camera Controller */}
      <CameraRig sceneProgress={sceneProgress} />
    </>
  );
};

export const LogisticsScene: React.FC<LogisticsSceneProps> = ({
  onSelectEntity,
  className = '',
  customTransforms,
  sceneProgress: propsSceneProgress,
  enableScrollControl = true,
  hideScrubber = false,
  hideTopBar = false,
  isHeroBackground = false,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEntity, setSelectedEntity] = useState<LogisticsEntityData | null>(null);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Reduced motion preference listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsPlaying(false);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Internal interactive sceneProgress state
  const [internalProgress, setInternalProgress] = useState<number>(0);
  const [isAutoSequence, setIsAutoSequence] = useState<boolean>(false);
  const [sequenceDirection, setSequenceDirection] = useState<1 | -1>(1);

  // If propsSceneProgress is explicitly supplied by parent, use it, else fallback to internalProgress
  const activeProgress = propsSceneProgress !== undefined ? propsSceneProgress : internalProgress;

  // Window scroll handler (optional smooth scrolling sequence trigger)
  useEffect(() => {
    if (!enableScrollControl || propsSceneProgress !== undefined) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Progress begins when element enters viewport bottom, reaches 100% when element reaches center/top
      const totalDistance = windowHeight + rect.height;
      const currentScroll = windowHeight - rect.top;
      const calculatedProgress = clamp01(currentScroll / totalDistance);

      if (!isAutoSequence) {
        setInternalProgress(calculatedProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollControl, propsSceneProgress, isAutoSequence]);

  // Auto sequence animation timer
  useEffect(() => {
    if (!isAutoSequence) return;
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        let next = prev + 0.006 * sequenceDirection;
        if (next >= 1) {
          next = 1;
          setSequenceDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setSequenceDirection(1);
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [isAutoSequence, sequenceDirection]);

  const handleEntitySelect = (entity: LogisticsEntityData) => {
    setSelectedEntity(entity);
    if (onSelectEntity) onSelectEntity(entity);
  };

  // Phase Metadata for UI Badges
  const getPhaseInfo = (p: number) => {
    if (p <= 0.20) {
      return {
        phase: 1,
        titleEn: 'PHASE 1 — 0% to 20%: Assembled Infrastructure',
        titleAr: 'المرحلة 1 — 0% إلى 20%: المنظومة المجمعة بالكامل',
        descEn: 'Wide cinematic view. Objects stable at operational transforms.',
        descAr: 'عرض سينمائي شامل. جميع العناصر ثابتة في مواقعها التشغيلية.',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      };
    } else if (p <= 0.40) {
      return {
        phase: 2,
        titleEn: 'PHASE 2 — 20% to 40%: System Transformation',
        titleAr: 'المرحلة 2 — 20% إلى 40%: بدء التحول والهيكلة',
        descEn: 'Ambient motion slows, camera begins moving, containers separate.',
        descAr: 'تباطؤ الحركة المحيطة، الكاميرا تبدأ بالتحرك، الحاويات تبدأ بالانفصال.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    } else if (p <= 0.60) {
      return {
        phase: 3,
        titleEn: 'PHASE 3 — 40% to 60%: Active Deconstruction',
        titleAr: 'المرحلة 3 — 40% إلى 60%: التفكيك الهيكلي النشط',
        descEn: 'Cargo ship retreats, containers rise in 3D matrix, cranes & trucks separate.',
        descAr: 'السفينة تبتعد، الحاويات ترتفع في مصفوفة ثلاثية الأبعاد، الرافعات والشاحنات تنفصل.',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      };
    } else if (p <= 0.80) {
      return {
        phase: 4,
        titleEn: 'PHASE 4 — 60% to 80%: Network Reveal',
        titleAr: 'المرحلة 4 — 60% إلى 80%: كشف شبكة المسارات',
        descEn: 'Maritime & ground routes illuminate, light trails animate, logistics nodes elevate.',
        descAr: 'المسارات البحرية والبرية تضاء بالكامل، نبضات الضوء تنشط عبر العقد اللوجستية.',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    } else {
      return {
        phase: 5,
        titleEn: 'PHASE 5 — 80% to 100%: Exploded 3D Infrastructure',
        titleAr: 'المرحلة 5 — 80% إلى 100%: المنظومة اللوجستية المفككة بالكامل',
        descEn: 'All objects reach final structured transforms. Complete 3D exploded architecture.',
        descAr: 'تصل كافة المكونات إلى مواقعها النهائية في المنظومة اللوجستية المفككة والمستقرة.',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      };
    }
  };

  const phaseInfo = getPhaseInfo(activeProgress);
  const progressPercent = Math.round(activeProgress * 100);

  const containerClasses = isHeroBackground
    ? `relative w-full h-full bg-[#082F49] canvas-3d-container ${prefersReducedMotion ? 'has-reduced-motion-fallback' : ''} ${className}`
    : `relative rounded-3xl overflow-hidden border border-[#0F4C75]/40 bg-[#082F49] shadow-2xl transition-all duration-300 canvas-3d-container ${
        prefersReducedMotion ? 'has-reduced-motion-fallback' : ''
      } ${
        isFullWidth ? 'fixed inset-4 z-[1300] h-[calc(100vh-2rem)]' : 'w-full h-[620px]'
      } ${className}`;

  const ariaSceneLabel = isAr
    ? 'عرض ثلاثي الأبعاد تفاعلي للمنظومة اللوجستية يوضح الميناء، وسفينة الشحن، والرافعات، وأسطول الشاحنات، والمسارات اللوجستية'
    : 'Interactive 3D logistics scene displaying sea port, container vessel, cranes, cargo fleet, and international routes';

  return (
    <div 
      ref={containerRef} 
      className={containerClasses}
      role="region"
      aria-label={isAr ? 'منظومة أجا اللوجستية ثلاثية الأبعاد' : 'AJA 3D Logistics Ecosystem'}
    >
      {/* Screen-reader accessible alternative content */}
      <div id="a11y-3d-logistics-desc" className="canvas-aria-description">
        {isAr
          ? 'تُظهر هذه المحاكاة ثلاثية الأبعاد خريطة المنظومة اللوجستية لشركة أجا، وتتضمن حركة السفن بالموانئ، ورفع الحاويات، وتتبع أسطول الشاحنات والمسارات البحرية والبرية.'
          : 'This 3D visualization presents AJA Logistics ecosystem, illustrating port cargo operations, container handling, fleet tracking, and international transit corridors.'}
      </div>

      {/* High-quality Fallback Image / Static Overlay when prefers-reduced-motion is active */}
      {prefersReducedMotion && (
        <div 
          className="canvas-3d-fallback flex flex-col items-center justify-center p-6 text-center z-20 bg-gradient-to-br from-[#082F49]/95 via-[#0F4C75]/90 to-[#082F49]/95 backdrop-blur border border-[#0F4C75]/40"
          role="img"
          aria-label={ariaSceneLabel}
        >
          <div className="canvas-3d-static-card max-w-lg space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/40 text-sky-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-sky-300">
              {isAr ? 'المنظومة اللوجستية الشاملة — وضع الحركة المهدأة' : 'AJA Logistics Ecosystem — Reduced Motion View'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'تم تفعيل وضع تقليل الحركة للراحة البصرية. تعرض هذه الشاشة صورة ثابتة عالية الجودة لمنظومة أجا اللوجستية الموحدة مع الموانئ والأسطول والمسارات.'
                : 'Reduced motion active for accessibility. Showing high-contrast static visualization of AJA Logistics port operations, cargo fleet, and trade routes.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-mono font-bold rounded-lg">
                {isAr ? 'عرض إمكانيات الوصول المقواة (WCAG)' : 'ARIA & WCAG Compliant Mode'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      {!hasError ? (
        <Canvas
          shadows
          camera={{ position: [45, 35, 55], fov: 45 }}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', background: '#082F49' }}
          role="img"
          aria-label={ariaSceneLabel}
          aria-describedby="a11y-3d-logistics-desc"
          data-canvas-3d="true"
        >
          <Suspense fallback={null}>
            <LogisticsSceneContent
              isPlaying={isPlaying}
              isNightMode={isNightMode}
              sceneProgress={activeProgress}
              customTransforms={customTransforms}
              onSelectEntity={handleEntitySelect}
            />
          </Suspense>
        </Canvas>
      ) : (
        <div className="absolute inset-0 z-40 bg-[#082F49]/95 p-8 flex flex-col items-center justify-center text-center space-y-4 text-white">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 flex items-center justify-center">
            <Info className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h4 className="text-lg font-bold text-sky-300">
              {isAr ? 'عرض المنظومة اللوجستية 3D' : '3D Logistics Scene'}
            </h4>
            <p className="text-xs text-slate-300">
              {isAr ? 'تعذر تحميل سياق 3D. اضغط لإعادة المحاولة.' : 'WebGL context initialized or fallback available.'}
            </p>
          </div>
          <button
            onClick={() => setHasError(false)}
            className="px-5 py-2.5 bg-[#0F4C75] text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer hover:bg-[#135D8D]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة تشغيل المحرك 3D' : 'Restart 3D Engine'}</span>
          </button>
        </div>
      )}

      {/* Header Overlay Controls */}
      {!hideTopBar && (
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Title Badge */}
          <div className="pointer-events-auto bg-[#082F49]/90 backdrop-blur border border-[#0F4C75] px-4 py-2 rounded-2xl flex items-center gap-3 text-white shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-sky-300 tracking-wide uppercase flex items-center gap-1.5">
                <span>{isAr ? 'منظومة أجا اللوجستية 3D' : 'AJA Logistics 3D Ecosystem'}</span>
                <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-md border border-sky-400/30">
                  LIVE
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                {isAr ? 'مشهد متكامل: سفينة • ميناء • رافعات • شاحنات • مسارات' : 'Integrated: Ship • Port • Cranes • Fleet • Routes'}
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="pointer-events-auto bg-[#082F49]/90 backdrop-blur border border-[#0F4C75] px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-slate-200 hover:text-sky-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-sky-300" /> : <Play className="w-4 h-4 text-sky-300" />}
            </button>
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-2 text-slate-200 hover:text-sky-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title={isNightMode ? 'Day Mode' : 'Night Mode'}
            >
              {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
            </button>
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="p-2 text-slate-200 hover:text-sky-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title={isFullWidth ? 'Minimize' : 'Fullscreen'}
            >
              {isFullWidth ? <Minimize2 className="w-4 h-4 text-sky-300" /> : <Maximize2 className="w-4 h-4 text-sky-300" />}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Deconstruction Scrubber Control Bar */}
      {!hideScrubber && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
          <div className="bg-[#082F49]/95 backdrop-blur border border-[#0F4C75] rounded-2xl p-3 sm:p-4 text-white shadow-2xl space-y-2.5">
            {/* Phase Badge & Description */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${phaseInfo.badgeColor}`}>
                  {isAr ? phaseInfo.titleAr : phaseInfo.titleEn}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-sky-300 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{progressPercent}% {isAr ? 'نسبة التفكيك' : 'DECONSTRUCTED'}</span>
              </div>
            </div>

            {/* Interactive Range Slider Scrubber */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={(e) => {
                  setIsAutoSequence(false);
                  setInternalProgress(parseFloat(e.target.value) / 100);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0F4C75]"
              />
            </div>

            {/* Controls & Quick Phase Jump Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAutoSequence(!isAutoSequence)}
                  className="px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isAutoSequence ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAr ? (isAutoSequence ? 'إيقاف التفكيك' : 'تشغيل التسلسل') : (isAutoSequence ? 'Pause Sequence' : 'Play Sequence')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsAutoSequence(false);
                    setInternalProgress(0);
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-medium text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isAr ? 'إعادة التجميع' : 'Reset Scene'}</span>
                </button>
              </div>

              {/* Quick Phase Jump Buttons */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {[
                  { p: 0.0, label: 'P1 (0%)' },
                  { p: 0.3, label: 'P2 (30%)' },
                  { p: 0.5, label: 'P3 (50%)' },
                  { p: 0.7, label: 'P4 (70%)' },
                  { p: 1.0, label: 'P5 (100%)' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoSequence(false);
                      setInternalProgress(item.p);
                    }}
                    className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      Math.abs(activeProgress - item.p) < 0.12
                        ? 'bg-[#0F4C75] text-white border-[#0F4C75] font-bold'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Entity Modal Card Overlay */}
      {selectedEntity && (
        <div className="absolute bottom-28 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-20 pointer-events-auto">
          <div className="glass-card border border-[#0F4C75] rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-[#082F49]/90 backdrop-blur">
            <button
              onClick={() => setSelectedEntity(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {isAr ? selectedEntity.nameAr : selectedEntity.nameEn}
                </h4>
                <p className="text-[11px] text-sky-300 font-semibold">
                  {isAr ? selectedEntity.categoryAr : selectedEntity.categoryEn}
                </p>
              </div>
            </div>

            <div className="bg-[#082F49]/60 rounded-xl p-3 border border-white/5 space-y-2 mb-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">{isAr ? 'الحالة الحالية:' : 'Status:'}</span>
                <span className="font-bold text-emerald-400">
                  {isAr ? selectedEntity.statusAr : selectedEntity.statusEn}
                </span>
              </div>
              {selectedEntity.telemetry.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-400">{isAr ? t.labelAr : t.labelEn}</span>
                  <span className="font-mono text-slate-200 font-semibold">{t.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="w-full py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isAr ? 'إغلاق نافذة التفاصيل' : 'Close Entity Telemetry'}</span>
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsScene;
