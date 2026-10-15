import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import Reveal from '../animations/Reveal';
import MagneticButton from '../animations/MagneticButton';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/subscribers', {
        email: email.trim(),
        source: 'hub_newsletter',
      });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative bg-[#FAF9F6] py-20 sm:py-24 border-b border-[#E8E8E8] overflow-hidden">
      {/* ─── Floating Gold Shapes in Background ─── */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-[8%] w-16 h-16 rounded-2xl border border-gold/30 bg-gold/5 backdrop-blur-xs pointer-events-none hidden sm:block"
      />
      <motion.div
        animate={{ y: [0, 22, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-12 right-[10%] w-20 h-20 rounded-full border border-gold/25 bg-gold/5 backdrop-blur-xs pointer-events-none hidden sm:block"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] rounded-full bg-gold/10 blur-[100px] pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <Reveal>
          <div className="bg-white border border-[#E8E8E8] rounded-3xl p-8 sm:p-14 shadow-[0_8px_32px_rgba(201,162,77,0.08)] relative overflow-hidden">
            {/* Pill Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] text-[11px] font-mono font-bold text-navy uppercase tracking-widest mb-4 shadow-2xs">
              <Sparkles size={11} className="text-gold" />
              PRIORITY ALLOCATOR ACCESS
            </span>

            {/* Bold Headline */}
            <h2 className="text-2xl sm:text-4xl font-bold text-navy tracking-tight mb-2 uppercase">
              Stay Ahead in the Stack
            </h2>

            {/* Concise One-Line Subtitle */}
            <p className="text-muted text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Receive instant alerts when new cohort dates and deal toolkits open.
            </p>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold shadow-2xs"
              >
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>You're in. We'll notify you as soon as seats release.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="partner@fund.com"
                    required
                    className="flex-1 px-4 py-3 rounded-full border border-[#E8E8E8] bg-white text-xs sm:text-sm text-navy placeholder:text-muted focus:outline-none focus:border-gold transition-colors shadow-2xs"
                  />

                  <MagneticButton
                    as="button"
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs sm:text-sm py-3 px-7 font-bold rounded-full shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <span>Get Notified</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </MagneticButton>
                </div>

                {error && (
                  <p className="text-[11px] text-red-600 text-left pl-3">{error}</p>
                )}

                <p className="text-[10px] font-mono text-muted/70 text-center pt-1">
                  Private whitelist only · Zero spam · Unsubscribe anytime
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
