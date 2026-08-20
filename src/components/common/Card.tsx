import React from 'react';
import { Card as PrimitiveCard, CardProps as PrimitiveCardProps } from '../../design-system/primitives/Card';

export interface CardProps extends PrimitiveCardProps {}

export const Card: React.FC<CardProps> = (props) => {
  return <PrimitiveCard {...props} />;
};

export default Card;
