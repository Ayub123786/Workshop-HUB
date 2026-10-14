import { FadeUp, StaggerContainer, StaggerItem } from '../motion/index.jsx';

function TestimonialCard({ item }) {
  return (
    <div className="bg-white rounded-card border border-border p-5 hover:shadow-card-hover transition-shadow duration-200">
      {/* LinkedIn-style header */}
      <div className="flex items-start gap-3 mb-4">
        {item.avatar ? (
          <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-border" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-cream-dark border-2 border-border shrink-0 flex items-center justify-center">
            <span className="text-lg font-bold text-muted">{item.name?.[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {/* LinkedIn icon */}
            <div className="w-5 h-5 bg-[#0077B5] rounded flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-bold">in</span>
            </div>
            <p className="font-semibold text-navy text-sm truncate">{item.name}</p>
          </div>
          {item.role && <p className="text-xs text-muted truncate">{item.role}</p>}
          {item.location && <p className="text-xs text-subtle">{item.location}</p>}
        </div>
      </div>

      {/* Quote */}
      <div className="bg-[#0077B5]/5 border border-[#0077B5]/10 rounded-lg p-4">
        <p className="text-sm text-navy leading-relaxed">"{item.quote}"</p>
        {item.company && <p className="text-xs text-[#0077B5] font-medium mt-2">{item.company}</p>}
      </div>
    </div>
  );
}

export default function TestimonialsSection({ content }) {
  const { label, heading, subtext, items = [] } = content || {};

  return (
    <section className="bg-white section">
      <div className="container">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            {label && <p className="section-label mb-3">{label}</p>}
            <h2 className="text-display-sm font-bold text-navy mb-3">{heading}</h2>
            {subtext && <p className="text-muted">{subtext}</p>}
          </div>
        </FadeUp>

        {/* Testimonials grid */}
        <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {items.map((item) => (
            <StaggerItem key={item.id} hover="lift">
              <TestimonialCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
