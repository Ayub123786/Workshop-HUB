import { FadeUp, ZoomIn } from '../motion/index.jsx';

export default function CommunitySection({ content }) {
  const { badge, heading, subtext, image } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            {badge && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
                {badge}
              </span>
            )}
            <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white mb-3">
              {heading}
            </h2>
            {subtext && <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto font-sans">{subtext}</p>}
          </div>
        </FadeUp>

        {/* Community Image */}
        <ZoomIn delay={0.1}>
          <div className="rounded-3xl overflow-hidden border border-white/10 max-w-5xl mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-[#141418]">
            {image ? (
              <img src={image} alt="Community" className="w-full object-cover aspect-[16/9]" loading="lazy" />
            ) : (
              <div className="aspect-[16/9] bg-gradient-to-br from-[#111115] to-[#181822] flex items-center justify-center">
                <p className="text-white/30 text-sm font-mono uppercase tracking-widest">Community Gathering</p>
              </div>
            )}
          </div>
        </ZoomIn>
      </div>
    </section>
  );
}
