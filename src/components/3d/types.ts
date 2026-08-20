export interface TransformProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  visible?: boolean;
  opacity?: number;
}

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number] | number;
  opacity?: number;
}

export type DeconstructionPhase = 1 | 2 | 3 | 4 | 5;

export interface EntityTelemetry {
  labelEn: string;
  labelAr: string;
  value: string;
}

export interface LogisticsEntityData {
  id: string;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  statusEn: string;
  statusAr: string;
  telemetry: EntityTelemetry[];
}

