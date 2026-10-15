import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Building2, Quote } from 'lucide-react';
import { isReducedMotion } from '../../lib/motion';

// High-fidelity executive portraits for testimonials
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
];

/**
 * Carousel3D - Luxury 3D rotating cylindrical card ring
 * Features: 3.5s auto-rotation, hover-pause, drag/swipe, progress dots, mobile stacked deck
 */
export default function Carousel3D({ testimonials = [], autoRotateInterval = 3500 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
    setProgress(0);
  }, [total]);

  // Auto-rotate timer with visual progress fill
  useEffect(() => {
    if (total <= 1 || isPaused || isReducedMotion()) return;

    const stepMs = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (stepMs / autoRotateInterval) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [total, isPaused, autoRotateInterval, nextSlide]);

  // Keyboard navigation when hovered
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPaused) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, nextSlide, prevSlide]);

  // Calculate circular relative offset (-2, -1, 0, 1, 2)
  const getOffset = (index) => {
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  // Drag handler for desktop and touch
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold || velocity.x < -400) {
      nextSlide();
    } else if (offset.x > swipeThreshold || velocity.x > 400) {
      prevSlide();
    }
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full py-10 select-none overflow-hidden"
    >
      {/* ─── Ambient Shifting Gold Radial Glow Behind Active Card ─── */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(201, 162, 77, 0.16) 0%, rgba(201, 162, 77, 0.03) 60%, transparent 100%)',
        }}
      />

      {/* ─── DESKTOP 3D CYLINDRICAL CAROUSEL (hidden on small mobile) ─── */}
      <div
        className="hidden md:flex relative h-[380px] items-center justify-center"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      >
        {testimonials.map((item, idx) => {
          const offset = getOffset(idx);
          const isCenter = offset === 0;

          // Render only cards within 2 steps from center for 60fps performance
          if (Math.abs(offset) > 2) return null;

          // Cylindrical 3D transforms
          let translateX = offset * 320;
          let translateZ = -Math.abs(offset) * 140;
          let rotateY = -offset * 25;
          let scale = 1 - Math.abs(offset) * 0.14;
          let opacity = 1 - Math.abs(offset) * 0.38;
          let blur = Math.abs(offset) * 2;
          let zIndex = 30 - Math.abs(offset) * 10;

          const avatarUrl = item.avatar || AVATARS[idx % AVATARS.length];

          return (
            <motion.div
              key={item.id || idx}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY: rotateY,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                duration: 0.68,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'absolute',
                zIndex: zIndex,
                transformStyle: 'preserve-3d',
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!isCenter) setActiveIndex(idx);
              }}
              className={`w-[360px] cursor-grab active:cursor-grabbing rounded-2xl p-6.5 bg-white border transition-shadow duration-300 ${
                isCenter
                  ? 'border-gold shadow-[0_16px_40px_rgba(201,162,77,0.18)]'
                  : 'border-[#E8E8E8] shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
              }`}
            >
              {/* Card Header: Avatar + Executive Info + Verified Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={item.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-gold/40 shadow-xs"
                    />
                    {/* Animated Pulsing Verified Badge */}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                      <CheckCircle2 size={11} className="stroke-[2.5]" />
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-navy text-sm tracking-tight">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-muted truncate max-w-[170px]">
                        {item.role || 'Executive Participant'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Firm chip badge */}
                {item.company && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] text-[10px] font-mono font-bold text-navy shrink-0 shadow-2xs">
                    <Building2 size={10} className="text-gold" />
                    {item.company}
                  </span>
                )}
              </div>

              {/* 5-Star Rating Row */}
              <div className="flex items-center gap-1 mb-3.5">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="fill-gold text-gold transition-transform hover:scale-110"
                  />
                ))}
                <span className="text-[11px] font-mono font-bold text-gold ml-1">5.0</span>
              </div>

              {/* Graphic One-Line Punchy Quote (Max ~15 words) */}
              <p className="text-sm font-medium text-navy leading-relaxed line-clamp-3 relative">
                <Quote size={16} className="inline text-gold/40 mr-1.5 -mt-1" />
                "{item.quote}"
              </p>

              {/* Bottom Cohort Pill */}
              <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-muted">
                <span className="font-mono text-[10px] text-muted/80">
                  {item.cohort || 'Executive Deal Lab'}
                </span>
                <span className="font-semibold text-gold text-[11px]">
                  Verified Dealmaker
                </span>
              </div>

              {/* Soft card reflection underneath */}
              <div
                className="absolute -bottom-8 left-4 right-4 h-6 rounded-full blur-md opacity-25 pointer-events-none"
                style={{
                  background: isCenter
                    ? 'radial-gradient(ellipse at center, rgba(201,162,77,0.6), transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(0,0,0,0.2), transparent 70%)',
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ─── MOBILE STACKED SWIPE DECK (<768px) ─── */}
      <div className="md:hidden relative h-[330px] px-4 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {testimonials.map((item, idx) => {
            if (idx !== activeIndex) return null;
            const avatarUrl = item.avatar || AVATARS[idx % AVATARS.length];

            return (
              <motion.div
                key={item.id || idx}
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, x: -180, rotate: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="w-full max-w-sm rounded-2xl p-5 bg-white border border-gold shadow-[0_12px_32px_rgba(201,162,77,0.16)]"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={avatarUrl}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-gold/40"
                    />
                    <div>
                      <h4 className="font-bold text-navy text-xs sm:text-sm">{item.name}</h4>
                      <p className="text-[10px] text-muted truncate max-w-[150px]">
                        {item.role || 'Participant'}
                      </p>
                    </div>
                  </div>

                  {item.company && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] text-[9px] font-mono font-bold text-navy">
                      {item.company}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-gold text-gold" />
                  ))}
                  <span className="text-[10px] font-mono font-bold text-gold ml-1">5.0</span>
                </div>

                <p className="text-xs text-navy leading-relaxed mb-3">"{item.quote}"</p>

                <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[10px] text-muted">
                  <span className="font-mono">{item.cohort || 'Fall Cohort'}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ─── CONTROLS: Arrow Buttons & Progress Indicators ─── */}
      <div className="flex items-center justify-center gap-4 mt-8 relative z-20">
        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-navy hover:border-gold hover:text-gold transition-colors shadow-2xs"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dynamic Progress Dots */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i);
                  setProgress(0);
                }}
                className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
                style={{
                  width: isActive ? 28 : 8,
                  backgroundColor: isActive ? '#FAF9F6' : '#E8E8E8',
                  border: isActive ? '1px solid #C9A24D' : 'none',
                }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gold origin-left"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-navy hover:border-gold hover:text-gold transition-colors shadow-2xs"
          aria-label="Next testimonial"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
