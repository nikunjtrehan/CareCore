import { useEffect, useRef } from 'react';

export default function TopographyBackground({ children }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Pseudo-noise simulation for topographical contour lines
    let time = 0;
    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);
      
      // Charcoal color (#1F2937) at 10% opacity
      ctx.strokeStyle = 'rgba(31, 41, 55, 0.1)'; 
      ctx.lineWidth = 1;

      // Draw horizontal contour strata
      const steps = 40;
      for (let i = 1; i < steps; i++) {
        ctx.beginPath();
        for (let x = 0; x < width + 50; x += 30) {
          // Base sinusoidal flow
          let y = (i * (height / steps)) + Math.sin(x * 0.005 + time) * 60;
          
          // Mouse interaction (warp influence radius)
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 250) {
            const influence = (250 - distance) / 250;
            y += Math.sin(time * 3 + x * 0.01) * 30 * influence;
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            // Bezier curve smoothing approximation
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Canvas: fixed, full-screen, behind everything — z:-1 so mix-blend-multiply on video composites against body #FDFCF8 */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      />
      {/* Children rendered above the canvas */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}
