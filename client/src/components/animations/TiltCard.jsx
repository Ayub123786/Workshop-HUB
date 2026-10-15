import { useRef, useState, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';
import { isReducedMotion } from '../../lib/motion';

/**
 * TiltCard - 3D card tilt with a soft gold glare following the cursor
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  cursorText,
  onClick,
  ...props
}) {
  const ref = useRef(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  // Spring physics for tilt angles
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });
  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = useCallback(
    (e) => {
      if (isReducedMotion() || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;

      // Calculate tilt from center (-1 to 1)
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      rotateX.set(-normY * maxTilt);
      rotateY.set(normX * maxTilt);
      scale.set(1.015);

      if (glare) {
        setGlarePos({ x: px, y: py, opacity: 0.15 });
      }
    },
    [maxTilt, glare, rotateX, rotateY, scale]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  }, [rotateX, rotateY, scale]);

  return (
    <div
      style={{ perspective: 1000 }}
      className={`relative ${className}`}
      onClick={onClick}
      data-cursor={cursorText}
    >
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full relative"
        {...props}
      >
        {children}

        {/* Soft cursor-following gold glare */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 ease-out z-20"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(201, 162, 77, 0.28), transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
