import { Video, ClipboardList, FolderOpen, Activity, FileText, TrendingUp, Search, Filter, Users, BarChart2, Bell, Database } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '../motion/index.jsx';
import { FadeUp } from '../motion/index.jsx';

const iconMap = {
  Video, ClipboardList, FolderOpen, Activity, FileText, TrendingUp,
  Search, Filter, Users, BarChart2, Bell, Database,
};

function getIcon(name) {
  const Icon = iconMap[name];
  return Icon ? <Icon size={28} className="text-gold" /> : <span className="text-2xl">📦</span>;
}

export default function BenefitsSection({ content }) {
  const { label, heading, items = [] } = content || {};

  return (
    <section className="bg-cream section">
      <div className="container">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-12">
            {label && <p className="section-label mb-3">{label}</p>}
            <h2 className="text-display-sm font-bold text-navy max-w-2xl mx-auto text-balance">
              {heading}
            </h2>
          </div>
        </FadeUp>

        {/* Cards */}
        <StaggerContainer stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item) => (
            <StaggerItem key={item.id} hover="lift">
              <div className="bg-white rounded-card border border-border p-8 text-center h-full flex flex-col items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
                {/* Icon */}
                <div className="w-14 h-14 bg-cream-dark rounded-xl flex items-center justify-center">
                  {getIcon(item.icon)}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-navy text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
