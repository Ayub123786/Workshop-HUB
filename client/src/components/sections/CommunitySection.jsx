import { FadeUp, ZoomIn } from '../motion/index.jsx';

export default function CommunitySection({ content }) {
  const { badge, heading, subtext, image } = content || {};

  return (
    <section className="bg-cream section">
      <div className="container">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            {badge && <span className="badge mb-4 inline-block">{badge}</span>}
            <h2 className="text-display-md font-bold text-navy mb-4">{heading}</h2>
            {subtext && <p className="text-muted max-w-lg mx-auto">{subtext}</p>}
          </div>
        </FadeUp>

        {/* Community Image */}
        <ZoomIn delay={0.1}>
          <div className="rounded-card overflow-hidden border border-border max-w-5xl mx-auto">
            {image ? (
              <img src={image} alt="Community" className="w-full object-cover aspect-[16/9]" loading="lazy" />
            ) : (
              <div className="aspect-[16/9] bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center">
                <p className="text-white/50 text-lg font-medium">Community Photo</p>
              </div>
            )}
          </div>
        </ZoomIn>
      </div>
    </section>
  );
}
