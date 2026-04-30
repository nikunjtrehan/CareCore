import { useRef, useEffect } from 'react';
import { useMotionValueEvent } from 'framer-motion';

// Replaces the 150-frame PNG sequence with a procedural animated canvas.
// No binary assets needed — renders a medical ECG / topographic pulse that
// responds to scroll progress (0 → 1) just like the original sequence did.
export default function CanvasSequence({ smoothProgress }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef = useRef(null);

  // Keep a live ref so the draw loop can read it without re-subscribing
  useMotionValueEvent(smoothProgress, 'change', (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const draw = () => {
      const p = progressRef.current; // 0–1 scroll progress
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ── Background gradient (shifts from light cream → deep navy as you scroll)
      const bg = ctx.createLinearGradient(0, 0, w, h);
      const lightness = Math.round(96 - p * 60); // 96% → 36%
      bg.addColorStop(0, `hsl(40,20%,${lightness}%)`);
      bg.addColorStop(1, `hsl(220,30%,${Math.max(lightness - 18, 8)}%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── Topographic sine lines (same as TopoCanvas but more dramatic)
      const lineCount = 28;
      const alpha = 0.06 + p * 0.10;
      const amplitude = 60 + p * 120;

      for (let i = 1; i < lineCount; i++) {
        const hue = 200 + i * 4;
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue},60%,55%,${alpha})`;
        ctx.lineWidth = 1 + p * 0.8;

        let first = true;
        for (let x = 0; x <= w + 40; x += 12) {
          const phase = t + i * 0.45 + p * Math.PI * 2;
          const y =
            (i / lineCount) * h +
            Math.sin(x * 0.005 + phase) * amplitude +
            Math.sin(x * 0.012 - phase * 0.7) * (amplitude * 0.4);
          first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          first = false;
        }
        ctx.stroke();
      }

      // ── ECG pulse line (bright red, animates across the screen)
      const ecgY = h * 0.5;
      const pulseX = ((t * 180) % (w + 200)) - 100; // sweeps L→R
      ctx.save();
      ctx.strokeStyle = `rgba(239,68,68,${0.3 + p * 0.55})`;
      ctx.lineWidth = 2 + p * 1.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12 + p * 20;
      ctx.beginPath();

      for (let x = 0; x <= w; x += 2) {
        const rel = x - pulseX;
        let dy = 0;
        if (rel > -80 && rel < 80) {
          // QRS complex shape
          if (rel < -40) dy = rel * 0.3;
          else if (rel < -10) dy = (rel + 40) * -3.5;
          else if (rel < 0) dy = (rel + 10) * 18;
          else if (rel < 15) dy = rel * -14;
          else if (rel < 40) dy = (rel - 15) * 2.2;
          else dy = (rel - 40) * -0.4;
        }
        const y = ecgY + dy * (0.4 + p * 0.7);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ── Vignette (darkens edges, strengthens with scroll)
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(0,0,0,${p * 0.55})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      t += 0.012;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
