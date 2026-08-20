import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps, LogisticsEntityData } from './types';

export interface CargoTruckProps extends TransformProps {
  id?: string;
  truckName?: string;
  truckColor?: string;
  containerColor?: string;
  driveSpeed?: number;
  minX?: number;
  maxX?: number;
  direction?: 1 | -1;
  onSelect?: (data: LogisticsEntityData) => void;
}

export const CargoTruck: React.FC<CargoTruckProps> = ({
  id = 'AJA-TRK-771',
  truckName = 'Aja Heavy Duty Heavy Haulage Truck #771',
  position = [0, 3.4, 26],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  truckColor = '#082F49',
  containerColor = '#0F4C75',
  driveSpeed = 0.12,
  minX = -12,
  maxX = 52,
  direction = 1,
  onSelect,
}) => {
  const truckRef = useRef<THREE.Group>(null);

  const truckEntityData: LogisticsEntityData = {
    id,
    nameEn: truckName,
    nameAr: 'شاحنة أجا للنقل البري المتقدم',
    categoryEn: 'Land Freight & Highway Fleet',
    categoryAr: 'النقل البري والأسطول الميداني',
    statusEn: 'In Transit to Inland Terminal',
    statusAr: 'في الطريق إلى مركز التوزيع اللوجستي',
    telemetry: [
      { labelEn: 'Speed', labelAr: 'السرعة الحالية', value: '85 km/h' },
      { labelEn: 'Driver ID', labelAr: 'السائق المعين', value: 'Captain Mohammed A.' },
      { labelEn: 'GPS Location', labelAr: 'إحداثيات GPS', value: '24.7136° N, 46.6753° E' },
      { labelEn: 'Cargo Load', labelAr: 'الحمولة', value: 'Sealed ISO Freight Container' },
    ],
  };

  useFrame(() => {
    if (!truckRef.current || driveSpeed === 0) return;
    truckRef.current.position.x += driveSpeed * direction;

    if (direction === 1 && truckRef.current.position.x > maxX) {
      truckRef.current.position.x = minX;
    } else if (direction === -1 && truckRef.current.position.x < minX) {
      truckRef.current.position.x = maxX;
    }
  });

  if (!visible) return null;

  return (
    <group
      ref={truckRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(truckEntityData);
      }}
    >
      {/* Cabin */}
      <mesh position={[3.5, 1.3, 0]} castShadow>
        <boxGeometry args={[2.5, 2.2, 2.2]} />
        <meshStandardMaterial
          color={truckColor}
          roughness={0.2}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Windshield Glass */}
      <mesh position={[4.6, 1.6, 0]}>
        <boxGeometry args={[0.3, 1.0, 2.0]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.1} emissive="#0EA5E9" emissiveIntensity={0.2} />
      </mesh>

      {/* Headlights */}
      <mesh position={[4.75, 0.7, 0.8]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[4.75, 0.7, -0.8]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Trailer Flatbed Chassis */}
      <mesh position={[-1, 0.5, 0]} castShadow>
        <boxGeometry args={[6, 0.5, 2.2]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>

      {/* Wheels */}
      {[-3, -1, 1, 3.5].map((xPos, idx) => (
        <group key={idx}>
          <mesh position={[xPos, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
          <mesh position={[xPos, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Mounted Cargo Container */}
      <mesh position={[-1, 1.8, 0]} castShadow>
        <boxGeometry args={[5.8, 2.2, 2.2]} />
        <meshStandardMaterial color={containerColor} roughness={0.3} />
      </mesh>
    </group>
  );
};

export default CargoTruck;
