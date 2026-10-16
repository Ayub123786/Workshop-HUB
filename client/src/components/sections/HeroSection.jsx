import { Calendar, Clock } from 'lucide-react';
import { TextReveal, FadeUp, Floating, Magnetic } from '../motion/index.jsx';
import { motion } from 'framer-motion';

export default function HeroSection({ content, onRegister, workshop }) {
  const { badge, title, subtitle, ctaLabel, bannerImage, dateLabel, dates, timezones } = content || {};

  return (
    <section className="bg-white min-h-[90vh] flex flex-col justify-center py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Badge */}
        <FadeUp delay={0}>
          <div className="flex justify-center mb-6">
            <span className="badge">{badge || 'LIVE MASTER CLASS'}</span>
          </div>
        </FadeUp>

        {/* Title */}
        <FadeUp delay={0.1}>
          <h1 className="text-display-lg text-navy text-center font-bold mb-6 max-w-4xl mx-auto text-balance">
            {title}
          </h1>
        </FadeUp>

        {/* Subtitle */}
        <FadeUp delay={0.2}>
          <p className="text-base md:text-lg text-muted text-center max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
        </FadeUp>

        {/* CTA */}
        <FadeUp delay={0.3}>
          <div className="flex justify-center mb-12">
            <Magnetic>
              <motion.button
                onClick={onRegister}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ['0 0 0 0 rgba(200,162,79,0)', '0 0 0 8px rgba(200,162,79,0.15)', '0 0 0 0 rgba(200,162,79,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="btn-primary-lg"
              >
                {ctaLabel || 'Reserve Your Spot'}
                <span>→</span>
              </motion.button>
            </Magnetic>
          </div>
        </FadeUp>

        {/* Banner Image */}
        {bannerImage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-card overflow-hidden border border-border shadow-card max-w-4xl mx-auto mb-8"
          >
            <img
              src={bannerImage}
              alt={title}
              className="w-full object-cover aspect-[16/9]"
            />
          </motion.div>
        )}

        {/* Date Card */}
        {(dateLabel || dates || timezones?.length > 0) && (
          <Floating>
            <FadeUp delay={0.5}>
              <div className="max-w-md mx-auto bg-cream border border-border rounded-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-gold" />
                </div>
                <div>
                  {dateLabel && (
                    <p className="section-label mb-1">{dateLabel}</p>
                  )}
                  {dates && (
                    <p className="font-semibold text-navy text-sm mb-2">{dates}</p>
                  )}
                  {timezones?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted flex-wrap">
                      <Clock size={12} className="shrink-0" />
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
