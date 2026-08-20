import React from 'react';
import { TransformProps, LogisticsEntityData } from './types';

export interface ShippingContainersProps extends TransformProps {
  rows?: number;
  cols?: number;
  maxHeight?: number;
  deconstructionProgress?: number;
  onSelect?: (data: LogisticsEntityData) => void;
}

const containerColors = ['#082F49', '#0EA5E9', '#0F4C75', '#64748B', '#10B981', '#0284C7'];

export const ShippingContainers: React.FC<ShippingContainersProps> = ({
  position = [10, 3, 10],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  rows = 4,
  cols = 5,
  maxHeight = 3,
  deconstructionProgress = 0,
  onSelect,
}) => {
  if (!visible) return null;

  let containerCount = 0;
  const items: Array<{
    id: string;
    pos: [number, number, number];
    color: string;
    entity: LogisticsEntityData;
  }> = [];

  const spread = Math.max(0, Math.min(1, (deconstructionProgress - 0.2) / 0.8));

  for (let x = 0; x < rows; x++) {
    for (let z = 0; z < cols; z++) {
      const height = ((x + z) % maxHeight) + 1;
      for (let y = 0; y < height; y++) {
        const idNum = 88290 + containerCount;
        const color = containerColors[(x + z + y) % containerColors.length];
        const entity: LogisticsEntityData = {
          id: `AJA-CNT-${idNum}`,
          nameEn: `AJA ISO Smart Container #${idNum}`,
          nameAr: `حاوية أجا الذكية المعتمدة #${idNum}`,
          categoryEn: 'Cargo Unit & Inventory',
          categoryAr: 'وحدة شحن ومخزون معتمد',
          statusEn: 'Customs Cleared & Sealed',
          statusAr: 'مفحوصة جمركياً وجاهزة للتحميل',
          telemetry: [
            { labelEn: 'Seal Number', labelAr: 'رقم الختم الجمركي', value: `AJA-SEAL-${idNum}` },
            { labelEn: 'Gross Weight', labelAr: 'الوزن الإجمالي', value: '24,180 kg' },
            { labelEn: 'Temp / Humidity', labelAr: 'الحرارة والرطوبة', value: '22°C | 45% RH' },
            { labelEn: 'Destination', labelAr: 'الوجهة النهاية', value: 'Riyadh Inland Hub' },
          ],
        };

        const initialX = x * 4.8;
        const initialY = 1.1 + y * 2.3;
        const initialZ = z * 2.8;

        const finalX = x * 8.2 - 6;
        const finalY = 1.1 + y * 5.2 + (x + z) * 0.9;
        const finalZ = z * 5.8 - 6;

        const posX = initialX + (finalX - initialX) * spread;
        const posY = initialY + (finalY - initialY) * spread;
        const posZ = initialZ + (finalZ - initialZ) * spread;

        items.push({
          id: `AJA-CNT-${idNum}`,
          pos: [posX, posY, posZ],
          color,
          entity,
        });

        containerCount++;
      }
    }
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {items.map((item) => (
        <mesh
          key={item.id}
          position={item.pos}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(item.entity);
          }}
        >
          <boxGeometry args={[4.2, 2.2, 2.2]} />
          <meshStandardMaterial
            color={item.color}
            roughness={0.3}
            metalness={0.2}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ShippingContainers;
