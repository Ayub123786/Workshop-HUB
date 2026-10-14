import { FadeUp, StaggerContainer, StaggerItem, Magnetic } from '../motion/index.jsx';
import { motion } from 'framer-motion';

export default function AudienceSection({ content, onRegister }) {
  const { label, heading, description, chips = [], ctaLabel } = content || {};

  return (
    <section className="bg-white section">
      <div className="container max-w-3xl mx-auto text-center">
        {/* Label */}
        <FadeUp>
          {label && <span className="badge mb-4 inline-block">{label}</span>}
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.1}>
          <h2 className="text-display-md font-bold text-navy mb-4">{heading}</h2>
        </FadeUp>

        {/* Description */}
        {description && (
          <FadeUp delay={0.15}>
            <p className="text-muted leading-relaxed mb-8"
               dangerouslySetInnerHTML={{ __html: description }} />
          </FadeUp>
        )}

        {/* Chips */}
        {chips.length > 0 && (
          <StaggerContainer stagger={0.08} delay={0.2} className="flex flex-wrap justify-center gap-3 mb-10">
            {chips.map((chip, i) => (
              <StaggerItem key={chip}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block bg-cream-dark border border-border text-navy text-sm font-medium px-4 py-2 rounded-full"
                >
                  {chip}
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
              className="btn-primary-lg"
            >
              {ctaLabel || 'Reserve Your Spot'}
              <span>→</span>
            </button>
          </Magnetic>
        </FadeUp>
      </div>
    </section>
  );
}
