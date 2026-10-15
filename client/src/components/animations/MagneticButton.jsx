import { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { isReducedMotion } from '../../lib/motion';

/**
 * MagneticButton - Pulls toward the cursor on hover with gold shine sweep
 */
export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.28,
  shine = true,
  as = 'button',
  ...props
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring physics for magnetic pull
  const x = useSpring(0, { stiffness: 350, damping: 20 });
  const y = useSpring(0, { stiffness: 350, damping: 20 });

  const handleMouseMove = (e) => {
    if (isReducedMotion() || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const Component =
    typeof as === 'string'
      ? motion[as] || motion.button
      : motion.create
      ? motion.create(as)
      : motion(as);

  return (
    <Component
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden group select-none ${className}`}
      {...props}
    >
      {children}

      {/* Gold shine sweep on hover */}
      {shine && (
        <span
          className={`absolute inset-0 pointer-events-none transition-transform duration-700 ease-out -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12`}
        />
      )}
    </Component>
  );
}
