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
              'w-full bg-surface-container-low border border-outline-variant/30 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline text-on-surface placeholder:text-on-surface-variant/50 transition-colors',
              error && 'border-error focus:border-error focus:ring-error',
              icon && 'pl-10',
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

