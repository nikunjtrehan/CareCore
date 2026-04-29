// src/components/ui/checkbox.jsx
import React, { useState } from 'react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e) => {
    const val = e.target.checked;
    setInternalChecked(val);
    onCheckedChange?.(val);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        className="sr-only peer"
        {...props}
      />
      <div
        onClick={() => {
          const next = !isChecked;
          setInternalChecked(next);
          onCheckedChange?.(next);
        }}
        className={cn(
          'w-4 h-4 rounded border-2 border-[#1F2937]/30 flex items-center justify-center cursor-pointer transition-all',
          isChecked ? 'bg-[#ef4444] border-[#ef4444]' : 'bg-transparent',
          className
        )}
      >
        {isChecked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        )}
      </div>
    </div>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;
