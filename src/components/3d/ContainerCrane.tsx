import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps, LogisticsEntityData } from './types';

export interface ContainerCraneProps extends TransformProps {
  animated?: boolean;
  onSelect?: (data: LogisticsEntityData) => void;
}

const craneEntityData: LogisticsEntityData = {
  id: 'AJA-CRANE-01',
  nameEn: 'STS Super Post-Panamax Gantry Crane #1',
  nameAr: 'رافعـة الميناء العملاقة (STS Gantry Crane)',
  categoryEn: 'Port Terminal Infrastructure / Operations',
  categoryAr: 'بنية الميناء والتشغيل الميداني',
  statusEn: 'Active Container Discharge Operation',
  statusAr: 'نشط - تفريغ الشحنات من السفينة لساحة التجميع',
  telemetry: [
    { labelEn: 'Lifting Load', labelAr: 'حمولة الرفع الحالية', value: '32.5 Tons' },
    { labelEn: 'Cycle Rate', labelAr: 'معدل النقل بالساعة', value: '38 Moves/Hour' },
    { labelEn: 'Reach Distance', labelAr: 'مدى الذراع المائي', value: '65 meters' },
    { labelEn: 'Power Status', labelAr: 'حالة الطاقة', value: 'Clean Electric Grid (Active)' },
  ],
};

export const ContainerCrane: React.FC<ContainerCraneProps> = ({
  position = [-8, 3, -5],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  animated = true,
  onSelect,
}) => {
  const hookRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!hookRef.current || !animated) return;
    const time = state.clock.getElapsedTime();
    hookRef.current.position.y = 12 + Math.sin(time * 1.2) * 3.5;
    hookRef.current.position.x = -6 + Math.cos(time * 0.8) * 4;
  });

  if (!visible) return null;

  const craneColor = '#0F4C75'; // Enterprise Primary Navy Blue

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(craneEntityData);
      }}
    >
      {/* 4 Main Gantry Structural Legs */}
      {[
        [0, 9, -5],
        [0, 9, 5],
        [8, 9, -5],
        [8, 9, 5],
      ].map((legPos, idx) => (
        <mesh key={idx} position={legPos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 18]} />
          <meshStandardMaterial
            color={craneColor}
            roughness={0.3}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Cross Bracing Bars */}
      <mesh position={[4, 14, -5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color={craneColor} />
      </mesh>
      <mesh position={[4, 14, 5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color={craneColor} />
      </mesh>

      {/* Top Girder Boom Beam */}
      <mesh position={[-3, 18, 0]} castShadow>
        <boxGeometry args={[26, 1.2, 2.5]} />
        <meshStandardMaterial color={craneColor} roughness={0.3} />
      </mesh>

      {/* Trolley Control Cab */}
      <mesh position={[0, 18.8, 0]} castShadow>
        <boxGeometry args={[3, 1.8, 2]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.1} />
      </mesh>

      {/* Animated Hook & Spreader Assembly */}
      <group ref={hookRef} position={[-8, 14, 0]}>
        {/* Steel Hoisting Cables */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 6]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>

        {/* Spreader Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.4, 1.5]} />
          <meshStandardMaterial color="#082F49" metalness={0.8} />
        </mesh>

        {/* Suspended Container */}
        <mesh position={[0, -0.9, 0]} castShadow>
          <boxGeometry args={[2.8, 1.4, 1.4]} />
          <meshStandardMaterial color="#0EA5E9" roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

export default ContainerCrane;
