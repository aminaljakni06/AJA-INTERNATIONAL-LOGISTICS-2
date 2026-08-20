import React from 'react';
import { Button as PrimitiveButton, ButtonProps as PrimitiveButtonProps } from '../../design-system/primitives/Button';

export interface ButtonProps extends Omit<PrimitiveButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = (props) => {
  return <PrimitiveButton {...props} />;
};

export default Button;
