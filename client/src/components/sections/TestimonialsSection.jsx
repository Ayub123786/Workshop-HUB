import { FadeUp, StaggerContainer, StaggerItem } from '../motion/index.jsx';

function TestimonialCard({ item }) {
  return (
    <div className="glass-strong bg-[#141418] rounded-3xl border border-white/10 p-6 hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        {item.avatar ? (
          <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-gold/40" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#181822] border border-white/10 shrink-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gold font-mono">{item.name?.[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-4 h-4 bg-[#0077B5] rounded flex items-center justify-center shrink-0">
              <span className="text-white text-[8px] font-bold">in</span>
            </div>
            <p className="font-bold text-white text-sm truncate">{item.name}</p>
          </div>
          {item.role && <p className="text-xs text-white/50 truncate font-mono">{item.role}</p>}
          {item.location && <p className="text-[11px] text-white/40 font-mono">{item.location}</p>}
        </div>
      </div>

      {/* Quote */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex-1 flex flex-col justify-between">
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">"{item.quote}"</p>
        {item.company && <p className="text-xs text-gold font-mono font-bold mt-3">✦ {item.company}</p>}
      </div>
    </div>
  );
}

export default function TestimonialsSection({ content }) {
  const { label, heading, subtext, items = [] } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-14">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
              {label || 'ALUMNI VERIFICATION'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white mb-3">
              {heading || 'WHAT ATTENDEES ARE SAYING.'}
            </h2>
            {subtext && <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto font-sans">{subtext}</p>}
          </div>
        </FadeUp>

        {/* Testimonials grid */}
        <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto items-stretch">
          {items.map((item) => (
            <StaggerItem key={item.id} hover="lift" className="h-full">
              <TestimonialCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
