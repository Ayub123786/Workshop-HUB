import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Building2, Quote } from 'lucide-react';
import { isReducedMotion } from '../../lib/motion';

// High-fidelity executive portraits for testimonials matching executive profiles
const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', // Mauricio (analyst/associate)
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', // Lucia (investor)
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', // Geoff (family office partner)
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', // Saloni (director)
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', // Executive lead
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', // Partner
];

/**
 * Carousel3D - Luxury 3D rotating cylindrical card ring
 * Features: 3.5s auto-rotation, hover-pause, drag/swipe, progress dots, mobile stacked deck
 */
export default function Carousel3D({ testimonials = [], autoRotateInterval = 3500 }) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  const total = testimonials.length;
  const activeIndex = ((step % total) + total) % total;

  const nextSlide = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  // Auto-rotate timer - moves strictly in one direction (forward) without CPU-heavy interval ticks
  useEffect(() => {
    if (total <= 1 || isPaused || isReducedMotion()) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [total, isPaused, autoRotateInterval, nextSlide]);

  // Keyboard navigation when hovered
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPaused) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, nextSlide, prevSlide]);

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

  // 5 Relative slots for pure unidirectional flow:
  // -2 (exit left), -1 (left), 0 (center), 1 (right), 2 (entry right)
  const SLOTS = [-2, -1, 0, 1, 2];

  return (
    <div
      ref={containerRef}
      className="relative w-full py-6 select-none overflow-hidden"
    >
      {/* ─── Ambient Shifting Gold Radial Glow Behind Active Card ─── */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(201, 162, 77, 0.16) 0%, rgba(201, 162, 77, 0.03) 60%, transparent 100%)',
        }}
      />

      {/* ─── DESKTOP 3D CYLINDRICAL CAROUSEL (Pure Unidirectional Flow) ─── */}
      <div
        className="hidden md:flex relative h-[450px] items-center justify-center"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      >
        {SLOTS.map((k) => {
          const virtualIndex = step + k;
          const itemIndex = ((virtualIndex % total) + total) % total;
          const item = testimonials[itemIndex];
          const isCenter = k === 0;

          // Calibrated slot positions - strictly decrementing as step increments (moving left)
          const distance = Math.abs(k);
          let translateX = 0;
          if (k === -1) translateX = -270;
          else if (k === 1) translateX = 270;
          else if (k === -2) translateX = -500;
          else if (k === 2) translateX = 500;

          let translateZ = -distance * 130;
          let rotateY = -k * 18;
          let scale = distance === 0 ? 1 : distance === 1 ? 0.88 : 0.72;
          let opacity = distance === 0 ? 1 : distance === 1 ? 0.68 : 0;
          let blur = distance === 0 ? 0 : distance * 2;
          let zIndex = 30 - distance * 10;

          const avatarUrl = item.avatar || AVATARS[itemIndex % AVATARS.length];

          return (
            <motion.div
              key={`slot-item-${item.id || itemIndex}-${virtualIndex}`}
              initial={false}
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
                pointerEvents: isCenter || distance === 1 ? 'auto' : 'none',
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!isCenter) {
                  setStep((prev) => prev + k);
                }
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className={`w-[360px] sm:w-[380px] h-[310px] flex flex-col justify-between cursor-grab active:cursor-grabbing rounded-2xl p-6 bg-white border transition-shadow duration-300 ${
                isCenter
                  ? 'border-gold shadow-[0_16px_40px_rgba(201,162,77,0.18)] ring-1 ring-gold/30'
                  : 'border-[#E8E8E8] shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
              }`}
            >
              {/* Card Header: Avatar + Executive Info + Verified Badge */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-gold/40 shadow-xs"
                    />
                    {/* Animated Pulsing Verified Badge */}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                      <CheckCircle2 size={10} className="stroke-[2.5]" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-navy text-sm tracking-tight truncate">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-muted truncate max-w-[160px]">
                        {item.role || 'Executive Participant'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Firm chip badge */}
                {item.company && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] text-[10px] font-mono font-bold text-navy shrink-0 shadow-2xs max-w-[125px] truncate">
                    <Building2 size={10} className="text-gold shrink-0" />
                    <span className="truncate">{item.company}</span>
                  </span>
                )}
              </div>

              {/* 5-Star Rating Row */}
              <div className="flex items-center gap-1 mb-2 shrink-0">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className="fill-gold text-gold"
                  />
                ))}
                <span className="text-[11px] font-mono font-bold text-gold ml-1">5.0</span>
              </div>

              {/* Graphic One-Line Punchy Quote */}
              <div className="flex-1 flex items-center my-1 overflow-hidden">
                <p className="text-sm font-medium text-navy leading-relaxed line-clamp-3 relative">
                  <Quote size={15} className="inline text-gold/40 mr-1.5 -mt-1 shrink-0" />
                  "{item.quote}"
                </p>
              </div>

              {/* Bottom Cohort Pill */}
              <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-muted shrink-0">
                <span className="font-mono text-[10px] text-muted/80 truncate">
                  {item.cohort || 'Executive Deal Lab'}
                </span>
                <span className="font-semibold text-gold text-[11px] shrink-0">
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

      {/* ─── MOBILE STACKED SWIPE DECK (<768px - Unidirectional) ─── */}
      <div className="md:hidden relative h-[330px] px-4 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {testimonials.map((item, idx) => {
            if (idx !== activeIndex) return null;
            const avatarUrl = item.avatar || AVATARS[idx % AVATARS.length];

            return (
              <motion.div
                key={item.id || idx}
                initial={{ scale: 0.94, opacity: 0, x: 180, rotate: 6 }}
                animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
                exit={{ scale: 0.9, opacity: 0, x: -180, rotate: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="w-full max-w-sm rounded-2xl p-5 bg-white border border-gold shadow-[0_12px_32px_rgba(201,162,77,0.16)] flex flex-col justify-between min-h-[260px]"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-gold/40"
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
          className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-navy hover:border-gold hover:text-gold transition-colors shadow-2xs cursor-pointer"
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
                  // Advance forward in the unified direction to target slide
                  const diff = (i - activeIndex + total) % total;
                  if (diff !== 0) {
                    setStep((prev) => prev + diff);
                  }
                }}
                className="relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  width: isActive ? 28 : 8,
                  backgroundColor: isActive ? '#FAF9F6' : '#E8E8E8',
                  border: isActive ? '1px solid #C9A24D' : 'none',
                }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {isActive && (
                  <motion.div
                    key={step}
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '0%' : '100%' }}
                    transition={{
                      duration: isPaused ? 0 : autoRotateInterval / 1000,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gold origin-left"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="w-8 h-8 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-navy hover:border-gold hover:text-gold transition-colors shadow-2xs cursor-pointer"
          aria-label="Next testimonial"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
