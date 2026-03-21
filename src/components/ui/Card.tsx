import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover = false, glass = false, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'gh-box transition-colors',
        hover && 'hover:border-gh-muted/50',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
