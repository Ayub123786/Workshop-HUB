import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if already shown in this session
    const hasLoaded = sessionStorage.getItem('hub_loader_shown_v1');
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('hub_loader_shown_v1', 'true');
          }, 200);
          return 100;
        }
        // Snappy irregular increment
        const increment = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[10000] bg-[#0a0a0a] flex flex-col justify-between p-6 sm:p-12 select-none"
        >
          {/* Top metadata */}
          <div className="flex items-center justify-between text-white/40 font-mono text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              <span>WORKSHOP HUB OS</span>
            </span>
            <span>DUBAI · NYC · LDN — 2026</span>
          </div>

          {/* Center Brand / Pulse */}
          <div className="flex flex-col items-center justify-center my-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-20 h-20 mb-6 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border border-dashed border-gold/40 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full bg-gold/10 blur-md animate-pulse" />
              <img
                src="/Logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain relative z-10"
              />
            </motion.div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-wider uppercase mb-2">
              WORKSHOP <span className="text-gold">HUB</span>
            </h1>
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
              Live Master Classes for People Who Run Money
            </p>
          </div>

          {/* Bottom Progress Counter */}
          <div className="space-y-3">
            <div className="flex items-end justify-between font-mono">
              <span className="text-xs text-gold uppercase tracking-widest">
                INITIALIZING ARSENAL
              </span>
              <span className="text-4xl sm:text-6xl font-extrabold text-white">
                {progress}
                <span className="text-gold text-2xl sm:text-3xl">%</span>
              </span>
            </div>

            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold via-violet to-gold"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
