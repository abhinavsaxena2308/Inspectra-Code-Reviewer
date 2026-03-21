import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gh-green text-white hover:bg-[#2ea043] border border-[#347d39] shadow-sm',
      secondary: 'bg-gh-header text-gh-text hover:bg-gh-bg border border-gh-border shadow-sm',
      ghost: 'bg-transparent hover:bg-gh-muted/10 text-gh-muted hover:text-gh-text',
      outline: 'bg-transparent border border-gh-border hover:bg-gh-muted/10 text-gh-text',
      danger: 'bg-transparent border border-gh-border text-gh-red hover:bg-gh-red hover:text-white',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
      icon: 'p-1.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-100 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : null}
        {children}
      </button>
    );
  }
);
