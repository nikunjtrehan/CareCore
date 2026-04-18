import { motion } from 'framer-motion';

/**
 * GlassCard — Reusable scroll-driven glassmorphic card component.
 *
 * Props:
 *   opacity       {MotionValue<number>}  Framer Motion opacity value (from useTransform)
 *   y             {MotionValue<number>}  Framer Motion y-translation value (from useTransform)
 *   className     {string}              Extra positioning classes (e.g. "left-[10%] top-1/4")
 *   children      {ReactNode}           Card content
 *   wide          {boolean}             If true, expands to max-w-5xl for full-width panels
 */
export default function GlassCard({ opacity, y, x, className = '', wide = false, children }) {
  return (
    <motion.div
      style={{ opacity, y, ...(x !== undefined ? { x } : {}) }}
      className={[
        // ── Position ──────────────────────────────────────────────
        'absolute pointer-events-auto',

        // ── Glass surface ─────────────────────────────────────────
        'bg-white/40 backdrop-blur-2xl',
        'border border-white/20',
        'shadow-2xl',
        'rounded-3xl',
        'p-8',

        // ── Width ─────────────────────────────────────────────────
        wide ? 'max-w-5xl w-[92%]' : 'max-w-lg w-full',

        // ── Caller-supplied positioning ───────────────────────────
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlassCard.Header
 * Enforces JetBrains Mono for all heading text.
 */
GlassCard.Header = function Header({ children, align = 'left' }) {
  return (
    <h2
      className={[
        'font-mono font-bold text-xl leading-snug mb-3 text-[#1F2937]',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </h2>
  );
};

/**
 * GlassCard.Body
 * Enforces Inter for all body-copy text.
 */
GlassCard.Body = function Body({ children, align = 'left' }) {
  return (
    <p
      className={[
        'font-sans text-base leading-relaxed text-[#1F2937]/80',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </p>
  );
};

/**
 * GlassCard.Pill
 * Small inline badge (e.g. architect tag, label).
 */
GlassCard.Pill = function Pill({ children }) {
  return (
    <span className="font-sans text-xs font-medium text-[#1F2937] bg-white/60 border border-white/30 px-4 py-1.5 rounded-full inline-block mt-2">
      {children}
    </span>
  );
};

/**
 * GlassCard.Rule
 * Thin divider line between sections inside a card.
 */
GlassCard.Rule = function Rule() {
  return <hr className="border-white/30 my-5" />;
};

/**
 * GlassCard.Column
 * A single cell for use inside a 3-column wide panel.
 */
GlassCard.Column = function Column({ title, children }) {
  return (
    <div className="bg-white/30 rounded-2xl p-5 border border-white/40 flex flex-col gap-2">
      <h3 className="font-mono font-bold text-base text-[#1F2937]">{title}</h3>
      <p className="font-sans text-sm text-[#1F2937]/80 leading-relaxed">{children}</p>
    </div>
  );
};
