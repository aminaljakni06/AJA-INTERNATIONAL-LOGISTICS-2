import React from 'react';
import { clsx } from 'clsx';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: React.ElementType;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-[1400px]',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: 'px-0',
  sm: 'px-3 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
  xl: 'px-8 sm:px-12 lg:px-16',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = '7xl',
  padding = 'md',
  as: Component = 'div',
  className,
  ...props
}) => {
  return React.createElement(
    Component,
    {
      className: clsx('w-full mx-auto', sizeClasses[size], paddingClasses[padding], className),
      ...props,
    },
    children
  );
};
