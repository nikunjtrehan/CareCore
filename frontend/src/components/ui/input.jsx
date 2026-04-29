// src/components/ui/input.jsx
import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
        'placeholder:text-[#1F2937]/30 disabled:cursor-not-allowed disabled:opacity-50',
        'focus:ring-2 focus:ring-[#ef4444]/20 focus:border-[#ef4444]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
export default Input;
