import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Calendar, Clock, Loader2, Sparkles } from 'lucide-react';
import api from '../../lib/api';

export default function RegistrationModal({ isOpen, onClose, workshop, form, onRegistered }) {
  const [formData, setFormData] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const fields = form?.fields || [
    { id: 'name', type: 'text', label: 'Full Name', placeholder: 'e.g. Sarah Jenkins', required: true },
    { id: 'email', type: 'email', label: 'Work Email', placeholder: 'sarah@firm.com', required: true },
    { id: 'company', type: 'text', label: 'Company / Fund', placeholder: 'e.g. Apollo Global', required: true },
    { id: 'role', type: 'text', label: 'Current Role', placeholder: 'e.g. VP, Private Equity', required: false },
    { id: 'experience', type: 'dropdown', label: 'Years in Deal Execution', options: ['1-3 years', '4-7 years', '8+ years'], required: false },
  ];

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // bot detected

    // Basic validation
    for (const f of fields) {
      if (f.required && !formData[f.id]) {
        setError(`Please fill in "${f.label}"`);
        return;
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid work email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formId = form?._id || workshop?.formId || workshop?._id;
      const res = await api.post(`/forms/${formId}/submit`, {
        workshopId: workshop?._id,
        data: formData,
        _honey: honeypot,
        honeypot,
      });

      setSuccess(true);
      setSuccessData(res.data);
      if (onRegistered) onRegistered(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setFormData({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-cream-dark p-6 border-b border-border relative">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-muted hover:text-navy hover:bg-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="badge mb-2">LIVE MASTER CLASS</span>
            <h3 className="text-xl font-bold text-navy pr-8">
              {workshop?.title || 'Register for Workshop'}
            </h3>
            {workshop?.startDate && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  {new Date(workshop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  Live via Zoom
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-navy mb-2">You're Registered!</h4>
                <p className="text-muted text-sm max-w-md mx-auto leading-relaxed mb-6">
                  {form?.successMessage ||
                    `We have reserved your seat. A calendar invitation and confirmation details have been sent to ${formData.email || 'your email'}.`}
                </p>
                <div className="p-4 bg-cream rounded-xl border border-border text-left mb-6">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted mb-1">Confirmation Note</p>
                  <p className="text-sm text-navy">
                    Please prepare questions in advance. Session links will also be re-sent 2 hours before the start.
                  </p>
                </div>
                <button onClick={handleClose} className="btn-primary w-full justify-center">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex="-1"
                  autoComplete="off"
                />

                {fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                      {field.label} {field.required && <span className="text-gold">*</span>}
                    </label>

                    {field.type === 'dropdown' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="">Select an option...</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                      />
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.checked)}
                          required={field.required}
                          className="rounded border-border text-gold focus:ring-gold"
                        />
                        <span className="text-xs text-muted">{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-sm font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Securing Your Seat...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Confirm Registration
                      </span>
                    )}
                  </button>
                  <p className="text-[11px] text-muted text-center mt-2.5">
                    Guaranteed seat reservation · No credit card required
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
