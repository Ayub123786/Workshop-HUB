import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASINGS, DURATIONS } from '../../lib/motion';

/**
 * Reveal - Premium blur-to-sharp fade-up triggered at 20% viewport
 */
export default function Reveal({
  children,
  delay = 0,
  duration = DURATIONS.normal,
  yOffset = 24,
  blur = 6,
  className = '',
  as = 'div',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.2, // Trigger at 20% viewport visibility
  });

  const Component =
    typeof as === 'string'
      ? motion[as] || motion.div
      : motion.create
      ? motion.create(as)
      : motion(as);

  return (
    <Component
      ref={ref}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: `blur(${blur}px)`,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
            }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: EASINGS.luxury,
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
