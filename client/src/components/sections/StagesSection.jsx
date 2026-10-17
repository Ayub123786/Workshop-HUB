import { TrendingUp, FileSearch, BarChart2, DollarSign, Users, Scale, FileText, Shield, Database, Activity, Bell, Search, Filter } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '../motion/index.jsx';
import { motion } from 'framer-motion';

const iconMap = { TrendingUp, FileSearch, BarChart2, DollarSign, Users, Scale, FileText, Shield, Database, Activity, Bell, Search, Filter };

function getIcon(name, size = 20) {
  const Icon = iconMap[name];
  return Icon ? <Icon size={size} className="text-gold" /> : <FileText size={size} className="text-gold" />;
}

function StageCard({ stage, index }) {
  return (
    <div className="glass-strong bg-[#141418] rounded-3xl border border-white/10 p-6 sm:p-7 hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group h-full flex flex-col justify-between">
      <div>
        {/* Top row: icon + stage num | duration chip */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gold/10 border border-gold/25 rounded-xl flex items-center justify-center text-gold shrink-0 group-hover:scale-105 transition-transform">
              {getIcon(stage.icon)}
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-gold uppercase tracking-widest">Stage 0{stage.number || index + 1}</p>
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight mt-0.5">{stage.title}</h3>
            </div>
          </div>

          {/* Duration chip */}
          {stage.duration && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 300 }}
              viewport={{ once: true }}
              className="shrink-0 bg-white/[0.04] border border-white/10 text-white/70 text-xs font-mono font-bold px-3 py-1 rounded-full ml-2"
            >
              {stage.duration}
            </motion.span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-4 font-sans">{stage.description}</p>
      </div>

      {/* Time saved tag */}
      {stage.timeSaved && (
        <div className="pt-2">
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <span>⚡ {stage.timeSaved}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function StagesSection({ content }) {
  const { label, heading, subtitle, items = [] } = content || {};

  return (
    <section className="bg-[#0a0a0a] text-[#F5F5F0] py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp>
          <div className="text-center mb-14">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 inline-block mb-3">
              {label || 'THE ARCHITECTURE'}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white mb-3">
              {heading || 'STEP-BY-STEP WORKFLOW.'}
            </h2>
            {subtitle && (
              <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-sans">{subtitle}</p>
            )}
          </div>
        </FadeUp>

        {/* 2-column grid of stage cards */}
        <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto items-stretch">
          {items.map((stage, i) => (
            <StaggerItem key={stage.id || i} hover="lift" className="h-full">
              <StageCard stage={stage} index={i} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
