import { SlideRight, SlideLeft, FadeUp } from '../motion/index.jsx';
import { motion } from 'framer-motion';

const defaultBio = [
  'Fifteen years in finance, now building multi model agentic systems for private equity and venture capital firms focused on due diligence.',
  'Trained in audit and advisory at KPMG and BDO Binder International, then founded and sold a technology company. That mix is the point. Most AI training for investment teams is run by people who have never signed off on a set of numbers, and most valuation training is run by people who have never built an agent. This session sits in the middle.',
  'Runs a due diligence lab for PE and VC firms, where every engine is stress tested against real deal documents before it reaches a client.',
];

const defaultKeyValues = [
  { label: 'AUDIT', value: 'Ex KPMG, ex BDO Binder International' },
  { label: 'FOUNDER', value: 'Built and exited a technology company' },
  { label: 'NOW', value: 'Due diligence lab for PE and VC firms' },
  { label: 'FOCUS', value: 'Multi model agentic orchestration for deal teams' },
];

export default function TrainerSection({ content }) {
  const { label, name, portrait, portraitCaption, bio, keyValues } = content || {};

  const displayBio = Array.isArray(bio) && bio.length > 0 ? bio : defaultBio;
  const displayKeyValues = Array.isArray(keyValues) && keyValues.length > 0 ? keyValues : defaultKeyValues;
  const displayName = name || 'Ayub.';
  const displayLabel = label || 'YOUR TRAINER';
  const displayPortrait = (!portrait || portrait === '/ayub-founder.png') ? '/ayub-founder-full.jpg' : portrait;
  const displayCaption = portraitCaption || "The future isn't firm versus firm. It's firm versus agent stack.";

  return (
    <section className="bg-cream section py-16 lg:py-24 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left: Name + Portrait Card */}
          <div className="lg:col-span-5">
            <SlideRight>
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-muted mb-2">
                  {displayLabel}
                </p>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy tracking-tight mb-8">
                  {displayName}
                </h2>

                {/* Portrait card with warm tan background */}
                <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#EFE9DF] border border-[#E5DDD2] shadow-sm pt-8 px-4 flex flex-col items-center justify-end min-h-[460px] sm:min-h-[500px]">
                  {/* Purple Paper Airplane with Gold Trailing Dots from /Logo.png */}
                  <div className="absolute left-2.5 sm:left-4 top-[44%] -translate-y-1/2 z-10 pointer-events-none select-none">
                    <img
                      src="/Logo.png"
                      alt="Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs"
                    />
                  </div>

                  {/* Quote positioned cleanly on the right with ample breathing room */}
                  <div className="absolute right-2.5 sm:right-3.5 lg:right-4 top-[36%] -translate-y-1/2 max-w-[125px] sm:max-w-[140px] z-10 select-none">
                    <p className="text-xs sm:text-[13px] font-bold text-navy leading-snug tracking-tight">
                      {displayCaption}
                    </p>
                  </div>

                  {/* Ayub Portrait with seamless background */}
                  <div className="w-full flex items-end justify-center relative z-0 -translate-x-3 sm:-translate-x-4">
                    <img
                      src={displayPortrait}
                      alt={displayName}
                      className="w-[72%] sm:w-[70%] max-w-[280px] h-auto object-contain select-none"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </SlideRight>
          </div>

          {/* Right: Bio + Key Values */}
          <div className="lg:col-span-7">
            <SlideLeft>
              <div className="pt-4 lg:pt-14">
                {/* Bio paragraphs */}
                <div className="space-y-4 sm:space-y-5 mb-10">
                  {displayBio.map((para, i) => (
                    <FadeUp key={i} delay={i * 0.1}>
                      <p className="text-sm sm:text-base text-navy/80 leading-relaxed font-normal">
                        {para}
                      </p>
                    </FadeUp>
                  ))}
                </div>

                {/* Key-value rows */}
                {displayKeyValues.length > 0 && (
                  <div className="space-y-0">
                    {displayKeyValues.map((kv, i) => (
                      <motion.div
                        key={kv.label || i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        viewport={{ once: true }}
                        className="border-t border-border/80 py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6"
                      >
                        <span className="text-xs font-bold tracking-[0.14em] uppercase text-gold w-28 shrink-0">
                          {kv.label}
                        </span>
                        <span className="text-sm sm:text-base text-navy font-medium">
                          {kv.value}
                        </span>
                      </motion.div>
                    ))}
                    <div className="border-t border-border/80" />
                  </div>
                )}
              </div>
            </SlideLeft>
          </div>
        </div>
      </div>
    </section>
  );
}
