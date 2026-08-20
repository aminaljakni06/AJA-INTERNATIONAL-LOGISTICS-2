import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformProps, LogisticsEntityData } from './types';

export interface NetworkNodesProps extends TransformProps {
  animated?: boolean;
  sceneProgress?: number;
  onSelect?: (data: LogisticsEntityData) => void;
}

const networkNodesData = [
  {
    id: 'NODE-JEDDAH',
    nameEn: 'Jeddah Sea Port Gateway Node',
    nameAr: 'عقدة ميناء جدة الإسلامي الرئيسي',
    pos: new THREE.Vector3(-12, 12, -2),
    finalPos: new THREE.Vector3(-22, 26, -5),
    statusEn: 'Primary Maritime Hub Active',
    statusAr: 'البوابة البحرية الرئيسية - نشطة',
  },
  {
    id: 'NODE-RIYADH',
    nameEn: 'Riyadh Central Logistics Hub Node',
    nameAr: 'عقدة المركز اللوجستي الرئيسي بالرياض',
    pos: new THREE.Vector3(28, 14, 28),
    finalPos: new THREE.Vector3(38, 28, 38),
    statusEn: 'Inland Customs Hub Active',
    statusAr: 'الميناء الجاف بمدينة الرياض - نشط',
  },
  {
    id: 'NODE-DAMMAM',
    nameEn: 'King Abdulaziz Dammam Port Node',
    nameAr: 'عقدة ميناء الملك عبد العزيز بالدمام',
    pos: new THREE.Vector3(45, 12, -10),
    finalPos: new THREE.Vector3(55, 24, -18),
    statusEn: 'GCC Gateway Hub Active',
    statusAr: 'بوابة الخليج العربي - نشطة',
  },
];

export const NetworkNodes: React.FC<NetworkNodesProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  opacity = 1,
  animated = true,
  sceneProgress = 0,
  onSelect,
}) => {
  const nodeRefs = useRef<THREE.Group[]>([]);
  const arcPulseRef = useRef<THREE.Mesh>(null);

  // Network reveal factor (Phase 4 & 5: 60% to 100%)
  const networkReveal = Math.max(0, Math.min(1, (sceneProgress - 0.4) / 0.6));

  // Glowing connecting arc between nodes
  const arcCurve = useMemo(() => {
    const p1 = networkNodesData[0].pos.clone().lerp(networkNodesData[0].finalPos, networkReveal);
    const p2 = networkNodesData[1].pos.clone().lerp(networkNodesData[1].finalPos, networkReveal);
    const mid = new THREE.Vector3((p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + 12, (p1.z + p2.z) / 2);
    return new THREE.CatmullRomCurve3([p1, mid, p2]);
  }, [networkReveal]);

  const arcCurvePoints = useMemo(() => {
    return arcCurve.getPoints(60);
  }, [arcCurve]);

  const arcGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(arcCurvePoints);
  }, [arcCurvePoints]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (arcPulseRef.current) {
      const u = (t * 0.4) % 1;
      const point = arcCurve.getPoint(u);
      arcPulseRef.current.position.copy(point);
    }
    nodeRefs.current.forEach((node, idx) => {
      if (!node) return;
      const ring = node.children[1];
      if (ring) {
        const s = 1 + Math.sin(t * 3.5 + idx) * (0.2 + networkReveal * 0.3);
        ring.scale.set(s, s, s);
      }
    });
  });

  if (!visible) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Connecting Data Arc */}
      <primitive
        object={
          new THREE.Line(
            arcGeometry,
            new THREE.LineDashedMaterial({
              color: '#2563EB',
              linewidth: 2,
              dashSize: 2,
              gapSize: 1,
            })
          )
        }
      />

      {/* Pulsing Light Trail along Arc */}
      <mesh ref={arcPulseRef}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial color="#2563EB" />
      </mesh>

      {/* Logistics Network Nodes */}
      {networkNodesData.map((node, idx) => {
        const currentPos = node.pos.clone().lerp(node.finalPos, networkReveal);

        const entity: LogisticsEntityData = {
          id: node.id,
          nameEn: node.nameEn,
          nameAr: node.nameAr,
          categoryEn: 'Digital Logistics Control Node',
          categoryAr: 'عقدة التحكم والبيانات اللوجستية',
          statusEn: node.statusEn,
          statusAr: node.statusAr,
          telemetry: [
            { labelEn: 'Data Throughput', labelAr: 'معدل تدفق البيانات', value: '2.4 Gbps / Live Telemetry' },
            { labelEn: 'Active Shipments', labelAr: 'الشحنات النشطة عبر العقدة', value: '1,420 Active Orders' },
            { labelEn: 'API Latency', labelAr: 'زمن استجابة التتبع', value: '12 ms (Realtime)' },
            { labelEn: 'Security Rating', labelAr: 'درجة الأمان والتشفير', value: 'Tier 4 Encrypted' },
          ],
        };

        return (
          <group
            key={node.id}
            ref={(el) => {
              if (el) nodeRefs.current[idx] = el;
            }}
            position={currentPos}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(entity);
            }}
          >
            {/* Core Glowing Orb */}
            <mesh castShadow>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial
                color="#2563EB"
                emissive="#0F4C75"
                emissiveIntensity={1.2}
                roughness={0.1}
                transparent={opacity < 1}
                opacity={opacity}
              />
            </mesh>

            {/* Outer Pulsing Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 2.4, 32]} />
              <meshBasicMaterial color="#0EA5E9" side={THREE.DoubleSide} transparent opacity={0.8} />
            </mesh>

            {/* Vertical Light Pillar */}
            <mesh position={[0, -node.pos.y / 2, 0]}>
              <cylinderGeometry args={[0.08, 0.08, node.pos.y, 8]} />
              <meshBasicMaterial color="#2563EB" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default NetworkNodes;
