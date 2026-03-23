import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, style, hover = false, glass = false, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      style={style}
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
