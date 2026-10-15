import { useState } from 'react';
import { ChevronDown, HelpCircle, Video, Layers, Receipt, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../animations/Reveal';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_ICONS = [Users, Video, Layers, Receipt, Clock, HelpCircle];

const FAQS = [
  {
    q: 'Who are these master classes designed for?',
    a: 'Engineered for private equity deal leads, VC partners, and financial analysts deploying AI into due diligence and memo generation.',
  },
  {
    q: 'Are the sessions live or pre-recorded?',
    a: 'Every workshop is 100% live and interactive with model stress-testing, real datasets, and real-time Q&A.',
  },
  {
    q: 'What models and toolkits do attendees receive?',
    a: 'You get full production prompt architectures, orchestration code blueprints, financial models, and lifetime cohort access.',
  },
  {
    q: 'Can my fund receive a corporate invoice?',
    a: 'Yes. Tax invoices and fund reimbursement receipts are generated immediately upon checkout.',
  },
  {
    q: 'What happens if I miss the live schedule?',
    a: 'All enrolled participants receive 4K recordings, key takeaways, and workbook files within 24 hours.',
  },
  {
    q: 'How does the sold-out cohort waitlist work?',
    a: 'Waitlist enrollment is free. If a registered seat becomes available, waitlisted members are offered priority access.',
  },
];

export default function PlatformFaqSection({ faqs: propFaqs }) {
  const { settings } = useSettings();
  const [openIndex, setOpenIndex] = useState(0);

  const displayFaqs = propFaqs || (settings?.faqs && settings.faqs.length > 0 ? settings.faqs : FAQS);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="bg-white py-16 sm:py-20 border-b border-[#E8E8E8] relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-10">
            <span className="inline-block text-[11px] font-mono font-bold text-gold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] shadow-2xs mb-2">
              FREQUENT INQUIRIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight uppercase">
              Frequently Asked Questions
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Key details regarding syllabus access, live sessions, and fund receipts.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const Icon = DEFAULT_ICONS[idx % DEFAULT_ICONS.length] || HelpCircle;

            return (
              <Reveal key={idx} delay={idx * 0.04}>
                <div
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-gold/60 shadow-[0_4px_16px_rgba(201,162,77,0.08)] bg-white'
                      : 'border-[#E8E8E8] bg-white hover:border-[#D0D0D0]'
                  }`}
                >
                  {/* Expanding Left Gold Accent Border */}
                  <motion.div
                    initial={false}
                    animate={{ scaleY: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gold origin-top z-10"
                  />

                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-3.5 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'bg-gold/15 text-gold' : 'bg-[#FAF9F6] text-muted'
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="font-bold text-navy text-xs sm:text-sm leading-snug">
                        {faq.q}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.24, ease: 'easeOut' }}
                      className="shrink-0"
                    >
                      <ChevronDown
                        size={15}
                        className={isOpen ? 'text-gold' : 'text-muted'}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-[#F0F0F0] bg-[#FAF9F6]/50 pl-14">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
