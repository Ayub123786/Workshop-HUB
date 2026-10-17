import { Video, ClipboardList, FolderOpen, Activity, FileText, TrendingUp, Search, Filter, Users, BarChart2, Bell, Database } from 'lucide-react';
import { StaggerContainer, StaggerItem, FadeUp } from '../motion/index.jsx';

const iconMap = {
  Video, ClipboardList, FolderOpen, Activity, FileText, TrendingUp,
  Search, Filter, Users, BarChart2, Bell, Database,
};

function getIcon(name) {
  const Icon = iconMap[name];
  return Icon ? <Icon size={26} className="text-gold" /> : <span className="text-2xl">⚡</span>;
}

export default function BenefitsSection({ content }) {
  const { label, heading, items = [] } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-14">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
              {label || 'THE DELIVERABLES'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white max-w-3xl mx-auto text-balance">
              {heading || 'WHAT YOU WALK AWAY WITH.'}
            </h2>
          </div>
        </FadeUp>

        {/* Cards */}
        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {items.map((item) => (
            <StaggerItem key={item.id} hover="lift" className="h-full">
              <div className="glass-strong bg-[#141418] rounded-3xl border border-white/10 p-8 text-center h-full flex flex-col items-center gap-4 hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300">
                {/* Icon Container */}
                <div className="w-14 h-14 bg-gold/10 border border-gold/25 rounded-2xl flex items-center justify-center shrink-0">
                  {getIcon(item.icon)}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">{item.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
