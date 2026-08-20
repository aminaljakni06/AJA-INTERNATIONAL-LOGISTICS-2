import React from 'react';
import { Badge as PrimitiveBadge, BadgeProps as PrimitiveBadgeProps } from '../../design-system/primitives/Badge';

export interface BadgeProps extends PrimitiveBadgeProps {}

export const Badge: React.FC<BadgeProps> = (props) => {
  return <PrimitiveBadge {...props} />;
};

export default Badge;
