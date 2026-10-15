import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * CustomCursor - Desktop-only luxury cursor with trailing spring ring and media labels
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position springs for trailing ring
  const cursorX = useSpring(-100, { stiffness: 600, damping: 35 });
  const cursorY = useSpring(-100, { stiffness: 600, damping: 35 });

  // Fast direct springs for center dot
  const dotX = useSpring(-100, { stiffness: 1200, damping: 45 });
  const dotY = useSpring(-100, { stiffness: 1200, damping: 45 });

  useEffect(() => {
    // Check if device supports hover/fine pointer (desktop only)
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
      const clickableTarget = target.closest('button, a, input, select, textarea, [role="button"]');

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
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Center Gold Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className={`fixed w-2 h-2 rounded-full bg-gold transition-opacity duration-200 ${
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
          width: hasText ? 64 : isHovered ? 44 : 26,
          height: hasText ? 64 : isHovered ? 44 : 26,
          backgroundColor: hasText
            ? 'rgba(201, 162, 77, 0.92)'
            : isHovered
            ? 'rgba(201, 162, 77, 0.18)'
            : 'rgba(201, 162, 77, 0.08)',
          borderColor: hasText
            ? 'rgba(201, 162, 77, 1)'
            : isHovered
            ? 'rgba(201, 162, 77, 0.85)'
            : 'rgba(201, 162, 77, 0.45)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed rounded-full border border-gold flex items-center justify-center backdrop-blur-[1px] pointer-events-none"
      >
        {hasText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-[10px] font-mono font-bold tracking-widest text-white uppercase text-center leading-none"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
