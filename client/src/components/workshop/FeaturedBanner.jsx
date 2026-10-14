import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Countdown timer hook/component
function CountdownBlock({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'D', value: timeLeft.days },
        { label: 'H', value: timeLeft.hours },
        { label: 'M', value: timeLeft.minutes },
        { label: 'S', value: timeLeft.seconds },
      ].map((item, idx) => (
        <div
          key={idx}
          className="flex items-baseline gap-0.5 bg-[#F9F9F8] border border-[#E8E8E8] px-2.5 py-1 rounded-lg"
        >
          <span className="font-mono text-sm font-bold text-navy">
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedBanner({ workshops = [], onReserve }) {
  const list = Array.isArray(workshops) ? workshops : workshops ? [workshops] : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto advance if multiple featured
  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [list.length]);

  if (list.length === 0) return null;

  const current = list[currentIndex] || list[0];
  const seatsTotal = Number(current.seatsTotal ?? 100);
  const seatsBooked = Number(current.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);

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
    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || current.slug || currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]"
        >
          {/* Left Column: Clean Typography & Details (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Badges Row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center bg-gold text-navy text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                  ★ Featured Masterclass
                </span>
                {current.category && (
                  <span className="inline-flex items-center bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-[#E8E8E8]">
                    {current.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <Link to={`/w/${current.slug}`}>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy leading-tight tracking-tight mb-3 hover:text-gold transition-colors">
                  {current.title}
                </h2>
              </Link>

              {/* Short Description */}
              {current.shortDescription && (
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6 max-w-xl line-clamp-3">
                  {current.shortDescription}
                </p>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs text-muted">
                {startDateFormatted && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-navy shrink-0" />
                    <span>{startDateFormatted}</span>
                  </div>
                )}
                {current.timezones?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-navy shrink-0" />
                    <span className="truncate">
                      {current.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-navy shrink-0" />
                  <span>
                    <strong className="text-navy font-semibold">{seatsLeft}</strong> spots remaining ({seatsBooked}/{seatsTotal} booked)
                  </span>
                </div>
              </div>

              {/* Countdown Strip */}
              {current.startDate && new Date(current.startDate) > new Date() && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Starts in:
                  </span>
                  <CountdownBlock targetDate={current.startDate} />
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-[#E8E8E8] flex items-center gap-3 flex-wrap">
              <Link
                to={`/w/${current.slug}`}
                className="btn-primary text-xs sm:text-sm py-2.5 px-5 shadow-xs font-semibold flex items-center gap-1.5"
              >
                Reserve Your Spot
                <ArrowRight size={14} />
              </Link>
              <Link
                to={`/w/${current.slug}`}
                className="px-4 py-2.5 rounded-lg border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-navy hover:bg-cream hover:border-gold transition-colors"
              >
                View Full Curriculum
              </Link>
            </div>
          </div>

          {/* Right Column: 16:10 Banner Image (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 lg:p-6 flex items-center justify-center">
            <Link
              to={`/w/${current.slug}`}
              className="w-full h-full block relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[240px] rounded-xl overflow-hidden border border-[#E8E8E8] group"
            >
              {current.bannerImage ? (
                <img
                  src={current.bannerImage}
                  alt={current.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full bg-[#F5F5F3] flex items-center justify-center text-muted">
                  <span className="text-xs font-mono uppercase text-muted tracking-widest">
                    Featured Workshop
                  </span>
                </div>
              )}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation (Arrows & Dots) if multiple */}
      {list.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#E8E8E8] rounded-full px-2 py-1 shadow-2xs">
          <button
            onClick={handlePrev}
            className="p-1 rounded-full text-muted hover:text-navy hover:bg-cream transition-colors"
            aria-label="Previous featured workshop"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1 px-1">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'w-4 bg-gold' : 'w-1.5 bg-[#D1D5DB]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="p-1 rounded-full text-muted hover:text-navy hover:bg-cream transition-colors"
            aria-label="Next featured workshop"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
