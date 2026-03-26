import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-xs font-semibold text-on-surface-variant tracking-wider">{label}</label>}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-surface-container-lowest outline-none border-none py-1.5 transition-all duration-200 text-on-surface placeholder:text-on-surface-variant/50 text-sm rounded-md',
              'ring-1 ring-inset ring-outline-variant/20 hover:ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:shadow-[0_0_10px_rgba(162,201,255,0.15)]',
              icon ? 'pl-9 pr-3' : 'px-3',
              error && 'ring-error/50 hover:ring-error focus:ring-error focus:shadow-none',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error font-medium">{error}</p>}
      </div>
    );
  }
);

