import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { FadeUp, Floating, Magnetic } from '../motion/index.jsx';
import { motion } from 'framer-motion';

export default function HeroSection({ content, onRegister, workshop }) {
  const { badge, title, subtitle, ctaLabel, bannerImage, dateLabel, dates, timezones } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] min-h-[85vh] flex flex-col justify-center pt-28 sm:pt-36 pb-16 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-violet/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Badge */}
        <FadeUp delay={0}>
          <div className="flex justify-center mb-6">
            <span className="sticker sticker-gold text-[11px] px-3.5 py-1">
              <Sparkles size={11} />
              <span>{badge || 'LIVE MASTER CLASS'}</span>
            </span>
          </div>
        </FadeUp>

        {/* Title */}
        <FadeUp delay={0.1}>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white text-center font-bold mb-6 max-w-4xl mx-auto leading-[1.02]">
            {title}
          </h1>
        </FadeUp>

        {/* Subtitle */}
        <FadeUp delay={0.2}>
          <p className="text-sm sm:text-base md:text-lg text-white/60 text-center max-w-2xl mx-auto leading-relaxed mb-8 font-sans">
            {subtitle}
          </p>
        </FadeUp>

        {/* CTA */}
        <FadeUp delay={0.3}>
          <div className="flex justify-center mb-12">
            <Magnetic>
              <motion.button
                onClick={onRegister}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-gold hover:bg-gold-light text-black font-extrabold px-8 py-4 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_30px_rgba(201,162,77,0.35)] cursor-pointer"
              >
                <span>{ctaLabel || 'Reserve Your Spot'}</span>
                <ArrowRight size={15} />
              </motion.button>
            </Magnetic>
          </div>
        </FadeUp>

        {/* Banner Image */}
        {bannerImage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-w-4xl mx-auto mb-8 bg-[#111115] relative"
          >
            <img
              src={bannerImage}
              alt={title}
              className="w-full object-cover aspect-[16/9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* Date Card */}
        {(dateLabel || dates || timezones?.length > 0) && (
          <Floating>
            <FadeUp delay={0.5}>
              <div className="max-w-md mx-auto glass-strong bg-[#141418] border border-white/10 rounded-2xl p-5 flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-gold" />
                </div>
                <div>
                  {dateLabel && (
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold mb-1">
                      {dateLabel}
                    </p>
                  )}
                  {dates && (
                    <p className="font-bold text-white text-sm mb-1.5 font-mono">{dates}</p>
                  )}
                  {timezones?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-white/50 flex-wrap font-mono">
                      <Clock size={12} className="shrink-0 text-gold" />
                      <span>
                        {timezones.map((tz, i) => (
                          <span key={tz.city}>
                            {i > 0 && ' · '}
                            {tz.city} {tz.time}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </FadeUp>
          </Floating>
        )}
      </div>
    </section>
  );
}
