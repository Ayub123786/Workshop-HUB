import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '../animations/MagneticButton';

export default function NextSessionStrip({ workshop }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 450) {
        setVisible(false);
        return;
      }
      const pastEl = document.getElementById('past');
      if (pastEl) {
        const rect = pastEl.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80 && rect.bottom > 140) {
          setVisible(false);
          return;
        }
      }
      setVisible(true);
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
          className="fixed bottom-5 left-4 right-4 z-40 max-w-2xl mx-auto pointer-events-none"
        >
          <div className="pointer-events-auto bg-[#121216]/90 backdrop-blur-2xl border border-white/15 rounded-full p-2 sm:px-4 sm:py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(201,162,77,0.18)] flex items-center justify-between gap-3">
            {/* Meta */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="sticker sticker-live text-[9px] py-0.5 px-2">
                <Flame size={9} className="text-red-400" />
                <span>NEXT</span>
              </span>
              <p className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">
                {workshop.title}
              </p>
              {dateStr && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-full shrink-0">
                  <Calendar size={10} />
                  {dateStr}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <MagneticButton
                as={Link}
                to={`/w/${workshop.slug}?reserve=true`}
                className="btn-primary text-[11px] font-mono font-bold tracking-wider py-1.5 px-4 shadow-gold-glow flex items-center gap-1 rounded-full group"
                data-cursor="RESERVE"
              >
                <span>Reserve</span>
                <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
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
