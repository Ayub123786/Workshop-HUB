import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Sparkles, Users, BookOpen, Globe, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';
import MagneticButton from '../animations/MagneticButton';

export default function HeroGenZ({ nextWorkshop, stats = {}, onReserveSpot }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Spring physics for mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Parallax offsets
  const watermarkX = useTransform(springX, [-0.5, 0.5], [-35, 35]);
  const watermarkY = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = e.clientX / innerWidth - 0.5;
      const normalizedY = e.clientY / innerHeight - 0.5;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
      setMousePosition({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const totalWorkshops = stats.totalWorkshops ?? 18;
  const totalPros = stats.totalAttendees ?? 1900;
  const totalCountries = stats.countries ?? 18;
  const totalAum = stats.aumTrained ?? 246;

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full overflow-hidden bg-[#0a0a0a] flex flex-col justify-between pt-28 sm:pt-36 pb-6 select-none border-b border-white/[0.08]">
      {/* ─── Giant Stacked Watermark Background Word (Parallax & Stroke) ─── */}
      <motion.div
        style={{ x: watermarkX, y: watermarkY }}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      >
        <h1
          className="font-bebas font-extrabold uppercase tracking-tight text-white/[0.035] leading-none whitespace-nowrap text-center"
          style={{ fontSize: 'clamp(5rem, 21vw, 24rem)' }}
        >
          WORKSHOP HUB
        </h1>
      </motion.div>

      {/* ─── Top Metadata Tags (Bhavya Portfolio Pattern) ─── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)] animate-pulse" />
          <span className="text-white/60">LIVE MASTER CLASSES</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-gold font-bold">
          <span>DUBAI · NYC · LDN</span>
          <span className="text-white/30">—</span>
          <span>2026</span>
        </div>
      </div>

      {/* ─── Center Hero Typography ─── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-14 my-auto">
        <div className="max-w-4xl flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 mb-5"
          >
            <Sparkles size={12} className="text-gold" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/80">
              Institutional Due Diligence & Deal Structuring
            </span>
          </motion.div>

          {/* Giant Stacked Title (Stroke-to-Fill) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-bebas font-extrabold uppercase leading-[0.88] tracking-tight mb-6"
          >
            <span
              className="block text-stroke text-white hover:text-white transition-all cursor-default"
              style={{ fontSize: 'clamp(2.8rem, 8.5vw, 8.8rem)' }}
            >
              BUILD WHAT THE BEST
            </span>
            <span
              className="block text-gold-gradient"
              style={{ fontSize: 'clamp(2.8rem, 8.5vw, 8.8rem)' }}
            >
              FUNDS ALREADY RUN.
            </span>
          </motion.div>

          {/* Exactly One Line of Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-base sm:text-lg md:text-xl text-white/60 font-sans max-w-xl mb-8 leading-relaxed"
          >
            Live master classes for people who run money. Systems, not slides.
          </motion.p>

          {/* Two Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-wrap items-center gap-4"
          >
            <MagneticButton
              onClick={onReserveSpot}
              className="btn-primary text-xs sm:text-sm py-3.5 px-8 font-mono font-bold tracking-wider rounded-full shadow-gold-glow flex items-center gap-2 group"
              data-cursor="RESERVE"
            >
              <span>Reserve a Spot</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>

            <button
              onClick={() => {
                document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-outline text-xs sm:text-sm py-3.5 px-7 font-mono font-semibold tracking-wider rounded-full flex items-center gap-2"
              data-cursor="EXPLORE"
            >
              <span>Explore Arsenal</span>
              <ArrowDown size={14} className="text-gold" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ─── Bottom Infinite Mono Stats Marquee Ticker (✦ Separators) ─── */}
      <div className="relative z-10 w-full pt-4 border-t border-white/[0.08] overflow-hidden bg-[#070707]/90 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 mb-2">
          {/* Scroll to Explore Cue */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>SCROLL TO EXPLORE ARSENAL</span>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 hidden sm:block">
            LIVE METRICS · REAL-TIME
          </div>
        </div>

        {/* Continuous Ticker */}
        <div className="py-2.5 overflow-hidden border-t border-white/[0.05]">
          <div className="flex w-max gap-8 animate-marquee-left select-none font-mono text-xs sm:text-sm uppercase tracking-widest text-white/40">
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <BookOpen size={14} className="text-gold" />
              <strong className="text-white"><CountUp end={totalWorkshops} duration={2} />+</strong> WORKSHOPS
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Users size={14} className="text-gold" />
              <strong className="text-white"><CountUp end={totalPros} duration={2.5} separator="," />+</strong> PROS TRAINED
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Globe size={14} className="text-gold" />
              <strong className="text-white"><CountUp end={totalCountries} duration={2} /></strong> COUNTRIES
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <TrendingUp size={14} className="text-gold" />
              <strong className="text-white">${totalAum}B+</strong> AUM REPRESENTED
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Sparkles size={14} className="text-gold" />
              <strong className="text-white">99.4%</strong> EXECUTIVE SATISFACTION
              <span className="text-gold">✦</span>
            </span>

            {/* Repeat for seamless infinite loop */}
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <BookOpen size={14} className="text-gold" />
              <strong className="text-white">{totalWorkshops}+</strong> WORKSHOPS
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Users size={14} className="text-gold" />
              <strong className="text-white">{totalPros.toLocaleString()}+</strong> PROS TRAINED
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Globe size={14} className="text-gold" />
              <strong className="text-white">{totalCountries}</strong> COUNTRIES
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <TrendingUp size={14} className="text-gold" />
              <strong className="text-white">${totalAum}B+</strong> AUM REPRESENTED
              <span className="text-gold">✦</span>
            </span>
            <span className="inline-flex items-center gap-3 hover:text-gold transition-colors">
              <Sparkles size={14} className="text-gold" />
              <strong className="text-white">99.4%</strong> EXECUTIVE SATISFACTION
              <span className="text-gold">✦</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
