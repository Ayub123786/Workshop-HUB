import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FlipDigit({ value, label }) {
  const formatted = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-14 sm:w-14 sm:h-16 bg-[#16161c] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
        {/* Horizontal split divider */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/60 z-10" />

        <AnimatePresence mode="popLayout">
          <motion.span
            key={formatted}
            initial={{ y: -16, opacity: 0, rotateX: 45 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 16, opacity: 0, rotateX: -45 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-2xl font-extrabold font-mono text-gold tracking-tight"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-2 font-bold">
        {label}
      </span>
    </div>
  );
}

export default function FlipCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <FlipDigit value={timeLeft.days} label="DAYS" />
      <span className="text-gold font-mono text-xl sm:text-2xl font-bold -mt-5 opacity-40">:</span>
      <FlipDigit value={timeLeft.hours} label="HRS" />
      <span className="text-gold font-mono text-xl sm:text-2xl font-bold -mt-5 opacity-40">:</span>
      <FlipDigit value={timeLeft.minutes} label="MINS" />
      <span className="text-gold font-mono text-xl sm:text-2xl font-bold -mt-5 opacity-40">:</span>
      <FlipDigit value={timeLeft.seconds} label="SECS" />
    </div>
  );
}
