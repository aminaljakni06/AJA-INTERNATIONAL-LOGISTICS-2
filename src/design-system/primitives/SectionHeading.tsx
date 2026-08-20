import React from 'react';
import { clsx } from 'clsx';
import { Badge } from './Badge';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'start' | 'center' | 'end';
  size?: 'sm' | 'md' | 'lg';
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  size = 'md',
  action,
  className,
  titleClassName,
}) => {
  const alignClasses = {
    start: 'text-start items-start',
    center: 'text-center items-center mx-auto',
    end: 'text-end items-end ms-auto',
  };

  const titleSizes = {
    sm: 'text-2xl sm:text-3xl font-bold',
    md: 'text-3xl sm:text-4xl lg:text-5xl font-extrabold',
    lg: 'text-4xl sm:text-5xl lg:text-6xl font-black',
  };

  return (
    <div className={clsx('flex flex-col mb-10 md:mb-14 max-w-3xl', alignClasses[align], className)}>
      {eyebrow && (
        <Badge
          variant="accent"
          size="sm"
          className="mb-3 tracking-wider uppercase font-bold text-xs shadow-glow-cyan-sm"
        >
          {eyebrow}
        </Badge>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <h2
          className={clsx(
            'text-gradient-cyan tracking-tight leading-tight text-white',
            titleSizes[size],
            titleClassName
          )}
        >
          {title}
        </h2>

        {action && <div className="mt-2 sm:mt-0 shrink-0">{action}</div>}
      </div>

      {description && (
        <p className="mt-4 text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
};
