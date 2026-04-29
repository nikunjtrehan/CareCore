// src/components/ui/stagger-testimonials.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "CareCore doesn't just organize data — it thinks like a clinician. Our ICU team saved 2 hours of manual lookups per shift.",
    by: "Dr. Sarah Chen, Chief of Medicine at Stanford Hospital",
    imgSrc: "https://i.pravatar.cc/150?img=1"
  },
  {
    tempId: 1,
    testimonial: "The shift handoff feature alone is worth it. My team's handoff errors dropped to zero in the first month.",
    by: "James Okoye, Head Nurse at Lagos Teaching Hospital",
    imgSrc: "https://i.pravatar.cc/150?img=2"
  },
  {
    tempId: 2,
    testimonial: "I can finally understand my own health data. The timeline view showed me my full treatment journey without any medical jargon.",
    by: "Priya Nair, Patient, Cardiology Dept.",
    imgSrc: "https://i.pravatar.cc/150?img=3"
  },
  {
    tempId: 3,
    testimonial: "I asked 'which patients had HbA1c over 8 this quarter?' and got a formatted table in under 2 seconds. Remarkable.",
    by: "Dr. Marcus Weil, Attending Physician at Berlin Charité",
    imgSrc: "https://i.pravatar.cc/150?img=4"
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars, I'd give 12. CareCore is the clinical tool we never knew we needed.",
    by: "Dr. Amara Diallo, Head of Pediatrics at Nairobi Hospital",
    imgSrc: "https://i.pravatar.cc/150?img=5"
  },
  {
    tempId: 5,
    testimonial: "SO HAPPY WE FOUND THIS! I'd bet it's saved me 100 hours of documentation in the first 3 months alone.",
    by: "Jeremy Lau, Clinical Coordinator at SingHealth",
    imgSrc: "https://i.pravatar.cc/150?img=6"
  },
  {
    tempId: 6,
    testimonial: "Took some convincing to switch, but now that we're on CareCore, we're never going back. The AI summaries are phenomenal.",
    by: "Dr. Pam Foster, Medical Director at Westside Clinic",
    imgSrc: "https://i.pravatar.cc/150?img=7"
  },
  {
    tempId: 7,
    testimonial: "The in-depth analytics are indispensable. I can track population health trends I never had visibility into before.",
    by: "Daniel Reyes, Healthcare Data Scientist at WHO",
    imgSrc: "https://i.pravatar.cc/150?img=8"
  },
  {
    tempId: 8,
    testimonial: "It's just the best platform in the space. Period. Every feature is built with clinicians in mind.",
    by: "Dr. Fernando Costa, Chief Resident at Hospital São Paulo",
    imgSrc: "https://i.pravatar.cc/150?img=9"
  },
  {
    tempId: 9,
    testimonial: "I switched 2 years ago and never looked back. The natural language queries are witchcraft — in the best possible way.",
    by: "Andy Park, Hospital IT Director at Seoul National",
    imgSrc: "https://i.pravatar.cc/150?img=10"
  },
];

const TestimonialCard = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10"
          : "z-0 hover:border-[#ef4444]/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        background: isCenter ? '#ef4444' : '#FDFCF8',
        borderColor: isCenter ? '#ef4444' : '#1F2937',
        borderWidth: '2px',
        boxShadow: isCenter ? '0px 8px 0px 4px rgba(31,41,55,0.18)' : '0px 0px 0px 0px transparent',
        color: isCenter ? '#ffffff' : '#1F2937',
      }}
    >
      {/* Corner cut decoration */}
      <span
        className="absolute block origin-top-right rotate-45"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
          background: isCenter ? 'rgba(255,255,255,0.3)' : '#1F2937',
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={testimonial.by.split(',')[0]}
        className="mb-4 h-14 w-12 object-cover object-top"
        style={{
          boxShadow: isCenter ? '3px 3px 0px rgba(239,68,68,0.4)' : '3px 3px 0px #e5e7eb',
        }}
      />
      <h3
        className="text-base sm:text-lg font-medium leading-snug"
        style={{ color: isCenter ? '#ffffff' : '#1F2937' }}
      >
        "{testimonial.testimonial}"
      </h3>
      <p
        className="absolute bottom-8 left-8 right-8 mt-2 text-sm italic font-mono"
        style={{ color: isCenter ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.5)' }}
      >
        — {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)');
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 600, background: '#FDFCF8' }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position =
          testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}

      {/* Nav buttons */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className="flex h-14 w-14 items-center justify-center border-2 transition-all duration-200 hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] focus-visible:outline-none"
          style={{ background: '#FDFCF8', borderColor: '#1F2937', color: '#1F2937' }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="flex h-14 w-14 items-center justify-center border-2 transition-all duration-200 hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] focus-visible:outline-none"
          style={{ background: '#FDFCF8', borderColor: '#1F2937', color: '#1F2937' }}
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default StaggerTestimonials;
