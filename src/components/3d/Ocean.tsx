import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps } from './types';

export interface OceanProps extends TransformProps {
  size?: number;
  segments?: number;
  waveSpeed?: number;
  color?: string;
}

export const Ocean: React.FC<OceanProps> = ({
  position = [0, -0.5, 0],
  rotation = [-Math.PI / 2, 0, 0],
  scale = 1,
  visible = true,
  opacity = 0.95,
  size = 180,
  segments = 40,
  waveSpeed = 1,
  color = '#0c2540',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(size, size, segments, segments);
  }, [size, segments]);

  const originalPositions = useMemo(() => {
    return geometry.attributes.position.clone();
  }, [geometry]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * waveSpeed;
    const posAttr = meshRef.current.geometry.attributes.position;
    const origAttr = originalPositions;

    for (let i = 0; i < posAttr.count; i++) {
      const u = origAttr.getX(i);
      const v = origAttr.getY(i);
      const z =
        Math.sin(u * 0.12 + time * 1.5) * 0.35 +
        Math.cos(v * 0.12 + time * 1.2) * 0.25;
      posAttr.setZ(i, z);
    }
    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={meshRef} geometry={geometry} receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.8}
          transparent={opacity < 1}
          opacity={opacity}
          flatShading
        />
      </mesh>
    </group>
  );
};

export default Ocean;
