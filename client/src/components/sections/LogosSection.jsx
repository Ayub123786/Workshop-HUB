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
      <div className="flex gap-8 animate-marquee marquee-inner whitespace-nowrap">
        {doubled.map((firm, i) => (
          <span key={i} className="inline-flex items-center px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-navy/60 shrink-0">
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
      <p className="text-4xl font-bold text-white mb-1">
        {prefix}
        {inView ? <CountUp end={num} duration={2.5} decimals={0} /> : '0'}
        {label.includes('B') ? 'B+' : '+'}
      </p>
      <p className="text-white/70 text-sm">Firms We Trained</p>
    </div>
  );
}

export default function LogosSection({ content }) {
  const { label, heading, image, firms = [], aumNumber = '246', aumLabel = 'Billion AUM+', aumPrefix = '$' } = content || {};

  return (
    <section className="bg-white section">
      <div className="container">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            {label && <p className="section-label mb-3">{label}</p>}
            <h2 className="text-display-sm font-bold text-navy max-w-2xl mx-auto text-balance">
              {heading}
            </h2>
          </div>
        </FadeUp>

        {/* Logo wall image or purple card */}
        <FadeIn delay={0.1}>
          {image ? (
            <div className="rounded-card overflow-hidden border border-border max-w-4xl mx-auto">
              <img src={image} alt="Firms" className="w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-card overflow-hidden max-w-4xl mx-auto"
                 style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #1a0f40 100%)' }}>
              <AumCounter number={aumNumber} prefix={aumPrefix} label={aumLabel} />
              <div className="px-8 pb-8">
                <LogoMarquee firms={firms} />
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
