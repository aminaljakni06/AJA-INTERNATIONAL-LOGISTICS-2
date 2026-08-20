import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps, LogisticsEntityData } from './types';

export interface CargoShipProps extends TransformProps {
  floatAnimation?: boolean;
  onSelect?: (data: LogisticsEntityData) => void;
}

const shipEntityData: LogisticsEntityData = {
  id: 'AJA-VESSEL-882',
  nameEn: 'Aja Horizon Vessel (Ultra Container Carrier)',
  nameAr: 'سفينة أجا هورايزون (ناقلة الحاويات العملاقة)',
  categoryEn: 'Maritime Freight / Sea Transportation',
  categoryAr: 'النقل البحري الدولي',
  statusEn: 'Docked & Unloading at Berth #4',
  statusAr: 'راسية وفي مرحلة التفريغ - رصيف 4',
  telemetry: [
    { labelEn: 'Draft Depth', labelAr: 'غاطس السفينة', value: '14.2 meters' },
    { labelEn: 'TEU Capacity', labelAr: 'سعة الحاويات', value: '18,500 TEU' },
    { labelEn: 'Current Port', labelAr: 'الميناء الحالي', value: 'Jeddah Islamic Port' },
    { labelEn: 'Origin Port', labelAr: 'ميناء المغادرة', value: 'Shanghai Port (CN)' },
  ],
};

export const CargoShip: React.FC<CargoShipProps> = ({
  position = [-28, 0, -8],
  rotation = [0, Math.PI / 6, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  floatAnimation = true,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !floatAnimation) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;
    groupRef.current.rotation.x = Math.cos(t * 0.9) * 0.015;
  });

  if (!visible) return null;

  const containerColors = ['#082F49', '#0EA5E9', '#0F4C75', '#64748B', '#0284C7', '#059669'];

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(shipEntityData);
      }}
    >
      {/* Red Keel Bottom */}
      <mesh position={[-1, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 1.2, 5.5]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.4} />
      </mesh>

      {/* Main Navy Blue Hull */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[24, 2.2, 6]} />
        <meshStandardMaterial
          color="#082F49"
          roughness={0.3}
          metalness={0.5}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Pointed Bow */}
      <mesh position={[12.8, 2.2, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0, 3, 2.2, 4]} />
        <meshStandardMaterial color="#082F49" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Superstructure Bridge */}
      <group position={[-8, 5.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4, 5, 4.5]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
        </mesh>

        {/* Windows */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[4.1, 0.8, 4.6]} />
          <meshStandardMaterial
            color="#0EA5E9"
            emissive="#0EA5E9"
            emissiveIntensity={0.5}
            roughness={0.1}
          />
        </mesh>

        {/* Radar Mast */}
        <mesh position={[-1, 3.2, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 2, 8]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.9} />
        </mesh>
      </group>

      {/* Container Stacks on Ship Deck */}
      {[-3, -0.5, 2, 4.5, 7, 9.5].map((xPos, xIdx) =>
        [-1.6, 0, 1.6].map((zPos, zIdx) =>
          [0, 1].map((yIdx) => {
            const color = containerColors[(xIdx + zIdx + yIdx) % containerColors.length];
            return (
              <mesh
                key={`${xIdx}-${zIdx}-${yIdx}`}
                position={[xPos, 3.8 + yIdx * 1.5, zPos]}
                castShadow
              >
                <boxGeometry args={[2.3, 1.4, 1.4]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
              </mesh>
            );
          })
        )
      )}
    </group>
  );
};

export default CargoShip;
