import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const speedMap = { slow: 0.8, normal: 0.5, fast: 0.3 };

/**
 * FadeUp - fade in from bottom when entering viewport
 */
export function FadeUp({ children, delay = 0, speed = 'normal', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: speedMap[speed], delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - simple opacity entrance
 */
export function FadeIn({ children, delay = 0, speed = 'normal', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: speedMap[speed], delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideLeft - slide in from right
 */
export function SlideLeft({ children, delay = 0, speed = 'normal', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: speedMap[speed], delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideRight - slide in from left
 */
export function SlideRight({ children, delay = 0, speed = 'normal', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: speedMap[speed], delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ZoomIn - scale entrance
 */
export function ZoomIn({ children, delay = 0, speed = 'normal', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: speedMap[speed], delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - staggered children entrance
 */
export function StaggerContainer({ children, stagger = 0.1, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - individual item within StaggerContainer
 */
export function StaggerItem({ children, className = '', hover = 'none' }) {
  const hoverProps = {
    lift: { whileHover: { y: -4, transition: { duration: 0.2 } } },
    tilt: { whileHover: { rotateX: 3, rotateY: -3, scale: 1.02 } },
    glow: { whileHover: { boxShadow: '0 0 20px rgba(200, 162, 79, 0.3)' } },
    none: {},
  }[hover] || {};

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
      }}
      className={className}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}

/**
 * TextReveal - word-by-word text reveal
 */
export function TextReveal({ text, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: delay + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Floating - gentle up-down loop (for date cards, CTAs)
 */
export function Floating({ children, className = '' }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Magnetic - follows cursor within bounds (for CTAs)
 */
export function Magnetic({ children, className = '', strength = 0.3 }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * MaskReveal - content revealed with a sliding mask
 */
export function MaskReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%' }}
        animate={inView ? { y: 0 } : {}}
        transition={{ duration: 0.6, delay, ease: [0.76, 0, 0.24, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * MotionWrapper - generic entrance by animation type
 */
export function MotionWrapper({ children, animation, delay = 0, speed = 'normal', className = '' }) {
  switch (animation) {
    case 'fade-up': return <FadeUp delay={delay} speed={speed} className={className}>{children}</FadeUp>;
    case 'fade-in': return <FadeIn delay={delay} speed={speed} className={className}>{children}</FadeIn>;
    case 'slide-left': return <SlideLeft delay={delay} speed={speed} className={className}>{children}</SlideLeft>;
    case 'slide-right': return <SlideRight delay={delay} speed={speed} className={className}>{children}</SlideRight>;
    case 'zoom-in': return <ZoomIn delay={delay} speed={speed} className={className}>{children}</ZoomIn>;
    default: return <div className={className}>{children}</div>;
  }
}
