import { useState } from 'react';
import { Plus, Sparkles, Check, FileCode, Receipt, Video, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GENZ_FAQS = [
  {
    num: '01',
    q: 'Who is in the room with me?',
    a: 'Senior PE deal leads, VC partners, and CIOs managing real fund capital.',
    chips: ['PE & VC Principals', 'Institutional Only'],
  },
  {
    num: '02',
    q: 'Is this live or pre-recorded video?',
    a: '100% live and interactive. Live financial stress-testing, actual data rooms, and open Q&A.',
    chips: ['Live Cohorts', 'Real-time Q&A'],
  },
  {
    num: '03',
    q: 'What deliverables do I walk away with?',
    a: 'Production prompt architectures, Python agent blueprints, and audited financial models.',
    chips: ['Code Templates', 'Lifetime Updates'],
  },
  {
    num: '04',
    q: 'Can my firm get an invoice for reimbursement?',
    a: 'Yes. Automated corporate receipts with tax identification are issued instantly at checkout.',
    chips: ['Fund Reimbursable', 'Instant Invoices'],
  },
  {
    num: '05',
    q: 'What if an emergency deal blocks my attendance?',
    a: 'Full 4K session recording, transcript, and code repository sent within 24 hours.',
    chips: ['4K Recordings', 'Archive Access'],
  },
  {
    num: '06',
    q: 'How does the waitlist work for sold-out cohorts?',
    a: 'Free priority queue. If an executive reschedules, the next in line claims the open seat.',
    chips: ['Zero Deposit Queue', 'Priority Notification'],
  },
];

export default function PlatformFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section
      id="faq"
      className="bg-[#0a0a0a] py-24 sm:py-32 border-b border-white/[0.08] relative overflow-hidden select-none"
    >
      {/* Background Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <span
          className="font-bebas font-extrabold uppercase tracking-tight text-white/[0.025] leading-none whitespace-nowrap"
          style={{ fontSize: 'clamp(5rem, 18vw, 18rem)' }}
        >
          QUESTIONS
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
              05 / CLARITY
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-bebas uppercase tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-2">
            Direct answers. Zero corporate filler.
          </p>
        </div>

        {/* Big Numbered Accordion List */}
        <div className="space-y-4">
          {GENZ_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.num}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#141418] border-gold/50 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(201,162,77,0.12)]'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Big Mono Number (01, 02...) */}
                    <span
                      className={`font-mono text-base sm:text-xl font-extrabold transition-colors shrink-0 ${
                        isOpen ? 'text-gold' : 'text-white/30'
                      }`}
                    >
                      {faq.num}
                    </span>

                    {/* Question */}
                    <h3
                      className={`font-sans font-extrabold text-base sm:text-xl leading-snug tracking-tight transition-colors ${
                        isOpen ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {faq.q}
                    </h3>
                  </div>

                  {/* Rotating Plus -> Times (+) to (x) with Gold Glow */}
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      isOpen
                        ? 'border-gold bg-gold text-[#0a0a0a] shadow-gold-glow'
                        : 'border-white/15 bg-white/[0.04] text-white/60 hover:text-white'
                    }`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </motion.div>
                </button>

                {/* Smooth Animated Height & Drawing Gold Line */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Animated Drawing Gold Line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-px bg-gradient-to-r from-gold/60 via-gold/30 to-transparent mx-6 sm:mx-7 origin-left"
                      />

                      <div className="p-6 sm:p-7 pt-5 sm:pt-5 space-y-4">
                        <p className="text-sm sm:text-base text-white/70 font-sans leading-relaxed">
                          {faq.a}
                        </p>

                        {/* Interactive Icon Chips */}
                        {faq.chips && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {faq.chips.map((chip, i) => (
                              <span
                                key={i}
                                className="sticker sticker-gold text-[10px]"
                              >
                                <Check size={10} className="text-gold" />
                                <span>{chip}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
