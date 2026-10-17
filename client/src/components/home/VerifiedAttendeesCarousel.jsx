import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShieldCheck, Sparkles, Quote } from 'lucide-react';

const DEFAULT_ATTENDEES = [
  {
    id: 1,
    name: 'Marcus Vance',
    role: 'Principal, PE Deal Team',
    firm: 'Carlyle Group',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    quote: 'Walk in curious. Leave dangerous. Best model blueprints I have seen in private equity.',
    location: 'New York',
    verifiedCohort: 'PE Deal Flow DD',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Partner, AI Strategy',
    firm: 'EQT Partners',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    quote: 'Deployed their due diligence workflow to our entire deal team in 48 hours.',
    location: 'London',
    verifiedCohort: 'VC Portfolio Intel',
  },
  {
    id: 3,
    name: 'Devin Thorne',
    role: 'VP, Mergers & Acquisitions',
    firm: 'Bain Capital',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    quote: 'No slides. Just real code and institutional deal systems. 10 out of 10.',
    location: 'Dubai',
    verifiedCohort: 'Cross-Border M&A',
  },
  {
    id: 4,
    name: 'Sarah Chen-Miller',
    role: 'Managing Director',
    firm: 'General Atlantic',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    quote: 'Saved our investment committee 20+ hours on every LBO screen we ran this quarter.',
    location: 'Singapore',
    verifiedCohort: 'LBO Modeling & DD',
  },
  {
    id: 5,
    name: 'Kareem Al-Mansoor',
    role: 'Chief Investment Officer',
    firm: 'Gulf Sovereign Fund',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    quote: 'The single highest ROI training our family office and fund has ever sponsored.',
    location: 'Abu Dhabi',
    verifiedCohort: 'Family Office Multi-Asset',
  },
  {
    id: 6,
    name: 'Liam O’Connor',
    role: 'Venture Partner',
    firm: 'Sequoia Scout',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    quote: 'Essential master class for anyone executing venture diligence or running money in 2026.',
    location: 'San Francisco',
    verifiedCohort: 'AI Deal Sourcing',
  },
];

export default function VerifiedAttendeesCarousel({ testimonials = [] }) {
  const items = testimonials.length > 0 ? testimonials : DEFAULT_ATTENDEES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  // Auto rotate every 3 seconds when card is not hovered
  useEffect(() => {
    if (isHovered || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered, items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 40) handlePrev();
    if (deltaX < -40) handleNext();
  };

  return (
    <section
      id="testimonials"
      className="relative py-24 sm:py-32 bg-[#0a0a0a] border-b border-white/[0.08] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Watermark Section Eyebrow */}
      <div
        aria-hidden="true"
        className="absolute top-8 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <span
          className="font-bebas font-extrabold uppercase tracking-tight text-white/[0.025] leading-none whitespace-nowrap"
          style={{ fontSize: 'clamp(4rem, 16vw, 16rem)' }}
        >
          ALUMNI PROOF
        </span>
      </div>

      {/* Shifting Ambient Glow Blob behind active card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gold/15 blur-[140px] pointer-events-none transition-all duration-700"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* ─── Section Header (Bhavya Portfolio Pattern) ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
              <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
                03 / ATTENDEE PROOF
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-bebas uppercase tracking-tight">
              VERIFIED ATTENDEE EXPERIENCES
            </h2>
          </div>

          {/* Controls: "1/6" Counter & Arrows */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm uppercase tracking-widest text-white/50">
              <strong className="text-gold font-extrabold text-lg">0{activeIndex + 1}</strong>
              <span className="text-white/20"> / </span>
              <span>0{items.length}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center text-white/70 hover:text-white hover:border-gold/50 hover:bg-gold/10 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center text-white/70 hover:text-white hover:border-gold/50 hover:bg-gold/10 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── 3D Rotating ID / Trading Card Deck ─── */}
        <div className="relative w-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
          <div className="relative w-full max-w-xl flex items-center justify-center">
            {items.map((item, index) => {
              // Calculate relative offset from active index
              const offset = (index - activeIndex + items.length) % items.length;
              // Handle wrap-around centered offset
              let relPos = offset;
              if (relPos > items.length / 2) relPos -= items.length;

              const isCurrent = relPos === 0;
              const isPrev = relPos === -1;
              const isNext = relPos === 1;
              const isVisible = Math.abs(relPos) <= 2;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={item.id || index}
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  initial={false}
                  animate={{
                    x: relPos * 110,
                    scale: isCurrent ? 1 : Math.max(0.78, 1 - Math.abs(relPos) * 0.14),
                    rotateY: relPos * -12,
                    zIndex: 20 - Math.abs(relPos),
                    opacity: isCurrent ? 1 : Math.max(0.25, 1 - Math.abs(relPos) * 0.4),
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className={`absolute w-[310px] sm:w-[420px] rounded-3xl p-6 sm:p-8 glass-strong border transition-colors cursor-pointer select-none shadow-[0_25px_60px_rgba(0,0,0,0.9)] ${
                    isCurrent
                      ? 'border-gold/60 shadow-[0_0_40px_rgba(201,162,77,0.25)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-cursor={isCurrent ? 'ALUMNI' : 'SELECT'}
                >
                  {/* Top Bar: Verified Badge + 5 Stars */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="sticker sticker-gold text-[9px]">
                      <ShieldCheck size={11} className="text-gold" />
                      <span>VERIFIED ✓</span>
                    </span>

                    <div className="flex items-center gap-1 text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-gold" />
                      ))}
                    </div>
                  </div>

                  {/* Quote (≤ 15 words) */}
                  <div className="relative mb-6">
                    <Quote size={20} className="text-gold/30 absolute -top-2 -left-1 pointer-events-none" />
                    <p className="font-sans font-extrabold text-white text-base sm:text-xl leading-snug tracking-tight pl-5">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Attendee Profile Info */}
                  <div className="flex items-center gap-3.5 pt-5 border-t border-white/10">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold/40 shrink-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans font-extrabold text-white text-sm sm:text-base leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="font-mono text-xs text-gold font-bold truncate mt-0.5">
                        {item.role}
                      </p>
                      <p className="font-mono text-[11px] text-white/40 truncate">
                        {item.firm} · {item.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom Slide Progress Dots ─── */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-gold shadow-[0_0_10px_rgba(201,162,77,0.8)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
