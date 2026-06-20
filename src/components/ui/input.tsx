import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 transition-colors outline-none shadow-theme-xs',
        'placeholder:text-gray-400 dark:placeholder:text-white/30',
        'focus-visible:border-brand-300 focus-visible:ring-3 focus-visible:ring-brand-500/10 dark:focus-visible:border-brand-800',
        'dark:bg-gray-900/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-50',
        'aria-invalid:border-error-500 aria-invalid:ring-3 aria-invalid:ring-error-500/20 dark:aria-invalid:border-error-500',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
