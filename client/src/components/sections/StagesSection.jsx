import { TrendingUp, FileSearch, BarChart2, DollarSign, Users, Scale, FileText, Shield, Database, Activity, Bell, Search, Filter } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '../motion/index.jsx';
import { motion } from 'framer-motion';

const iconMap = { TrendingUp, FileSearch, BarChart2, DollarSign, Users, Scale, FileText, Shield, Database, Activity, Bell, Search, Filter };

function getIcon(name, size = 20) {
  const Icon = iconMap[name];
  return Icon ? <Icon size={size} /> : <FileText size={size} />;
}

function StageCard({ stage, index }) {
  return (
    <div className="stage-card group">
      {/* Top row: icon + stage num | duration chip */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center text-gold shrink-0 group-hover:bg-gold/10 transition-colors">
            {getIcon(stage.icon)}
          </div>
          <div>
            <p className="text-xs font-mono text-muted tracking-wider">Stage {stage.number}</p>
            <h3 className="font-bold text-navy text-base leading-tight">{stage.title}</h3>
          </div>
        </div>

        {/* Duration chip */}
        {stage.duration && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + 0.3, type: 'spring', stiffness: 300 }}
            viewport={{ once: true }}
            className="shrink-0 bg-cream-dark border border-border text-navy/70 text-xs font-semibold px-2.5 py-1 rounded-full ml-2"
          >
            {stage.duration}
          </motion.span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed mb-4">{stage.description}</p>

      {/* Time saved tag */}
      {stage.timeSaved && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gold">{stage.timeSaved}</span>
        </div>
      )}
    </div>
  );
}

export default function StagesSection({ content }) {
  const { label, heading, subtitle, items = [] } = content || {};

  return (
    <section className="bg-cream section">
      <div className="container">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-14">
            {label && <span className="badge mb-4 inline-block">{label}</span>}
            <h2 className="text-display-md font-bold text-navy mb-4">{heading}</h2>
            {subtitle && (
              <p className="text-muted max-w-xl mx-auto leading-relaxed">{subtitle}</p>
            )}
          </div>
        </FadeUp>

        {/* 2-column grid of stage cards */}
        <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {items.map((stage, i) => (
            <StaggerItem key={stage.id} hover="lift">
              <StageCard stage={stage} index={i} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
