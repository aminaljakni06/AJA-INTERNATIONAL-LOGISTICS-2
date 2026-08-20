import React from 'react';
import { LogisticsScene, LogisticsSceneProps } from '../3d/LogisticsScene';
import { LogisticsEntityData } from '../3d/types';

export type Selected3DItem = LogisticsEntityData;
export type { LogisticsSceneProps };

export const Logistics3DScene: React.FC<LogisticsSceneProps> = (props) => {
  return <LogisticsScene {...props} />;
};

export default Logistics3DScene;
