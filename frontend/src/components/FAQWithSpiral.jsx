// src/components/FAQWithSpiral.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'What is CareCore?',
    a: 'CareCore is a next-generation clinical intelligence platform that lets healthcare professionals query patient data using natural language. Ask in plain English — CareCore translates it into SQL and returns live results from your hospital database.',
  },
  {
    q: 'Who can use CareCore?',
    a: 'CareCore is built for three roles: Patients (health monitoring & appointments), Doctors (AI-assisted patient queues, prescriptions), and Nurses (shift tasks, handoff notes, ward status). Each role gets a dedicated, permission-scoped portal.',
  },
  {
    q: 'Is my medical data secure?',
    a: 'Yes. CareCore uses Firebase Authentication with role-based Firestore security rules. Data is encrypted in transit and at rest. No patient data is ever stored in AI training pipelines.',
  },
  {
    q: 'How does the AI Query Engine work?',
    a: 'You type a natural-language question (e.g. "Which patients missed their medication this week?"). CareCore sends it to the Gemini API which generates a safe, read-only SQL query. The query runs against your hospital DB and results appear instantly in an interactive table.',
  },
  {
    q: 'Can I book appointments through CareCore?',
    a: 'Yes. Patients can view upcoming appointments, reschedule, and receive real-time reminders — all from the Patient Portal. Doctors see the full queue with AI pre-visit summaries.',
  },
  {
    q: 'What is the Timeline view?',
    a: 'The Timeline is a medical history visualiser available in the Patient Portal. It displays key health milestones — diagnoses, surgeries, medications — on a scrollable chronological axis with colour-coded event types.',
  },
];

// Animated spiral drawn on canvas
function SpiralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const turns = 5;
      const maxR = Math.min(cx, cy) * 0.88;
      const steps = 500;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const pct = i / steps;
        const angle = pct * turns * Math.PI * 2 + t;
        const r = pct * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(cx - maxR, cy, cx + maxR, cy);
      grad.addColorStop(0, 'rgba(239,68,68,0.0)');
      grad.addColorStop(0.4, 'rgba(239,68,68,0.3)');
      grad.addColorStop(1, 'rgba(239,68,68,0.7)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pulsing dots at arm tips
      for (let arm = 0; arm < 3; arm++) {
        const pct = ((t * 0.12 + arm / 3) % 1);
        const angle = pct * turns * Math.PI * 2 + t;
        const r = pct * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,68,68,${0.5 + 0.5 * Math.sin(t * 3 + arm)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function FAQWithSpiral() {
  const [open, setOpen] = useState(null);

  return (
    <section className="w-full py-24 px-6 bg-[#FDFCF8]">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#1F2937]/40 mb-3 text-center">
          Everything you need to know
        </p>
        <h2 className="font-mono text-4xl md:text-5xl font-bold text-[#1F2937] text-center mb-16 leading-tight">
          Frequently asked<br />
          <span className="text-[#ef4444]">questions.</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — spiral visual */}
          <div className="relative h-[400px] lg:h-[520px] rounded-3xl overflow-hidden bg-[#faf9f5] border border-[#1F2937]/8 flex items-center justify-center">
            <SpiralCanvas />
            {/* Center badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-mono text-5xl font-black text-[#ef4444] opacity-90">
                  {faqs.length}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-[#1F2937]/50 mt-1">
                  Answers
                </p>
              </div>
            </div>
          </div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-2xl border border-[#1F2937]/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1F2937]/[0.03] transition-colors"
                >
                  <span className="font-sans font-semibold text-sm text-[#1F2937] pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-5 h-5 rounded-full border border-[#1F2937]/20 flex items-center justify-center text-[#1F2937]/60 text-sm"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-[#1F2937]/60 leading-relaxed font-sans border-t border-[#1F2937]/8 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
