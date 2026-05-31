import React from 'react';
import { cn } from '@/lib/utils';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export function Select({ className, children, ...props }: Props) {
  return (
    <div className={cn('relative inline-block w-full max-w-full group', className)}>
      <select
        {...props}
        className={cn(
          'appearance-none h-10 px-3 pr-10 text-sm border border-input rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-colors transition-shadow w-full',
          className,
        )}
      >
        {children}
      </select>

      {/* Arrow */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-150 group-focus-within:rotate-180">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline-block"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      {/* Focus ring helper for accessibility */}
    </div>
  );
}
