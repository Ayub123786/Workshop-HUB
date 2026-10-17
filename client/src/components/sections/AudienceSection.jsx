import { FadeUp, StaggerContainer, StaggerItem, Magnetic } from '../motion/index.jsx';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function AudienceSection({ content, onRegister }) {
  const { label, heading, description, chips = [], ctaLabel } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Label */}
        <FadeUp>
          {label && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-4">
              {label}
            </span>
          )}
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.1}>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white mb-6">
            {heading || 'BUILT SPECIFICALLY FOR.'}
          </h2>
        </FadeUp>

        {/* Description */}
        {description && (
          <FadeUp delay={0.15}>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-10 max-w-2xl mx-auto font-sans"
               dangerouslySetInnerHTML={{ __html: description }} />
          </FadeUp>
        )}

        {/* Chips */}
        {chips.length > 0 && (
          <StaggerContainer stagger={0.06} delay={0.2} className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-12">
            {chips.map((chip) => (
              <StaggerItem key={chip}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block bg-[#141418] border border-white/10 hover:border-gold/50 text-white text-xs sm:text-sm font-mono font-medium px-4 py-2 rounded-full transition-colors cursor-default"
                >
                  ✦ {chip}
                </motion.span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* CTA */}
        <FadeUp delay={0.3}>
          <Magnetic>
            <button
              onClick={onRegister}
              className="bg-gold hover:bg-gold-light text-black font-extrabold px-9 py-4 rounded-full text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2.5 transition-all shadow-[0_0_35px_rgba(201,162,77,0.35)] cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{ctaLabel || 'Reserve Your Spot'}</span>
              <ArrowRight size={15} />
            </button>
          </Magnetic>
        </FadeUp>
      </div>
    </section>
  );
}
