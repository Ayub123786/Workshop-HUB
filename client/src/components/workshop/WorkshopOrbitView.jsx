import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  MoveHorizontal,
  Flame,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  Radar,
  Eye,
} from 'lucide-react';
import MagneticButton from '../animations/MagneticButton';

export default function WorkshopOrbitView({ workshops = [], onSelectWorkshop }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const items = useMemo(() => workshops.slice(0, 8), [workshops]);
  const total = Math.max(1, items.length);

  // Swipe / Drag handling
  const touchStartX = useRef(null);
  const touchStartTime = useRef(0);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Touch and pointer swipe handlers
  const handleTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
    touchStartX.current = clientX;
    touchStartTime.current = performance.now();
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const clientX = e.changedTouches ? e.changedTouches[0]?.clientX : e.clientX;
    const diff = clientX - touchStartX.current;
    const elapsed = performance.now() - touchStartTime.current;

    // Quick swipe or drag > 40px
    if (diff < -40 || (diff < -20 && elapsed < 250)) {
      goToNext();
    } else if (diff > 40 || (diff > 20 && elapsed < 250)) {
      goToPrev();
    }
    touchStartX.current = null;
  };

  const activeWorkshop = items[currentIndex] || items[0];

  if (!items.length) return null;

  return (
    <div className="relative w-full py-8 select-none overflow-hidden">
      {/* ─── Ambient Glow Center Stage ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gold/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] bg-violet/10 blur-[100px] rounded-full pointer-events-none -z-0" />

      {/* ─── Top Control Strip: HUD Metadata & Jump Pills ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Section Indicator */}
        <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(201,162,77,0.8)] animate-pulse" />
          <span className="text-white/60">3D DECK ORBIT</span>
          <span className="text-white/20">—</span>
          <span className="text-gold font-bold">
            COHORT 0{currentIndex + 1} / 0{total}
          </span>
        </div>

        {/* Center / Right: Drag Hint & Numbered Jump Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-white/40 font-mono text-[11px] uppercase tracking-wider mr-2">
            <MoveHorizontal size={13} className="text-gold" />
            <span>SWIPE OR ARROWS TO BROWSE</span>
          </div>

          {/* Numbered Jump Pills */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {items.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={item._id || item.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gold text-[#0a0a0a] shadow-[0_0_12px_rgba(201,162,77,0.5)] scale-105'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  aria-label={`Jump to cohort 0${idx + 1}`}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 3D Deck Stage ─── */}
      <div
        className="relative w-full h-[520px] sm:h-[580px] flex items-center justify-center preserve-3d cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ perspective: '1400px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {items.map((workshop, index) => {
          let offset = index - currentIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isVisible = Math.abs(offset) <= 2;
          if (!isVisible) return null;

          const isActive = offset === 0;

          // Responsive spacing
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
          let xOffset = 0;
          let rotateY = 0;
          let scale = 1;
          let zIndex = 20;
          let opacity = 1;

          if (isActive) {
            xOffset = 0;
            rotateY = 0;
            scale = 1.04;
            zIndex = 30;
            opacity = 1;
          } else if (Math.abs(offset) === 1) {
            xOffset = offset * (isMobile ? 220 : 360);
            rotateY = offset < 0 ? 24 : -24; // Never flips backward!
            scale = 0.88;
            zIndex = 20;
            opacity = 0.72;
          } else if (Math.abs(offset) === 2) {
            xOffset = offset * (isMobile ? 310 : 580);
            rotateY = offset < 0 ? 38 : -38; // Never flips backward!
            scale = 0.74;
            zIndex = 10;
            opacity = 0.35;
          }

          const blur = isActive ? 0 : Math.abs(offset) * 2;
          const seatsTotal = Number(workshop.seatsTotal ?? 100);
          const seatsBooked = Number(workshop.seatsBooked ?? 0);
          const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
          const percentFilled = Math.min(100, Math.round((seatsBooked / seatsTotal) * 100));

          return (
            <motion.div
              key={workshop._id || workshop.id || index}
              className="absolute top-1/2 left-1/2 select-none"
              initial={false}
              animate={{
                x: `calc(-50% + ${xOffset}px)`,
                y: '-50%',
                rotateY: rotateY,
                scale: scale,
                zIndex: zIndex,
                opacity: opacity,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
                mass: 0.8,
              }}
              style={{
                transformStyle: 'preserve-3d',
                width: '370px',
                maxWidth: 'calc(100vw - 36px)',
              }}
              onClick={() => {
                if (!isActive) setCurrentIndex(index);
              }}
            >
              {/* Card Body */}
              <div
                className={`relative rounded-3xl p-5 sm:p-6 glass-strong border transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.92)] ${
                  isActive
                    ? 'border-gold/60 shadow-[0_0_40px_rgba(201,162,77,0.3)] bg-[#121218]/95'
                    : 'border-white/10 bg-[#0e0e13]/85 hover:border-white/25 cursor-pointer'
                }`}
              >
                {/* Header row: Category Sticker + Cohort # */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="sticker sticker-gold text-[10px] py-0.5 px-2.5 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Sparkles size={10} className="text-gold" />
                    <span>{workshop.category || 'EXECUTIVE MASTERCLASS'}</span>
                  </span>

                  <span className="font-mono text-[11px] text-white/50 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] font-bold">
                    0{index + 1}
                  </span>
                </div>

                {/* Thumbnail Banner */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-black/60 border border-white/10 group">
                  {workshop.bannerImage ? (
                    <img
                      src={workshop.bannerImage}
                      alt={workshop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center font-mono text-xs text-white/40 bg-gradient-to-br from-white/[0.05] to-transparent">
                      <Radar size={28} className="text-gold/40 mb-1" />
                      <span>EXECUTIVE LAB</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Right Accreditation Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-mono text-white/80">
                    <ShieldCheck size={11} className="text-gold" />
                    <span>ACCREDITED</span>
                  </div>

                  {/* Bottom Strip: Seats Left Pill + Mode */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold uppercase tracking-wider">
                      <Flame size={11} className="text-red-400 fill-current" />
                      <span>{seatsLeft} SEATS LEFT</span>
                    </span>

                    <span className="text-gold font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full border border-gold/30">
                      LIVE Q4 2026
                    </span>
                  </div>
                </div>

                {/* Workshop Title */}
                <h3 className="font-sans font-extrabold text-white text-base sm:text-lg leading-snug line-clamp-2 mb-2 min-h-[2.8rem]">
                  {workshop.title}
                </h3>

                {/* Subtitle / Topic Description */}
                <p className="text-xs text-white/60 font-sans line-clamp-2 mb-4 leading-relaxed min-h-[2rem]">
                  {workshop.shortDescription ||
                    workshop.tagline ||
                    'Advanced deal sourcing, quantitative underwriting, and automation architecture.'}
                </p>

                {/* Capacity Progress Bar */}
                <div className="mb-4 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    <span>SEAT ALLOCATION</span>
                    <span className="text-gold font-bold">{percentFilled}% FILLED</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(201,162,77,0.7)]"
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Meta details: Date & Location */}
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-gold" />
                    <span>
                      {workshop.startDate
                        ? new Date(workshop.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'DEC 2026'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gold" />
                    <span>{workshop.city || 'DUBAI · DIFC'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <Link
                    to={`/w/${workshop.slug}?reserve=true`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 btn-primary py-2.5 px-4 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-1.5 group"
                  >
                    <span>Reserve Spot</span>
                    <ArrowUpRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>

                  <Link
                    to={`/w/${workshop.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 rounded-full border border-white/15 bg-white/[0.04] text-white/80 hover:text-white hover:border-gold hover:bg-white/[0.08] transition-all"
                    title="View syllabus & details"
                  >
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Bottom Navigation Controls Strip ─── */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-4">
        {/* Prev Arrow */}
        <button
          onClick={goToPrev}
          className="w-11 h-11 rounded-full bg-[#16161c] border border-white/15 hover:border-gold/60 text-white/70 hover:text-gold flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Previous cohort"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center Pill Indicator */}
        <div className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 font-mono text-xs uppercase tracking-wider text-white/70 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="font-bold text-white truncate max-w-[220px]">
            {activeWorkshop?.title || 'Selected Cohort'}
          </span>
        </div>

        {/* Next Arrow */}
        <button
          onClick={goToNext}
          className="w-11 h-11 rounded-full bg-[#16161c] border border-white/15 hover:border-gold/60 text-white/70 hover:text-gold flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Next cohort"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
