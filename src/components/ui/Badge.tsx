import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
  const variants = {
    success: 'bg-[#23863620] text-[#3fb950] border-[#23863640]',
    warning: 'bg-[#d2992220] text-[#d29922] border-[#d2992240]',
    error: 'bg-[#da363320] text-[#f85149] border-[#da363340]',
    info: 'bg-[#58a6ff20] text-[#58a6ff] border-[#58a6ff40]',
    neutral: 'bg-[#8b949e20] text-[#8b949e] border-[#8b949e40]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
