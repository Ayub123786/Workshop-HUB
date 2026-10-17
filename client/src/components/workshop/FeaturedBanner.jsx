import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ChevronLeft, ChevronRight, ArrowUpRight, Flame, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import FlipCountdown from '../animations/FlipCountdown';
import MagneticButton from '../animations/MagneticButton';

export default function FeaturedBanner({ workshops = [] }) {
  const list = Array.isArray(workshops) ? workshops : workshops ? [workshops] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const spotsRef = useRef(null);
  const spotsInView = useInView(spotsRef, { once: true, amount: 0.3 });
  const AUTOPLAY_INTERVAL = 6000; // 6 seconds per cohort slide

  // Auto advance every 6 seconds, pausing on user hover
  useEffect(() => {
    if (list.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [list.length, isPaused, currentIndex]);

  if (list.length === 0) return null;

  // Clamp index if list changes
  const validIndex = currentIndex >= list.length ? 0 : currentIndex;
  const current = list[validIndex] || list[0];
  const seatsTotal = Number(current.seatsTotal ?? 100);
  const seatsBooked = Number(current.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercent = Math.min(100, Math.round((seatsBooked / seatsTotal) * 100));

  const startDateFormatted = current.startDate
    ? new Date(current.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl overflow-hidden border border-white/10 glass-strong shadow-[0_20px_60px_rgba(0,0,0,0.85)] group select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || current.slug || currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[460px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 lg:p-14 overflow-hidden"
        >
          {/* Full-Bleed Background Image with Cinematic Dark Gradient Vignette */}
          <div className="absolute inset-0 z-0">
            {current.bannerImage ? (
              <motion.img
                src={current.bannerImage}
                alt={current.title}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full object-cover opacity-45"
              />
            ) : (
              <div className="w-full h-full bg-[#121216]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/30 pointer-events-none" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 max-w-4xl">
            {/* Top Badges Row */}
            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
              <span className="sticker sticker-live text-[10px]">
                <Flame size={11} className="text-red-400" />
                <span>FLAGSHIP MASTERCLASS</span>
              </span>
              {current.category && (
                <span className="sticker sticker-gold text-[10px]">
                  {current.category}
                </span>
              )}
            </div>

            {/* Title Overlay in Bold Display Font */}
            <Link to={`/w/${current.slug}`} className="group/title block mb-3">
              <h3 className="font-bebas text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[0.95] group-hover/title:text-gold transition-colors">
                {current.title}
              </h3>
            </Link>

            {/* Exactly One Line Description */}
            <p className="text-white/70 text-xs sm:text-sm font-sans mb-6 max-w-2xl truncate">
              {current.shortDescription || 'Live executive due diligence and automated deal intelligence for PE allocators.'}
            </p>

            {/* Middle Row: Giant Flip Countdown + City Time Chips */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-8 pt-4 border-t border-white/10">
              {/* Giant Flip Countdown */}
              {current.startDate && new Date(current.startDate) > new Date() && (
                <div className="md:col-span-7">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold block mb-2">
                    COHORT COUNTDOWN
                  </span>
                  <FlipCountdown targetDate={current.startDate} />
                </div>
              )}

              {/* City Time Chips (DXB / NYC / LDN) */}
              <div className="md:col-span-5 flex flex-col justify-end space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold block">
                  GLOBAL TIMINGS
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                    <MapPin size={10} className="text-gold" /> DXB · 6:00 PM
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                    <MapPin size={10} className="text-gold" /> NYC · 10:00 AM
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                    <MapPin size={10} className="text-gold" /> LDN · 3:00 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Animated Spots Fill Progress Bar */}
            <div ref={spotsRef} className="mb-8 max-w-xl">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Users size={12} className="text-gold" />
                  <span>{seatsLeft} SEATS REMAINING</span>
                </span>
                <span className="text-gold font-extrabold">{fillPercent}% ENROLLED</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: spotsInView ? `${fillPercent}%` : 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-gold to-amber-300 rounded-full"
                />
              </div>
            </div>

            {/* Actions: Reserve a Spot & View Syllabus */}
            <div className="flex items-center gap-4 flex-wrap">
              <MagneticButton
                as={Link}
                to={`/w/${current.slug}?reserve=true`}
                className="btn-primary text-xs sm:text-sm py-3 px-8 font-mono font-bold tracking-wider rounded-full shadow-gold-glow flex items-center gap-2 group"
                data-cursor="RESERVE"
              >
                <span>Reserve a Spot</span>
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

              <Link
                to={`/w/${current.slug}`}
                className="btn-outline text-xs sm:text-sm py-3 px-6 font-mono font-semibold tracking-wider rounded-full"
              >
                View Syllabus
              </Link>
            </div>
          </div>

          {/* Carousel Next / Prev Controls */}
          {list.length > 1 && (
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 shadow-xl">
              <button
                onClick={handlePrev}
                className="p-1 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous cohort"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Progress pills for each slide */}
              <div className="flex items-center gap-1.5 px-0.5">
                {list.map((item, idx) => {
                  const isActive = idx === validIndex;
                  return (
                    <button
                      key={item._id || item.slug || idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                      style={{ width: isActive ? '36px' : '10px' }}
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      <div className={`w-full h-full ${isActive ? 'bg-gold/30' : 'bg-white/20'}`} />
                      {isActive && !isPaused && (
                        <motion.div
                          key={`progress-${validIndex}-${isPaused}`}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                          className="absolute inset-0 bg-gold rounded-full"
                        />
                      )}
                      {isActive && isPaused && (
                        <div className="absolute inset-0 bg-gold rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                className="p-1 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Next cohort"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
