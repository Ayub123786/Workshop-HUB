/**
 * Workshop Hub - Global Motion Design Configuration
 * Shared easings, durations, transitions, and variants for Framer Motion & GSAP
 */

// ─── EASINGS ───
// Premium luxury cubic-bezier easing curve
export const EASINGS = {
  luxury: [0.22, 1, 0.36, 1], // Default ease across the platform
  smoothOut: [0.16, 1, 0.3, 1],
  smoothIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.65, 0, 0.35, 1],
  springSoft: { type: 'spring', stiffness: 260, damping: 24 },
  springSnappy: { type: 'spring', stiffness: 420, damping: 28 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 18 },
};

// ─── DURATIONS ───
export const DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.85,
  hero: 1.1,
};

// Helper: Check if client prefers reduced motion
export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ─── SHARED VARIANTS ───

// Blur-to-sharp staggered reveal (used for section headers and cards)
export const revealVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(8px)',
  },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: custom.duration || DURATIONS.normal,
      delay: custom.delay || 0,
      ease: EASINGS.luxury,
    },
  }),
};

// Word-by-word masked reveal
export const wordRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
};

export const wordRevealItem = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: EASINGS.luxury,
    },
  },
};

// Card staggered grid container
export const cardGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Individual card item reveal
export const cardItemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.luxury,
    },
  },
};

// Subtle page transition (fade + light slide)
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASINGS.luxury,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};
