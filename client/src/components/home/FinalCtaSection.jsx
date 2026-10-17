import { ArrowUpRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import MagneticButton from '../animations/MagneticButton';

export default function FinalCtaSection({ onReserveSpot }) {
  return (
    <section className="relative min-h-[85vh] sm:min-h-screen w-full flex flex-col justify-between py-20 sm:py-28 bg-[#0a0a0a] overflow-hidden select-none border-b border-white/[0.08]">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/15 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-violet/15 blur-[140px] pointer-events-none" />

      {/* Top Eyebrow */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 mb-6">
          <Sparkles size={12} className="text-gold" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-bold">
            Q4 EXECUTIVE ADMISSIONS OPEN
          </span>
        </div>
      </div>

      {/* Giant Center Line: "SEE YOU IN THE ROOM." */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-center my-auto">
        <h2 className="font-bebas font-extrabold uppercase leading-[0.88] tracking-tight mb-6">
          <span
            className="block text-stroke text-white hover:text-white transition-all cursor-default"
            style={{ fontSize: 'clamp(3.5rem, 13vw, 13.5rem)' }}
          >
            SEE YOU IN
          </span>
          <span
            className="block text-gold-gradient"
            style={{ fontSize: 'clamp(3.5rem, 13vw, 13.5rem)' }}
          >
            THE ROOM.
          </span>
        </h2>

        <p className="font-mono text-xs sm:text-sm text-white/50 uppercase tracking-widest max-w-md mx-auto mb-10">
          Strictly capped seating per cohort. Verified institutional participants only.
        </p>

        {/* Huge Magnetic CTA Button */}
        <div className="flex items-center justify-center">
          <MagneticButton
            onClick={onReserveSpot}
            className="btn-primary-lg text-sm sm:text-base font-mono font-extrabold py-4 px-10 rounded-full shadow-[0_0_45px_rgba(201,162,77,0.45)] hover:shadow-[0_0_60px_rgba(201,162,77,0.6)] flex items-center gap-3 group transition-transform"
            data-cursor="RESERVE"
          >
            <span>Reserve a Spot Now</span>
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </MagneticButton>
        </div>
      </div>

      {/* Infinite Marquee Strip Right Above Footer */}
      <div className="relative z-10 w-full pt-8 border-t border-white/[0.08] overflow-hidden bg-black/60">
        <div className="flex w-max gap-8 animate-marquee-left select-none font-mono text-xs sm:text-sm uppercase tracking-widest text-white/40 py-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="inline-flex items-center gap-2">
                <span>RESERVE YOUR COHORT</span>
                <span className="text-gold">✦</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>SECURE ALLOCATOR SEAT</span>
                <span className="text-gold">✦</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>LIMITED ADMISSIONS</span>
                <span className="text-gold">✦</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>LIVE DUE DILIGENCE LABS</span>
                <span className="text-gold">✦</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>DUBAI · NYC · LDN</span>
                <span className="text-gold">✦</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
