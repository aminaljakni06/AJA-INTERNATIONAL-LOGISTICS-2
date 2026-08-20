import React from 'react';
import { TransformProps, LogisticsEntityData } from './types';

export interface PortProps extends TransformProps {
  onSelect?: (data: LogisticsEntityData) => void;
}

const portEntityData: LogisticsEntityData = {
  id: 'AJA-PORT-TERM-01',
  nameEn: 'Jeddah Gateway Terminal & Deep Water Berth',
  nameAr: 'محطة الميناء الرئيسية والأرصفة العميقة',
  categoryEn: 'Port Infrastructure & Maritime Hub',
  categoryAr: 'بنية الميناء والمركز البحري',
  statusEn: 'Fully Operational / Automated Gates',
  statusAr: 'يعمل بالطاقة الكاملة / بوابات ذكية',
  telemetry: [
    { labelEn: 'Berth Length', labelAr: 'طول الرصيف', value: '1,200 meters' },
    { labelEn: 'Max Depth', labelAr: 'العمق المائي', value: '18.0 meters' },
    { labelEn: 'Yard Capacity', labelAr: 'سعة ساحة التجميع', value: '450,000 TEU' },
    { labelEn: 'Customs Gate Status', labelAr: 'بوابات التفتيش الآلي', value: 'Express Clearance Active' },
  ],
};

export const Port: React.FC<PortProps> = ({
  position = [12, 1.5, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  onSelect,
}) => {
  if (!visible) return null;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(portEntityData);
      }}
    >
      {/* Concrete Dock Platform */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[45, 3, 70]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.8}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {/* Yellow Quay Safety Line */}
      <mesh position={[-22.2, 0.05, 0]}>
        <boxGeometry args={[0.6, 3.05, 70]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>

      {/* Dock Mooring Bollards */}
      {[-30, -18, -6, 6, 18, 30].map((zPos, idx) => (
        <group key={idx} position={[-22, 1.8, zPos]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.8, 12]} />
            <meshStandardMaterial color="#0F4C75" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.3, 0.25, 12]} />
            <meshStandardMaterial color="#0F4C75" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Main Terminal Logistics Warehouse Building */}
      <group position={[12, 5, -18]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[18, 7, 24]} />
          <meshStandardMaterial
            color="#082F49"
            roughness={0.4}
            metalness={0.3}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
        {/* Roof Accent */}
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[18.5, 0.6, 24.5]} />
          <meshStandardMaterial color="#0F4C75" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Warehouse Glass Doors with Brand Blue Glow */}
        <mesh position={[-9.1, -1.2, 0]}>
          <boxGeometry args={[0.2, 3.5, 14]} />
          <meshStandardMaterial
            color="#2563EB"
            emissive="#0F4C75"
            emissiveIntensity={0.3}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Secondary Administration Office Building */}
      <group position={[12, 4, 18]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[16, 5, 18]} />
          <meshStandardMaterial color="#082F49" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[16.4, 0.4, 18.4]} />
          <meshStandardMaterial color="#0F4C75" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

export default Port;
