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
  const displayLabel = label || 'YOUR INSTRUCTOR';
  // Always use the transparent PNG cutout for Ayub so there is no white/cream background
  const displayPortrait = (!portrait || portrait.includes('ayub-founder')) ? '/ayub-founder-full.png' : portrait;
  const displayCaption = portraitCaption || "The future isn't firm versus firm. It's firm versus agent stack.";

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 lg:py-28 border-t border-white/[0.08] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left: Name + Portrait Card */}
          <div className="lg:col-span-5">
            <SlideRight>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
                  {displayLabel}
                </span>
                <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white mb-6">
                  {displayName}
                </h2>

                {/* Dark Luxury Portrait Bento Card - Seamless Transparent Cutout */}
                <div className="relative rounded-3xl overflow-hidden glass-strong bg-gradient-to-b from-[#16161e] via-[#121218] to-[#0d0d12] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] pt-8 flex flex-col items-center justify-end min-h-[480px] sm:min-h-[520px]">
                  {/* Subtle Studio Spotlight behind Ayub */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,162,77,0.12),transparent_68%)] pointer-events-none" />

                  {/* Purple Paper Airplane with Gold Trailing Dots from /Logo.png */}
                  <div className="absolute left-3.5 sm:left-5 top-5 z-20 pointer-events-none select-none">
                    <img
                      src="/Logo.png"
                      alt="Logo"
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_15px_rgba(124,92,255,0.45)]"
                    />
                  </div>

                  {/* Properly Formatted Quote Box with Clean Typography */}
                  <div className="absolute right-3.5 sm:right-5 top-5 max-w-[210px] sm:max-w-[240px] z-20 select-none p-3.5 sm:p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
                    <p className="text-xs sm:text-[13px] font-sans font-semibold text-white/95 leading-snug tracking-tight">
                      "{displayCaption}"
                    </p>
                  </div>

                  {/* Ayub Portrait with seamless transparent integration */}
                  <div className="w-full flex items-end justify-center relative z-10 mt-auto">
                    <img
                      src={displayPortrait}
                      alt={displayName}
                      className="w-[86%] sm:w-[84%] max-w-[330px] h-auto object-contain select-none transition-transform duration-500 hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom Vignette for Smooth Fade */}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/70 to-transparent pointer-events-none z-10" />
                </div>
              </div>
            </SlideRight>
          </div>

          {/* Right: Bio + Key Values */}
          <div className="lg:col-span-7">
            <SlideLeft>
              <div className="pt-2 lg:pt-14">
                {/* Bio paragraphs */}
                <div className="space-y-4 sm:space-y-5 mb-10">
                  {displayBio.map((para, i) => (
                    <FadeUp key={i} delay={i * 0.1}>
                      <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans font-normal">
                        {para}
                      </p>
                    </FadeUp>
                  ))}
                </div>

                {/* Key-value rows */}
                {displayKeyValues.length > 0 && (
                  <div className="space-y-0 border-t border-white/10">
                    {displayKeyValues.map((kv, i) => (
                      <motion.div
                        key={kv.label || i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        className="border-b border-white/10 py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6"
                      >
                        <span className="text-[11px] font-mono font-bold text-gold uppercase tracking-wider shrink-0 w-24">
                          {kv.label}
                        </span>
                        <span className="text-white text-sm sm:text-base font-sans">
                          {kv.value}
                        </span>
                      </motion.div>
                    ))}
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
