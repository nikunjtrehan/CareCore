// src/components/TestimonialsSection.jsx
import React from 'react';
import { StaggerTestimonials } from './ui/stagger-testimonials';

export default function TestimonialsSection() {
  return (
    <section className="w-full py-16" style={{ background: '#FDFCF8' }}>
      <div className="max-w-6xl mx-auto px-6 mb-4 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] mb-3" style={{ color: 'rgba(31,41,55,0.4)' }}>
          Trusted by clinicians worldwide
        </p>
        <h2 className="font-mono text-4xl md:text-5xl font-bold leading-tight" style={{ color: '#1F2937' }}>
          Real voices. Real outcomes.
        </h2>
        <p className="mt-3 font-sans text-base max-w-md mx-auto" style={{ color: 'rgba(31,41,55,0.55)' }}>
          Click any card to explore — or use the arrows to browse.
        </p>
      </div>

      <StaggerTestimonials />
    </section>
  );
}
