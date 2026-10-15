import { useState } from 'react';
import { isReducedMotion } from '../../lib/motion';

/**
 * Marquee - High-performance infinite dual-direction ticker with edge-fade masks and pause on hover
 */
export default function Marquee({
  children,
  direction = 'left',
  speed = 40, // seconds per full rotation
  pauseOnHover = true,
  className = '',
}) {
  const [isPaused, setIsPaused] = useState(false);
  const reduced = isReducedMotion();

  const animationDirection = direction === 'left' ? 'marquee-left' : 'marquee-right';

  return (
    <div
      className={`relative overflow-hidden w-full select-none ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Edge gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Marquee Content track */}
      <div
        className="flex gap-4 w-max"
        style={{
          animation: reduced ? 'none' : `${animationDirection} ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        <div className="flex items-center gap-4 shrink-0">{children}</div>
        <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
