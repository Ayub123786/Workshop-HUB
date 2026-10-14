import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { FadeUp } from '../motion/index.jsx';

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
    <section className="bg-[#FAF9F6] py-16 sm:py-20 border-b border-[#E8E8E8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <span className="w-10 h-10 rounded-full bg-gold/15 text-gold mx-auto flex items-center justify-center mb-4">
              <Mail size={18} />
            </span>
            <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1">
              STAY AHEAD IN THE STACK
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy tracking-tight mb-2">
              Get Notified of New Master Classes
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Join 1,400+ PE sponsors, venture capitalists, and family office heads receiving notification of newly scheduled cohorts and deal diligence labs.
            </p>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 max-w-md mx-auto flex items-center justify-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>You're subscribed! We will notify you when new sessions open.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="name@firm.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-xs sm:text-sm text-navy placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs sm:text-sm py-2.5 px-5 font-semibold shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <span>Get Notified</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-[11px] text-red-600 text-left pl-1">{error}</p>
                )}
                <p className="text-[10px] text-muted text-center pt-1">
                  Zero spam. Unsubscribe anytime with 1 click.
                </p>
              </form>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
