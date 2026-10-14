import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp } from '../motion/index.jsx';

const FAQS = [
  {
    q: 'Who are these workshops designed for?',
    a: 'Our master classes are engineered specifically for private equity partners, venture capital deal teams, family office investment directors, and financial analysts who want to deploy multi-model agentic systems into due diligence, memo synthesis, and deal sourcing.',
  },
  {
    q: 'Are the sessions live or pre-recorded?',
    a: 'Every master class is delivered live and interactive by Ayub. You work through live stress-tests, model orchestration architectures, and proprietary tool stacks with real-time Q&A.',
  },
  {
    q: 'What materials and templates do attendees receive?',
    a: 'Attendees receive production-ready agent prompt architectures, pipeline orchestration blueprints, sample valuation data sets, and lifetime access to our alumni community and session slide decks.',
  },
  {
    q: 'Can my firm get an invoice for corporate reimbursement?',
    a: 'Yes. Automated corporate receipts and tax invoices with your fund or firm name are generated immediately upon registration. Contact team@morsebridge.com for bulk team booking passes.',
  },
  {
    q: 'What if I am unable to attend the live scheduled time?',
    a: 'All registered attendees receive full on-demand video access, transcript summaries, and key takeaway packages within 24 hours of session completion.',
  },
  {
    q: 'How does the waitlist work for sold-out workshops?',
    a: 'When an executive cohort reaches maximum capacity, you can join the verified waitlist for free. If an attendee reschedules or a seat opens, waitlisted professionals are notified immediately in first-come order.',
  },
];

export default function PlatformFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="bg-white py-16 sm:py-20 border-b border-[#E8E8E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-2 max-w-lg mx-auto">
              Everything you need to know about our executive master classes, curriculum access, and platform policies.
            </p>
          </div>
        </FadeUp>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#E8E8E8] rounded-2xl overflow-hidden transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 bg-white hover:bg-cream/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-navy text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-[#E8E8E8]/60 bg-[#FAF9F6]">
                        {faq.a}
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
