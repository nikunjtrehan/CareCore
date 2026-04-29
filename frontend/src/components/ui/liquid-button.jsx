// src/components/ui/liquid-button.jsx
import { cn } from '../../lib/utils';

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="liquid-glass"
          x="0%" y="0%" width="100%" height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function LiquidButton({ className, children, ...props }) {
  return (
    <>
      <button
        data-slot="button"
        className={cn(
          'relative inline-flex items-center justify-center cursor-pointer gap-2',
          'whitespace-nowrap rounded-full text-sm font-semibold',
          'h-10 px-6',
          'transition-all duration-300 hover:scale-105',
          'bg-transparent text-white',
          className
        )}
        {...props}
      >
        {/* Glass distortion layer */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backdropFilter: 'url("#liquid-glass")' }}
        />
        {/* Gloss shadow ring */}
        <div
          className="absolute inset-0 rounded-full transition-all"
          style={{
            boxShadow: [
              '0 0 6px rgba(0,0,0,0.03)',
              '0 2px 6px rgba(0,0,0,0.08)',
              'inset 3px 3px 0.5px -3px rgba(255,255,255,0.15)',
              'inset -3px -3px 0.5px -3px rgba(255,255,255,0.1)',
              'inset 1px 1px 1px -0.5px rgba(255,255,255,0.5)',
              'inset -1px -1px 1px -0.5px rgba(255,255,255,0.4)',
              'inset 0 0 6px 6px rgba(255,255,255,0.06)',
              'inset 0 0 2px 2px rgba(255,255,255,0.04)',
              '0 0 12px rgba(255,255,255,0.1)',
            ].join(', '),
          }}
        />
        {/* Content */}
        <span className="relative z-10">{children}</span>
        <GlassFilter />
      </button>
    </>
  );
}
