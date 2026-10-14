import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  User,
  Building,
} from 'lucide-react';
import api from '../../lib/api';
import AddToCalendarMenu from '../calendar/AddToCalendarMenu';
import { getWorkshopStatus } from '../../lib/workshopStatus';
import { formatInTimezone, getSavedTimezone } from '../../lib/calendarExport';

export default function RegistrationModal({ isOpen, onClose, workshop, form, onRegistered }) {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Confirm
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const timezone = getSavedTimezone();

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError(null);
      setSuccess(false);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !workshop) return null;

  const status = getWorkshopStatus(workshop);
  const isSoldOut = status === 'sold-out';

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Full name is required';
    if (!formData.email?.trim()) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid work email';
    }
    if (!formData.company?.trim()) errs.company = 'Company / Fund is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return;

    setLoading(true);
    setError(null);

    try {
      const formId = form?._id || workshop?.formId || workshop?._id;
      const res = await api.post(`/forms/${formId}/submit`, {
        workshopId: workshop?._id || workshop?.id,
        isWaitlist: isSoldOut,
        data: {
          ...formData,
          isWaitlist: isSoldOut,
          registeredAt: new Date().toISOString(),
        },
        _honey: honeypot,
        honeypot,
      });

      setSuccess(true);
      if (onRegistered) onRegistered(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/w/${workshop.slug}`;
    if (navigator.share) {
      navigator.share({ title: workshop.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const dateFormatted = workshop.startDate
    ? formatInTimezone(workshop.startDate, timezone, 'full')
    : 'Date TBA';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl shadow-card-hover border border-[#E8E8E8] w-full max-w-lg overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-[#FAF9F6] p-5 sm:p-6 border-b border-[#E8E8E8] relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-navy hover:bg-white transition-colors"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">
              {isSoldOut ? 'VERIFIED WAITLIST' : 'EXECUTIVE REGISTRATION'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-navy leading-snug pr-6">
              {workshop.title}
            </h3>

            {workshop.startDate && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                <Calendar size={12} className="text-navy/70 shrink-0" />
                <span className="truncate">{dateFormatted}</span>
              </div>
            )}

            {/* Multi-step progress indicator (Only when not finished) */}
            {!success && (
              <div className="mt-4 pt-3 border-t border-[#E8E8E8] flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step >= 1 ? 'bg-gold' : 'bg-[#E8E8E8]'
                    }`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step >= 2 ? 'bg-gold' : 'bg-[#E8E8E8]'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-mono text-muted">
                  Step {step} of 2: {step === 1 ? 'Details' : 'Confirm'}
                </span>
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {success ? (
              /* Success Screen (Confetti-free calm checkmark) */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-navy mb-1">
                    {isSoldOut ? "You're on the Waitlist!" : 'Seat Reserved Successfully'}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-md mx-auto">
                    {isSoldOut
                      ? `We have recorded your details. If an opening becomes available, we will notify ${formData.email} immediately in priority order.`
                      : `A confirmation receipt and calendar invitation have been sent to ${formData.email}.`}
                  </p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-4 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted border-b border-[#E8E8E8] pb-2">
                    <span>Attendee:</span>
                    <strong className="text-navy">{formData.name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted border-b border-[#E8E8E8] pb-2">
                    <span>Firm:</span>
                    <strong className="text-navy">{formData.company}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>Format:</span>
                    <strong className="text-navy">Live Interactive Stream & Lab</strong>
                  </div>
                </div>

                {/* Actions: Add to Calendar & Share */}
                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  {!isSoldOut && <AddToCalendarMenu workshop={workshop} />}

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream transition-colors"
                  >
                    {copiedShare ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span>Share Master Class</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="btn-primary text-xs py-1.5 px-5 font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : step === 1 ? (
              /* Step 1: Details */
              <form onSubmit={handleNext} className="space-y-4">
                {isSoldOut && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <strong>Capacity Reached:</strong> This cohort has reached maximum seats. You are submitting for the verified waitlist.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                    }}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm text-navy focus:outline-none focus:border-gold ${
                      fieldErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[10px] text-red-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    placeholder="sarah@firm.com"
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm text-navy focus:outline-none focus:border-gold ${
                      fieldErrors.email ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                      Company / Fund *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => {
                        setFormData({ ...formData, company: e.target.value });
                        if (fieldErrors.company) setFieldErrors({ ...fieldErrors, company: null });
                      }}
                      placeholder="e.g. Blackstone"
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm text-navy focus:outline-none focus:border-gold ${
                        fieldErrors.company ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                    />
                    {fieldErrors.company && (
                      <p className="text-[10px] text-red-600 mt-1">{fieldErrors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Partner, Principal"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs sm:text-sm text-navy focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Honeypot */}
                <input
                  type="text"
                  name="user_note"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex="-1"
                  autoComplete="off"
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                  >
                    <span>Continue to Confirmation</span>
                    <ArrowRight size={14} />
                  </button>
                  <p className="text-[10px] text-muted text-center mt-2">
                    Step 1 of 2 · No credit card required
                  </p>
                </div>
              </form>
            ) : (
              /* Step 2: Confirm */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between text-muted pb-1.5 border-b border-[#E8E8E8]">
                    <span>Attendee:</span>
                    <strong className="text-navy">{formData.name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted pb-1.5 border-b border-[#E8E8E8]">
                    <span>Email:</span>
                    <strong className="text-navy">{formData.email}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted pb-1.5 border-b border-[#E8E8E8]">
                    <span>Organization:</span>
                    <strong className="text-navy">{formData.company}</strong>
                  </div>
                  {formData.role && (
                    <div className="flex items-center justify-between text-muted pb-1.5 border-b border-[#E8E8E8]">
                      <span>Role:</span>
                      <strong className="text-navy">{formData.role}</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted pt-1">
                    <span>Session:</span>
                    <strong className="text-gold font-mono">{dateFormatted}</strong>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-2.5 text-xs sm:text-sm font-semibold justify-center flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Confirming Seat...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>{isSoldOut ? 'Confirm Waitlist Spot' : 'Confirm Registration'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
