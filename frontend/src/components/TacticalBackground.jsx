import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function TacticalBackground({ children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Smooth out mouse movement
  const springX = useSpring(0, { stiffness: 50, damping: 20 });
  const springY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
      springX.set(x * 15); // max 15px shift
      springY.set(y * 15);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-gray-200 overflow-hidden font-sans">
      
      {/* Dynamic Mesh Layer */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          x: springX,
          y: springY,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.15), rgba(0, 0, 0, 0) 60%), radial-gradient(circle at 80% 80%, rgba(255, 7, 58, 0.1), rgba(0, 0, 0, 0) 40%)',
          width: '110vw',
          height: '110vh',
          left: '-5vw',
          top: '-5vh'
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Global CRT Scanline */}
      <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden mix-blend-overlay opacity-10">
        <div className="w-full h-1 bg-white animate-scanline shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
      </div>

      {/* Application Content */}
      <div className="relative z-10 min-h-screen flex">
        {children}
      </div>

    </div>
  );
}
