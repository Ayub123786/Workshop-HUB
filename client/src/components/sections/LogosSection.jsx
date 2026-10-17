import { FadeUp, FadeIn } from '../motion/index.jsx';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Infinite logo marquee
function LogoMarquee({ firms = [] }) {
  if (!firms.length) return null;
  const doubled = [...firms, ...firms];
  return (
    <div className="overflow-hidden relative marquee-track">
      <div className="flex gap-4 sm:gap-6 animate-marquee marquee-inner whitespace-nowrap">
        {doubled.map((firm, i) => (
          <span key={i} className="inline-flex items-center px-4 py-2 bg-[#16161c] border border-white/10 rounded-full text-xs font-mono font-bold text-white/70 shrink-0">
            {firm}
          </span>
        ))}
      </div>
    </div>
  );
}

function AumCounter({ number = '246', prefix = '$', label = 'Billion AUM+' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const num = parseFloat(number);

  return (
    <div ref={ref} className="text-center py-8">
      <p className="font-display text-4xl sm:text-6xl text-gold mb-1 leading-none">
        {prefix}
        {inView ? <CountUp end={num} duration={2.5} decimals={0} /> : '0'}
        {label.includes('B') ? 'B+' : '+'}
      </p>
      <p className="text-white/40 text-xs font-mono uppercase tracking-widest mt-2">
        Institutional Capital Represented
      </p>
    </div>
  );
}

export default function LogosSection({ content }) {
  const { label, heading, image, firms = [], aumNumber = '246', aumLabel = 'Billion AUM+', aumPrefix = '$' } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
              {label || 'PROVEN RECORD'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white max-w-2xl mx-auto text-balance">
              {heading || 'FUNDS WHO TRUST OUR SYSTEMS.'}
            </h2>
          </div>
        </FadeUp>

        {/* Logo wall image or bento card */}
        <FadeIn delay={0.1}>
          {image ? (
            <div className="rounded-3xl overflow-hidden border border-white/10 max-w-4xl mx-auto bg-[#141418]">
              <img src={image} alt="Firms" className="w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden max-w-4xl mx-auto glass-strong bg-[#141418] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
              <AumCounter number={aumNumber} prefix={aumPrefix} label={aumLabel} />
              <div className="px-6 pb-8">
                <LogoMarquee firms={firms} />
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
