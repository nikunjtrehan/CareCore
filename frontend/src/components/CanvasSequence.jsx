import { useState, useEffect, useRef } from 'react';
import { useTransform, useMotionValueEvent } from 'framer-motion';

export default function CanvasSequence({ smoothProgress }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const frameCount = 150; // Matched EXACT total of extracted frames

  useEffect(() => {
    let loadedCount = 0;
    const loadedImagesArray = [];

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Adapted to match actual physical files in public/frames
        img.src = `/frames/ezgif-frame-${String(i).padStart(3, '0')}.png`;
        
        img.onload = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
                setImages(loadedImagesArray);
                console.log(`[CareCore] ✅ Successfully loaded all ${frameCount} frames into memory.`);
                
                // Paint frame 0 immediately upon load to prevent black flash
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  ctx.drawImage(loadedImagesArray[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
        };
        
        loadedImagesArray.push(img);
    }
  }, []);
  // Map the scroll to the frame index
  const frameIndex = useTransform(smoothProgress, [0, 0.5], [0, frameCount - 1]);


  useEffect(() => {
    // High-DPI canvas internal pixel sizing
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;

        // Force a repaint so canvas doesn't clear on resize
        if (images.length === frameCount) {
           const ctx = canvasRef.current.getContext('2d');
           const img = images[Math.round(frameIndex.get())] || images[0];
           if (img) {
               ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
               ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
           }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameCount, frameIndex]);


  // Framer Motion Paint Loop
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    if (images.length === frameCount && canvasRef.current) {
      window.requestAnimationFrame(() => {
        const ctx = canvasRef.current.getContext('2d');
        const img = images[Math.round(latest)];
        if (img) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      });
    }
  });

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full object-cover mix-blend-darken" 
    />
  );
}
