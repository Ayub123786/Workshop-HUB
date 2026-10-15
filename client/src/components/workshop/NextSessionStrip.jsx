import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '../animations/MagneticButton';

export default function NextSessionStrip({ workshop }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky strip once user scrolls past the hero section (>450px)
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!workshop || dismissed) return null;

  const dateStr = workshop.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-md border border-[#E8E8E8] rounded-full p-2 sm:px-4 sm:py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
            {/* Meta */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-navy shrink-0">
                Next Cohort
              </span>
              <span className="text-muted/40 hidden sm:inline">|</span>
              <p className="text-xs font-bold text-navy truncate max-w-[220px] sm:max-w-[320px]">
                {workshop.title}
              </p>
              {dateStr && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-muted bg-[#FAF9F6] border border-[#E8E8E8] px-2 py-0.5 rounded-full shrink-0">
                  <Calendar size={10} className="text-gold" />
                  {dateStr}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <MagneticButton
                as={Link}
                to={`/w/${workshop.slug}`}
                className="btn-primary text-xs py-1.5 px-3.5 shadow-2xs font-semibold flex items-center gap-1 rounded-full"
              >
                <span>Reserve</span>
                <ArrowRight size={12} />
              </MagneticButton>

              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-full text-muted hover:text-navy hover:bg-[#FAF9F6] transition-colors"
                aria-label="Dismiss sticky session bar"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
