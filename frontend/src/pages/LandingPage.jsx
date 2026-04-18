import { useRef, useState, useEffect } from 'react';
import { useScroll, useSpring, useMotionValueEvent, useTransform, motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import CanvasSequence from '../components/CanvasSequence';

// ─── Custom Cursor ──────────────────────────────────────────────────────────
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999]"
      style={{
        backgroundColor: '#ef4444',
        boxShadow: '0 0 18px 4px rgba(239,68,68,0.45)',
      }}
      animate={{ x: pos.x - 8, y: pos.y - 8 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 0.4 }}
    />
  );
}

// ─── Interactive Topography Canvas ──────────────────────────────────────────
function TopoCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(31, 41, 55, 0.08)';
      ctx.lineWidth = 1;

      const LINES = 36;
      for (let i = 1; i < LINES; i++) {
        ctx.beginPath();
        let first = true;
        for (let x = 0; x <= canvas.width + 40; x += 24) {
          let y = (i / LINES) * canvas.height + Math.sin(x * 0.006 + t + i * 0.4) * 55;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const pull = ((220 - dist) / 220) * 28;
            y += Math.sin(t * 2.5 + x * 0.015) * pull;
          }
          first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          first = false;
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ zIndex: -10 }}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const trackRef = useRef(null);

  // Raw scroll progress — untouched, exactly as specified
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Stage 2: Physics spring — intercepts raw scroll, outputs lag-free smoothed value
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Stage 6: All card timelines driven by smoothProgress
  const t1 = {
    opacity: useTransform(smoothProgress, [0.55, 0.6, 0.65, 0.7], [0, 1, 1, 0]),
    y:       useTransform(smoothProgress, [0.55, 0.6, 0.65, 0.7], [28, 0, 0, -28]),
  };
  const t2 = {
    opacity: useTransform(smoothProgress, [0.65, 0.7, 0.75, 0.8], [0, 1, 1, 0]),
    y:       useTransform(smoothProgress, [0.65, 0.7, 0.75, 0.8], [28, 0, 0, -28]),
  };
  const t3 = {
    opacity: useTransform(smoothProgress, [0.75, 0.8, 0.88, 0.94], [0, 1, 1, 0]),
    y:       useTransform(smoothProgress, [0.75, 0.8, 0.88, 0.94], [28, 0, 0, -28]),
  };
  const t4 = {
    opacity: useTransform(smoothProgress, [0.85, 0.9, 0.94, 0.97], [0, 1, 1, 0]),
    y:       useTransform(smoothProgress, [0.85, 0.9, 0.94, 0.97], [28, 0, 0, -28]),
  };
  const t5 = {
    opacity: useTransform(smoothProgress, [0.9, 0.95, 1, 1], [0, 1, 1, 1]),
    y:       useTransform(smoothProgress, [0.9, 0.95, 1, 1], [28, 0, 0, 0]),
  };

  const [isCommandActive, setIsCommandActive]  = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const [sqlQuery, setSqlQuery] = useState(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault(); // CRITICAL: Stop browser refresh
    
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue })
      });
      
      const result = await response.json();
      console.log("Database Response:", result);
      
      setQueryResults(result.data); 
      setSqlQuery(result.query);
      
      // DO NOT set isCommandActive(false) here. 
      // The UI must stay open to display the upcoming data table.
      
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setIsLoading(false); // Only turn off the spinner
    }
  };

  const handleClose = () => {
    setQueryResults(null);
    setSqlQuery(null);
    setIsCommandActive(false);
    setInputValue('');
  };

  return (
    <>
      {/* ── Layer -10: Topography canvas ── */}
      <TopoCanvas />

      {/* ── Layer 9999: Custom cursor ── */}
      <CustomCursor />

      {/* ── Layer 50: Logo — fixed top-left ── */}
      <div className="fixed top-6 left-6 z-50 pointer-events-auto">
        <img
          src="/carecore-logo.png"
          alt="CareCore"
          className="h-12 w-auto object-contain drop-shadow-md"
          onError={(e) => {
            e.target.replaceWith(Object.assign(document.createElement('span'), {
              className: 'font-mono text-2xl font-bold text-[#1F2937]',
              innerHTML: 'Care<span style="color:#ef4444">Core</span>',
            }));
          }}
        />
      </div>

      {/*
        ─────────────────────────────────────────────────────────────────
        CRITICAL: <main> has NO background-color.
        The body (#FDFCF8) IS the compositing surface for mix-blend-multiply.
        Adding any bg here would break the blend.
        ─────────────────────────────────────────────────────────────────
      */}
      <main className="relative w-full">
        {/* 1000vh Scroll Track — position:relative required for useScroll target */}
        <div ref={trackRef} className="h-[1000vh] w-full relative">

          {/* Sticky Viewport: w-full h-screen overflow-hidden relative — z-0 so blend composites against body */}
          <div className="sticky top-0 w-full h-screen overflow-hidden relative" style={{ zIndex: 0 }}>

            {/*
              Video — absolute inset-0, full-bleed.
              scale-105 prevents edge-bleed on scroll on some monitors.
              mix-blend-darken composites against body #FDFCF8 — no box visible.
            */}
            <CanvasSequence smoothProgress={smoothProgress} />
            {/* Content overlay — z-index: 10 */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-center" style={{ zIndex: 10 }}>
              <div className="w-full max-w-7xl mx-auto relative h-[70vh]">

                {/* Block 1 — Card 1 fades in at 0.45, out at 0.6, positioned LEFT */}
                <GlassCard opacity={t1.opacity} y={t1.y} className="left-12 top-1/3">
                  <GlassCard.Header>Clinical intelligence at the speed of thought.</GlassCard.Header>
                  <GlassCard.Body>Ask what you need. Watch data become clarity. CareCore transforms natural language into precision medicine.</GlassCard.Body>
                </GlassCard>

                {/* Block 2 — Card 2 fades in at 0.6, out at 0.75, positioned RIGHT */}
                <GlassCard opacity={t2.opacity} y={t2.y} className="right-12 top-1/3">
                  <GlassCard.Header align="right">Natural language meets clinical data.</GlassCard.Header>
                  <GlassCard.Body align="right">Type what you need. The system listens, translates your words into SQL, and returns exactly what matters.</GlassCard.Body>
                </GlassCard>

                {/* Block 3 — Stage 7: Three Pillars wide card, fades in at 0.75, stays visible to end */}
                <GlassCard
                  opacity={t3.opacity}
                  y={t3.y}
                  x="-50%"
                  wide={true}
                  className="left-1/2 bottom-24"
                >
                  {/* Header */}
                  <div className="text-center mb-7">
                    <h2 className="font-mono text-2xl font-bold text-[#1F2937] mb-2">
                      Three pillars of clinical excellence.
                    </h2>
                  </div>

                  {/* 3-Column CSS Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <GlassCard.Column title="Premium operations:">
                      Workflows built for realities of modern medicine.
                    </GlassCard.Column>
                    <GlassCard.Column title="Advanced AI systems:">
                      Machine learning that understands medical language.
                    </GlassCard.Column>
                    <GlassCard.Column title="Seamless interaction:">
                      The interface disappears. What remains is clarity.
                    </GlassCard.Column>
                  </div>

                  {/* Architect Tag — bottom-left of this wide card */}
                  <div className="flex items-center justify-between">
                    <GlassCard.Pill>Engineered by Nikunj Trehan, CSBS @ TIET.</GlassCard.Pill>
                  </div>
                </GlassCard>

                {/* Block 4 — Quote card, fades in at 0.87, stays to end */}
                <GlassCard opacity={t4.opacity} y={t4.y} className="left-8 top-[38%]">
                  <p className="font-sans text-xl font-semibold italic mb-4 text-[#1F2937]">
                    "CareCore doesn't just organize data, it thinks like a clinician."
                  </p>
                  <span className="font-mono font-bold text-lg block mb-3 text-[#1F2937]">— Dr. Sarah Chen</span>
                  <GlassCard.Pill>Engineered by Nikunj Trehan, CSBS @ TIET.</GlassCard.Pill>
                </GlassCard>

              </div>
            </div>

          </div>{/* /sticky */}

          {/*
            ─────────────────────────────────────────────────────────────────
            Stage 8: CTA SECTION
            Lives at the absolute bottom of the 800vh track (outside sticky).
            The sticky viewport covers 100vh; this section fills the final
            viewport of the remaining track space.
            ─────────────────────────────────────────────────────────────────
          */}
          <div
            className="absolute bottom-0 left-0 right-0 h-screen flex flex-col items-center justify-center gap-8 px-6 backdrop-blur-md bg-[#FDFCF8]/90"
            style={{ zIndex: 20 }}
          >
            {/* Heading */}
            <h2 className="font-mono text-4xl md:text-5xl font-bold text-[#1F2937] text-center max-w-2xl leading-tight">
              Ready to see it work.
            </h2>
            <p className="font-sans text-lg text-[#1F2937]/70 text-center max-w-lg">
              Request a demo and watch clinical intelligence become real in your hands.
            </p>

            {/* The Morph Engine */}
            <AnimatePresence mode="wait">
              {!isCommandActive ? (
                /* ── Resting State: Red pill button ── */
                <motion.button
                  key="cmd-btn"
                  layoutId="cmd"
                  onClick={() => setIsCommandActive(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="px-10 py-5 rounded-full bg-[#ef4444] text-white font-mono font-bold tracking-widest uppercase"
                  style={{ boxShadow: '0 0 36px rgba(239,68,68,0.5)' }}
                >
                  Initialize Command Center
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

        </div>{/* /track */}
      </main>

      {/*
        ─────────────────────────────────────────────────────────────────
        Stage 8: The Morph — button physically transforms into the form.
        Fixed overlay so it floats above everything when isCommandActive.
        The layoutId="cmd" bridges the button ↔ form across DOM layers.
        ─────────────────────────────────────────────────────────────────
      */}
      <AnimatePresence>
        {isCommandActive && (
          <>
            {/* Dark scrim — click to dismiss */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.88 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black pointer-events-auto"
              style={{ zIndex: 100 }}
              onClick={() => setIsCommandActive(false)}
            />

            {/* Morphing form — shares layoutId="cmd" with the button */}
            <div
              className="fixed inset-0 flex items-center justify-center pointer-events-none px-6"
              style={{ zIndex: 110 }}
            >
              <motion.form
                key="cmd-form"
                layoutId="cmd"
                layout
                onSubmit={handleQuerySubmit}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                className="w-full max-w-4xl flex flex-col pointer-events-auto rounded-3xl p-5 border border-white/25 overflow-hidden"
                style={{
                  background: 'rgba(253, 252, 248, 0.08)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.85)',
                }}
              >
                {/* ─── Input Row ─── */}
                <div className="flex items-center gap-4 w-full">
                  {/* Red accent dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                    style={{ background: '#ef4444', boxShadow: '0 0 12px rgba(239,68,68,0.7)' }}
                  />

                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  placeholder={isLoading ? "Analyzing clinical parameters..." : "Ask the database… e.g. Which patients missed medicine?"}
                  className={`flex-1 bg-transparent border-none outline-none font-sans text-xl md:text-2xl text-white placeholder-white/35 px-2 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && !isLoading) handleClose();
                  }}
                />

                {isLoading ? (
                  <div className="flex-shrink-0 px-4 py-2 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-[#00f3ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-shrink-0 bg-white/15 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Esc
                  </button>
                )}
                </div>

                {/* ─── Stage 6.2: SQL Readout ─── */}
                {sqlQuery && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-green-400 overflow-x-auto w-full"
                  >
                    {sqlQuery}
                  </motion.div>
                )}

                {/* ─── Stage 6.2: Data Render Table ─── */}
                {queryResults && queryResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full overflow-x-auto mt-4"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          {Object.keys(queryResults[0]).map((key, i) => (
                            <th key={i} className="text-white/50 text-sm uppercase tracking-wider pb-2 border-b border-white/10 px-3 whitespace-nowrap">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {queryResults.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                            {Object.entries(row).map(([k, v], colIndex) => (
                              <td 
                                key={colIndex} 
                                className={`py-4 px-3 text-gray-300 ${k.toLowerCase().includes('id') ? 'font-mono text-blue-300/80 text-xs' : 'font-sans text-sm'}`}
                              >
                                {v === null || v === undefined ? '-' : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* ─── Stage 6.3: Empty State ─── */}
                {queryResults && queryResults.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-6 py-6 border-t border-white/5 flex items-center justify-center"
                  >
                    <span className="font-mono text-gray-500 uppercase tracking-widest text-sm">No patient records found.</span>
                  </motion.div>
                )}

              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
