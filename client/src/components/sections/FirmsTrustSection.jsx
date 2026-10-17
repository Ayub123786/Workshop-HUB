import { useRef } from 'react';
import { useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, Sparkles } from 'lucide-react';

const DEFAULT_FIRMS_ROW1 = [
  'Carlyle Group',
  'EQT Partners',
  'Sequoia Capital',
  'Bain Capital',
  'General Atlantic',
  'Warburg Pincus',
  'Insight Partners',
];

const DEFAULT_FIRMS_ROW2 = [
  'Blackstone',
  'KKR & Co.',
  'Andreessen Horowitz',
  'TPG Capital',
  'CVC Capital',
  'Apollo Global',
  'Silver Lake',
];

export default function FirmsTrustSection({ settings }) {
  const counterRef = useRef(null);
  const inView = useInView(counterRef, { once: true, amount: 0.3 });

  const aumNumber = parseFloat(settings?.globalTrust?.aumNumber || '246');

  return (
    <section
      id="firms"
      className="bg-[#0a0a0a] py-24 sm:py-32 border-b border-white/[0.08] relative overflow-hidden select-none"
    >
      {/* Background Section Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <span
          className="font-bebas font-extrabold uppercase tracking-tight text-white/[0.025] leading-none whitespace-nowrap"
          style={{ fontSize: 'clamp(5rem, 18vw, 18rem)' }}
        >
          TIER-1 FUNDS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
              <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
                04 / INSTITUTIONAL PROOF
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-bebas uppercase tracking-tight">
              FIRMS WE'VE TRAINED
            </h2>
          </div>

          <p className="font-mono text-xs text-white/40 uppercase tracking-widest max-w-xs text-left md:text-right">
            Deployed across private equity, venture, and sovereign wealth investment teams.
          </p>
        </div>

        {/* Huge $246B+ Outlined Digits Counter Card */}
        <div
          ref={counterRef}
          className="rounded-3xl glass-strong border border-white/10 p-8 sm:p-12 mb-16 max-w-3xl mx-auto text-center relative overflow-hidden group hover:border-gold/50 transition-colors shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-transparent to-violet/[0.05] pointer-events-none" />

          <p className="font-mono text-xs uppercase tracking-widest text-gold font-bold mb-3 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-gold" />
            <span>AGGREGATE CAPITAL REPRESENTED</span>
          </p>

          <div className="flex items-center justify-center gap-2 font-bebas font-extrabold tracking-tight leading-none text-white my-2">
            <span className="text-5xl sm:text-7xl lg:text-9xl text-gold">$</span>
            <span
              className="text-6xl sm:text-8xl lg:text-9xl text-stroke hover:text-white transition-all cursor-default"
              style={{ fontSize: 'clamp(4.5rem, 13vw, 10.5rem)' }}
            >
              {inView ? <CountUp end={aumNumber} duration={2.4} /> : '246'}
            </span>
            <span className="text-5xl sm:text-7xl lg:text-9xl text-gold-gradient">B+</span>
          </div>

          <p className="font-mono text-xs sm:text-sm text-white/50 uppercase tracking-wider flex items-center justify-center gap-2 mt-4">
            <TrendingUp size={15} className="text-gold" />
            <span>Active Dealmaking & Portfolio Assets Under Management</span>
          </p>
        </div>

        {/* Two Opposing Infinite Marquee Rows in Big Outlined Text with ✦ Separators */}
        <div className="space-y-4">
          {/* Row 1: Left */}
          <div className="overflow-hidden py-2 marquee-track">
            <div className="flex w-max gap-8 animate-marquee-left select-none font-bebas text-3xl sm:text-5xl lg:text-6xl uppercase tracking-wider">
              {DEFAULT_FIRMS_ROW1.concat(DEFAULT_FIRMS_ROW1).map((firm, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-6 text-stroke text-white/30 hover:text-gold hover:text-fill transition-all duration-300 cursor-pointer"
                  data-cursor="FIRM"
                >
                  <span>{firm}</span>
                  <span className="text-gold text-2xl sm:text-3xl">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Row 2: Right (Opposing Direction) */}
          <div className="overflow-hidden py-2 marquee-track">
            <div className="flex w-max gap-8 animate-marquee-right select-none font-bebas text-3xl sm:text-5xl lg:text-6xl uppercase tracking-wider">
              {DEFAULT_FIRMS_ROW2.concat(DEFAULT_FIRMS_ROW2).map((firm, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-6 text-stroke text-white/30 hover:text-violet-light transition-all duration-300 cursor-pointer"
                  data-cursor="FIRM"
                >
                  <span>{firm}</span>
                  <span className="text-violet text-2xl sm:text-3xl">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
