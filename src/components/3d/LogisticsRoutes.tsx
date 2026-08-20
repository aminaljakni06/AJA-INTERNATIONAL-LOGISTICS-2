import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps } from './types';

export interface LogisticsRoutesProps extends TransformProps {
  seaColor?: string;
  roadColor?: string;
  sceneProgress?: number;
}

export const LogisticsRoutes: React.FC<LogisticsRoutesProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  seaColor = '#2563EB',
  roadColor = '#082F49',
  sceneProgress = 0,
}) => {
  const lightTrail1Ref = useRef<THREE.Mesh>(null);
  const lightTrail2Ref = useRef<THREE.Mesh>(null);

  // Phase 4 & 5 boost visibility (60% to 100%)
  const routeVisibility = Math.min(1, Math.max(0.3, sceneProgress * 1.2));
  const glowIntensity = Math.min(2, 0.5 + sceneProgress * 1.5);

  // Curved sea route curve
  const seaCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-70, 0.5, -40),
      new THREE.Vector3(-45, 0.5, -20),
      new THREE.Vector3(-25, 0.5, -5),
      new THREE.Vector3(-12, 0.5, 5),
    ]);
  }, []);

  const seaCurvePoints = useMemo(() => {
    return seaCurve.getPoints(80);
  }, [seaCurve]);

  const seaLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(seaCurvePoints);
  }, [seaCurvePoints]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightTrail1Ref.current) {
      const u = (t * 0.25) % 1;
      const point = seaCurve.getPoint(u);
      lightTrail1Ref.current.position.copy(point);
    }
    if (lightTrail2Ref.current) {
      const x = -8 + ((t * 20) % 54);
      lightTrail2Ref.current.position.set(x, 3.6, 28);
    }
  });

  if (!visible) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Maritime Sea Shipping Lane (Glowing Line) */}
      <primitive
        object={
          new THREE.Line(
            seaLineGeometry,
            new THREE.LineBasicMaterial({
              color: seaColor,
              linewidth: 4,
              transparent: true,
              opacity: routeVisibility,
            })
          )
        }
      />

      {/* Maritime Light Trail Pulse */}
      <mesh ref={lightTrail1Ref}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial color="#2563EB" />
      </mesh>

      {/* Elevated Holographic Guide Ribbon (Phase 4 reveal) */}
      {sceneProgress > 0.4 && (
        <mesh position={[0, 1.5, -15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 0.6]} />
          <meshBasicMaterial color="#2563EB" transparent opacity={sceneProgress * 0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Paved Asphalt Highway Ribbon */}
      <mesh position={[20, 3.2, 28]} receiveShadow>
        <boxGeometry args={[65, 0.4, 10]} />
        <meshStandardMaterial
          color={roadColor}
          roughness={0.9}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Highway Light Trail Pulse */}
      <mesh ref={lightTrail2Ref}>
        <boxGeometry args={[2.5, 0.3, 0.6]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>

      {/* Highway Lane Marking Stripes */}
      {[-8, -2, 4, 10, 16, 22, 28, 34, 40, 46].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 3.42, 28]}>
          <boxGeometry args={[3, 0.05, 0.4]} />
          <meshBasicMaterial color="#F59E0B" opacity={routeVisibility} transparent />
        </mesh>
      ))}

      {/* Port Entrance Connection Road */}
      <mesh position={[5, 3.15, 12]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
        <boxGeometry args={[25, 0.35, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default LogisticsRoutes;

