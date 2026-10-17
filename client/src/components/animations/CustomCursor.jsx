import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * CustomCursor - Desktop-only high-energy gold dot + trailing ring
 * Shows dynamic interactive labels ("VIEW", "PLAY", "DRAG", "FOCUS") on hover targets.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position springs for trailing ring
  const cursorX = useSpring(-100, { stiffness: 600, damping: 35 });
  const cursorY = useSpring(-100, { stiffness: 600, damping: 35 });

  // Direct fast springs for center dot
  const dotX = useSpring(-100, { stiffness: 1200, damping: 45 });
  const dotY = useSpring(-100, { stiffness: 1200, damping: 45 });

  useEffect(() => {
    // Check if device supports fine pointer / mouse (desktop only)
    const isTouchDevice =
      !window.matchMedia('(pointer: fine)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    if (isTouchDevice) return;
    setEnabled(true);

    const onMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Inspect hover target
      const target = e.target;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]');
      const clickableTarget = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');

      if (cursorTarget) {
        const text = cursorTarget.getAttribute('data-cursor');
        setCursorText(text || '');
        setIsHovered(true);
      } else if (clickableTarget) {
        setCursorText('');
        setIsHovered(true);
      } else {
        setCursorText('');
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [cursorX, cursorY, dotX, dotY, isVisible]);

  if (!enabled || !isVisible) return null;

  const hasText = Boolean(cursorText);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Center Gold Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className={`fixed w-2 h-2 rounded-full bg-gold transition-opacity duration-200 shadow-[0_0_10px_rgba(201,162,77,0.8)] ${
          hasText ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Trailing Spring Ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hasText ? 68 : isHovered ? 48 : 28,
          height: hasText ? 68 : isHovered ? 48 : 28,
          backgroundColor: hasText
            ? '#C9A24D'
            : isHovered
            ? 'rgba(201, 162, 77, 0.18)'
            : 'rgba(255, 255, 255, 0.04)',
          borderColor: hasText
            ? '#DFBE74'
            : isHovered
            ? 'rgba(201, 162, 77, 0.9)'
            : 'rgba(255, 255, 255, 0.25)',
          boxShadow: hasText
            ? '0 0 25px rgba(201, 162, 77, 0.6)'
            : isHovered
            ? '0 0 16px rgba(201, 162, 77, 0.35)'
            : 'none',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="fixed rounded-full border flex items-center justify-center backdrop-blur-[2px] pointer-events-none"
      >
        {hasText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-[10px] font-mono font-extrabold tracking-widest text-[#0a0a0a] uppercase text-center leading-none"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
