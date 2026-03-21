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
        {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-gh-bg border border-gh-border rounded-md py-1.5 transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-gh-blue/30 focus:border-gh-blue text-gh-text placeholder:text-gh-muted text-sm',
              icon ? 'pl-9 pr-3' : 'px-3',
              error && 'border-gh-red focus:border-gh-red focus:ring-gh-red/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);
