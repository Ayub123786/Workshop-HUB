import { useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { CheckCircle2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '../motion/index.jsx';

const DEFAULT_FIRMS = [
  'Blackstone',
  'KKR',
  'Carlyle Group',
  'EQT Partners',
  'Sequoia Capital',
  'Bain Capital',
  'General Atlantic',
  'Warburg Pincus',
  'Insight Partners',
  'Andreessen Horowitz',
  'TPG Capital',
  'CVC Capital Partners',
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Principal, Technology & Deal Sourcing',
    company: 'Blackstone',
    quote: 'The automation workflow collapsed our analyst memo drafting from 48 hours to under 35 minutes. An indispensable masterclass.',
    cohort: 'Fall 2026 Cohort',
  },
  {
    name: 'Elena Rostova',
    role: 'Partner, Valuation Lab',
    company: 'EQT Partners',
    quote: 'Ayub brings the exact bridge between real audited statements and multi-agent synthesis that standard tech demos completely miss.',
    cohort: 'Winter 2026 Cohort',
  },
  {
    name: 'David Chen',
    role: 'Vice President, Deal Diligence',
    company: 'Bain Capital',
    quote: 'Practical, high-yield frameworks tested on actual PE confidential documents. Highly recommended for any deal team looking to stay ahead.',
    cohort: 'Summer 2026 Cohort',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Managing Director, Growth Equity',
    company: 'Insight Partners',
    quote: 'The return on investment was immediate on our first portfolio intelligence rollout the following Monday.',
    cohort: 'Spring 2026 Cohort',
  },
  {
    name: 'Tariq Al-Mansoor',
    role: 'Head of Direct Investments',
    company: 'Gulf Family Office',
    quote: 'Clear, concise, and technically rigorous. The architecture templates alone paid for the seat ten times over.',
    cohort: 'Summer 2026 Cohort',
  },
  {
    name: 'Claire Dupont',
    role: 'Associate Director, LBO Execution',
    company: 'CVC Capital',
    quote: 'Not a generic lecture — this is an engineering workshop tailored for financial models and analyst speed.',
    cohort: 'Fall 2026 Cohort',
  },
];

export default function FirmsTrustSection({ settings }) {
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const counterRef = useRef(null);
  const inView = useInView(counterRef, { once: true });

  const aumNumber = parseFloat(settings?.globalTrust?.aumNumber || '246');
  const aumPrefix = settings?.globalTrust?.aumPrefix || '$';
  const aumLabel = settings?.globalTrust?.aumLabel || 'Billion AUM+ Across Trained Investment Teams';

  const firms = settings?.globalTrust?.firms?.length > 0 ? settings.globalTrust.firms : DEFAULT_FIRMS;
  const logoImage = settings?.globalTrust?.logoImage;

  const rawTestimonials = settings?.globalTrust?.testimonials?.length > 0
    ? settings.globalTrust.testimonials
    : DEFAULT_TESTIMONIALS;

  const visibleTestimonials = showAllTestimonials ? rawTestimonials : rawTestimonials.slice(0, 4);

  // Duplicated firm array for seamless infinite marquee
  const marqueeFirms = [...firms, ...firms];

  return (
    <section id="about" className="bg-[#FAF9F6] py-20 border-t border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-gold uppercase tracking-widest inline-block mb-2">
              PROVEN ACROSS GLOBAL FUNDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Firms We've Trained
            </h2>
            <p className="text-muted text-sm max-w-xl mx-auto mt-2">
              Empowering investment teams, private equity sponsors, and venture funds with production-grade AI systems.
            </p>
          </div>
        </FadeUp>

        {/* Animated AUM Counter Card */}
        <FadeUp delay={0.1}>
          <div
            ref={counterRef}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-8 sm:p-10 mb-12 max-w-2xl mx-auto text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-center gap-1 text-4xl sm:text-5xl lg:text-6xl font-bold text-navy tracking-tight mb-2">
              <span className="text-gold font-light">{aumPrefix}</span>
              {inView ? <CountUp end={aumNumber} duration={2.2} decimals={0} /> : '0'}
              <span className="text-gold">B+</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted">
              {aumLabel}
            </p>
          </div>
        </FadeUp>

        {/* Slow Smooth Marquee of Firms */}
        <div className="mb-16">
          {logoImage ? (
            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-[#E8E8E8] bg-white p-4">
              <img src={logoImage} alt="Firms We've Trained" className="w-full object-contain max-h-24" />
            </div>
          ) : (
            <div className="overflow-hidden relative py-3 mask-marquee">
              <div className="flex gap-4 animate-marquee whitespace-nowrap will-change-transform">
                {marqueeFirms.map((firm, idx) => (
                  <div
                    key={`${firm}-${idx}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-xs sm:text-sm font-semibold text-navy/80 shrink-0 shadow-2xs hover:border-gold transition-colors"
                  >
                    <Building2 size={14} className="text-gold shrink-0 opacity-70" />
                    <span>{firm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Testimonials Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            WHAT ATTENDEES SAY
          </span>
          <h3 className="text-xl font-bold text-navy mt-1">
            Verified Attendee Experiences
          </h3>
        </div>

        {/* Testimonials 2-Column Grid with Verified Attendee badge */}
        <StaggerContainer
          stagger={0.08}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto"
        >
          {visibleTestimonials.map((t, idx) => (
            <StaggerItem key={idx}>
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-full flex flex-col justify-between hover:border-gold/60 transition-colors shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      Verified Attendee
                    </span>
                    {t.cohort && (
                      <span className="text-[10px] font-mono text-muted">
                        {t.cohort}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-navy leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy text-xs sm:text-sm">{t.name}</p>
                    <p className="text-[11px] text-muted">
                      {t.role} {t.company ? `· ${t.company}` : ''}
                    </p>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-[#0077B5]/10 text-[#0077B5] font-bold text-[10px] flex items-center justify-center">
                    in
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Read More / Show Less Toggle Button */}
        {rawTestimonials.length > 4 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllTestimonials(!showAllTestimonials)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E8E8E8] bg-white text-xs font-semibold text-navy hover:bg-cream hover:border-gold transition-colors"
            >
              {showAllTestimonials ? (
                <>
                  <span>Show Fewer Testimonials</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Read More Testimonials ({rawTestimonials.length - 4} more)</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
