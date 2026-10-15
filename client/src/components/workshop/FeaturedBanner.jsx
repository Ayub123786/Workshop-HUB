import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ChevronLeft, ChevronRight, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import FlipCountdown from '../animations/FlipCountdown';
import MagneticButton from '../animations/MagneticButton';

export default function FeaturedBanner({ workshops = [] }) {
  const list = Array.isArray(workshops) ? workshops : workshops ? [workshops] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const spotsRef = useRef(null);
  const spotsInView = useInView(spotsRef, { once: true, amount: 0.3 });

  // Auto advance every 8 seconds with progress fill
  useEffect(() => {
    if (list.length <= 1) return;
    const intervalMs = 8000;
    const stepMs = 50;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % list.length);
          return 0;
        }
        return prev + (stepMs / intervalMs) * 100;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [list.length, currentIndex]);

  if (list.length === 0) return null;

  const current = list[currentIndex] || list[0];
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
    setProgress(0);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % list.length);
    setProgress(0);
  };

  return (
    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-shadow">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || current.slug || currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]"
        >
          {/* Left Column: Clean Typography & Graphics (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Badges Row */}
              <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-gold text-navy text-xs font-bold px-3.5 py-1 rounded-full shadow-2xs uppercase tracking-wider font-mono">
                  <Sparkles size={11} /> Flagship Cohort
                </span>
                {current.category && (
                  <span className="inline-flex items-center bg-[#FAF9F6] text-navy text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E8]">
                    {current.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <Link to={`/w/${current.slug}`} className="group">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy leading-tight tracking-tight mb-2.5 group-hover:text-gold transition-colors">
                  {current.title}
                </h2>
              </Link>

              {/* ONE-LINE Short Description */}
              <p className="text-muted text-xs sm:text-sm leading-relaxed mb-5 max-w-xl truncate">
                {current.shortDescription || 'Executive financial modeling and automated diligence for private market teams.'}
              </p>

              {/* City Chips & Schedule (Dubai · NY · London) */}
              <div className="flex items-center gap-2 flex-wrap mb-5">
                {startDateFormatted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] text-xs font-semibold text-navy">
                    <Calendar size={13} className="text-gold" />
                    {startDateFormatted}
                  </span>
                )}

                {/* 3 Small City Chips */}
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E8E8E8] text-[11px] font-mono font-medium text-navy shadow-2xs">
                    <MapPin size={10} className="text-gold" /> Dubai
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E8E8E8] text-[11px] font-mono font-medium text-navy shadow-2xs">
                    <MapPin size={10} className="text-gold" /> NY
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E8E8E8] text-[11px] font-mono font-medium text-navy shadow-2xs">
                    <MapPin size={10} className="text-gold" /> London
                  </span>
                </div>
              </div>

              {/* Animated Spots Fill Bar */}
              <div ref={spotsRef} className="mb-6 max-w-md">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-navy flex items-center gap-1">
                    <Users size={12} className="text-gold" />
                    {seatsLeft} Seats Remaining
                  </span>
                  <span className="font-mono text-muted">{fillPercent}% Enrolled</span>
                </div>
                <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: spotsInView ? `${fillPercent}%` : 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
              </div>

              {/* Flip-Digit Countdown Timer */}
              {current.startDate && new Date(current.startDate) > new Date() && (
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block mb-2">
                    COHORT COUNTDOWN
                  </span>
                  <FlipCountdown targetDate={current.startDate} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E8E8E8] flex items-center gap-3 flex-wrap">
              <MagneticButton
                as={Link}
                to={`/w/${current.slug}`}
                className="btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-xs font-semibold flex items-center gap-1.5 rounded-full"
              >
                <span>Reserve a Spot</span>
                <ArrowRight size={14} />
              </MagneticButton>

              <Link
                to={`/w/${current.slug}`}
                className="px-4 py-2.5 rounded-full border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-navy hover:bg-[#FAF9F6] hover:border-gold transition-colors"
              >
                View Syllabus
              </Link>
            </div>
          </div>

          {/* Right Column: Ken Burns Zoom Image (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Link
              to={`/w/${current.slug}`}
              data-cursor="Explore"
              className="w-full h-full block relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[260px] rounded-xl overflow-hidden border border-[#E8E8E8] group shadow-inner"
            >
              {current.bannerImage ? (
                <motion.img
                  src={current.bannerImage}
                  alt={current.title}
                  animate={{
                    scale: [1, 1.07, 1],
                  }}
                  transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center text-muted font-mono text-xs uppercase tracking-widest">
                  Featured Masterclass
                </div>
              )}
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation with Progress Pill */}
      {list.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#E8E8E8] rounded-full px-2.5 py-1.5 shadow-2xs">
          <button
            onClick={handlePrev}
            className="p-1 rounded-full text-muted hover:text-navy hover:bg-cream transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Progress Pill */}
          <div className="relative w-10 h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gold origin-left"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <button
            onClick={handleNext}
            className="p-1 rounded-full text-muted hover:text-navy hover:bg-cream transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
