import { useRef } from 'react';
import { useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Building2, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import Reveal from '../animations/Reveal';
import Marquee from '../animations/Marquee';
import Carousel3D from '../animations/Carousel3D';

const DEFAULT_FIRMS = [
  { name: 'Blackstone', tag: 'BX' },
  { name: 'KKR & Co.', tag: 'KKR' },
  { name: 'Carlyle Group', tag: 'CG' },
  { name: 'EQT Partners', tag: 'EQT' },
  { name: 'Sequoia Capital', tag: 'SC' },
  { name: 'Bain Capital', tag: 'BC' },
  { name: 'General Atlantic', tag: 'GA' },
  { name: 'Warburg Pincus', tag: 'WP' },
  { name: 'Insight Partners', tag: 'IP' },
  { name: 'Andreessen Horowitz', tag: 'a16z' },
  { name: 'TPG Capital', tag: 'TPG' },
  { name: 'CVC Capital', tag: 'CVC' },
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Principal, Technology & Deal Sourcing',
    company: 'Blackstone',
    quote: 'Collapsed our analyst memo drafting from 48 hours to under 35 minutes.',
    cohort: 'Fall 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Partner, Valuation Lab',
    company: 'EQT Partners',
    quote: 'Bridges audited financial statements with multi-agent synthesis that standard tech demos completely miss.',
    cohort: 'Winter 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'David Chen',
    role: 'Vice President, Deal Diligence',
    company: 'Bain Capital',
    quote: 'High-yield frameworks tested directly on live PE confidential information memorandums.',
    cohort: 'Summer 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Managing Director, Growth Equity',
    company: 'Insight Partners',
    quote: 'Immediate ROI on our very first portfolio intelligence rollout the following Monday.',
    cohort: 'Spring 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tariq Al-Mansoor',
    role: 'Head of Direct Investments',
    company: 'Gulf Family Office',
    quote: 'Concise and mathematically rigorous. Architecture templates alone paid for our seat 10x over.',
    cohort: 'Summer 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Claire Dupont',
    role: 'Associate Director, LBO Execution',
    company: 'CVC Capital',
    quote: 'Not a generic lecture — this is high-speed engineering tailored for actual financial models.',
    cohort: 'Fall 2026 Cohort',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
];

export default function FirmsTrustSection({ settings }) {
  const counterRef = useRef(null);
  const inView = useInView(counterRef, { once: true, amount: 0.3 });

  const aumNumber = parseFloat(settings?.globalTrust?.aumNumber || '246');
  const aumPrefix = settings?.globalTrust?.aumPrefix || '$';
  const aumLabel = settings?.globalTrust?.aumLabel || 'AUM Across Trained Investment Teams';

  const rawFirms = settings?.globalTrust?.firms?.length > 0 ? settings.globalTrust.firms : DEFAULT_FIRMS;
  // Normalize firms to objects with name and tag
  const firmsList = rawFirms.map((f, i) =>
    typeof f === 'string'
      ? { name: f, tag: f.slice(0, 3).toUpperCase() }
      : f.name
      ? { name: f.name, tag: f.tag || f.name.slice(0, 3).toUpperCase() }
      : DEFAULT_FIRMS[i % DEFAULT_FIRMS.length]
  );

  const half = Math.ceil(firmsList.length / 2);
  const row1 = firmsList.slice(0, half);
  const row2 = firmsList.slice(half);

  const rawTestimonials =
    settings?.globalTrust?.testimonials?.length > 0
      ? settings.globalTrust.testimonials
      : DEFAULT_TESTIMONIALS;

  return (
    <section id="about" className="bg-[#FAF9F6] py-20 sm:py-24 border-t border-b border-[#E8E8E8] relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section 1 Header */}
        <Reveal>
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-[11px] font-mono font-bold text-navy uppercase tracking-widest shadow-2xs mb-3">
              <Sparkles size={11} className="text-gold" />
              GLOBAL CAPITAL DEPLOYERS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy tracking-tight uppercase">
              Firms We've Trained
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-lg mx-auto mt-2">
              Production-grade deal systems battle-tested by top global private equity & VC funds.
            </p>
          </div>
        </Reveal>

        {/* Animated $246B+ Shimmer Counter Card */}
        <Reveal delay={0.08}>
          <div
            ref={counterRef}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 mb-12 max-w-xl mx-auto text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-gold/60 transition-colors"
          >
            <div className="flex items-center justify-center gap-1.5 text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight text-navy mb-2">
              <span className="text-gold font-light">{aumPrefix}</span>
              <span className="text-gold-shimmer">
                {inView ? <CountUp end={aumNumber} duration={2.2} decimals={0} /> : '0'}
              </span>
              <span className="text-gold">B+</span>
            </div>
            <p className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-muted flex items-center justify-center gap-1.5">
              <TrendingUp size={13} className="text-gold" />
              {aumLabel}
            </p>
          </div>
        </Reveal>

        {/* Two Infinite Marquee Rows Moving in One Direction (Left) */}
        <div className="space-y-3 mb-20">
          {/* Row 1: Left */}
          <Marquee direction="left" speed={38}>
            {row1.map((firm, idx) => (
              <div
                key={`r1-${idx}`}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs sm:text-sm font-semibold text-navy shrink-0 shadow-2xs hover:border-gold hover:shadow-xs transition-all"
              >
                <span className="w-6 h-6 rounded-md bg-[#FAF9F6] border border-[#E8E8E8] font-mono font-bold text-[10px] text-gold flex items-center justify-center">
                  {firm.tag || 'GP'}
                </span>
                <span>{firm.name}</span>
              </div>
            ))}
          </Marquee>

          {/* Row 2: Left (Unified Direction) */}
          <Marquee direction="left" speed={44}>
            {row2.map((firm, idx) => (
              <div
                key={`r2-${idx}`}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs sm:text-sm font-semibold text-navy shrink-0 shadow-2xs hover:border-gold hover:shadow-xs transition-all"
              >
                <span className="w-6 h-6 rounded-md bg-[#FAF9F6] border border-[#E8E8E8] font-mono font-bold text-[10px] text-gold flex items-center justify-center">
                  {firm.tag || 'PE'}
                </span>
                <span>{firm.name}</span>
              </div>
            ))}
          </Marquee>
        </div>

        {/* ─── VERIFIED ATTENDEE EXPERIENCES (MAIN FOCUS) ─── */}
        <Reveal>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-[11px] font-mono font-bold text-navy uppercase tracking-widest shadow-2xs mb-2">
              <CheckCircle2 size={11} className="text-emerald-600" />
              AUDITED PARTICIPANT RATINGS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight uppercase">
              Verified Attendee Experiences
            </h3>
            <p className="text-muted text-xs sm:text-sm max-w-md mx-auto mt-1">
              Direct feedback from investment allocators, partners, and deal leads.
            </p>
          </div>
        </Reveal>

        {/* The 3D Rotating Card Carousel */}
        <Carousel3D testimonials={rawTestimonials} autoRotateInterval={3500} />
      </div>
    </section>
  );
}
