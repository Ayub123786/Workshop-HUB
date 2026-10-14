import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

function FormField({ field, value, onChange, error }) {
  const common = {
    id: field.id,
    value: value || '',
    onChange: (e) => onChange(field.id, e.target.value),
    placeholder: field.placeholder,
    className: `input ${error ? 'border-red-400 focus:ring-red-100' : ''}`,
  };

  if (field.type === 'textarea') {
    return <textarea {...common} rows={4} className={`textarea ${error ? 'border-red-400' : ''}`} />;
  }

  if (field.type === 'dropdown') {
    return (
      <select {...common} className={`select ${error ? 'border-red-400' : ''}`}>
        <option value="">{field.placeholder || 'Select...'}</option>
        {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="flex flex-col gap-2">
        {field.options?.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-navy cursor-pointer">
            <input
              type="checkbox"
              checked={(value || []).includes(opt)}
              onChange={(e) => {
                const curr = value || [];
                onChange(field.id, e.target.checked ? [...curr, opt] : curr.filter(o => o !== opt));
              }}
              className="w-4 h-4 accent-gold"
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  const typeMap = { email: 'email', phone: 'tel', text: 'text' };
  return <input type={typeMap[field.type] || 'text'} {...common} />;
}

export default function RegisterModal({ isOpen, onClose, form, workshop }) {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (id, value) => {
    setData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  const validate = () => {
    const newErrors = {};
    form?.fields?.forEach(field => {
      if (field.required) {
        const val = data[field.id];
        if (!val || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && !val.length)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
      // Email format
      if (field.type === 'email' && data[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field.id])) {
          newErrors[field.id] = 'Enter a valid email address';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      await api.post(`/forms/${form._id}/submit`, { data, _honey: '' });
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSuccess(false);
      setData({});
      setErrors({});
      setServerError('');
      onClose();
    }
  };

  if (!form) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-card shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <div>
                  <h2 className="font-bold text-navy text-xl">{form.ctaLabel || 'Reserve Your Spot'}</h2>
                  <p className="text-sm text-muted mt-0.5">{workshop?.title}</p>
                </div>
                <button onClick={handleClose} className="btn-ghost p-2" disabled={submitting}>
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-navy mb-2">You're in! 🎉</h3>
                    <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto">
                      {form.successMessage || 'Your spot has been reserved. Check your email for confirmation details.'}
                    </p>
                    <button onClick={handleClose} className="btn-primary mt-6">
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Honeypot - hidden from real users */}
                    <input
                      type="text"
                      name="_honey"
                      value=""
                      onChange={() => {}}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="space-y-4">
                      {form.fields?.map((field) => (
                        <div key={field.id}>
                          <label htmlFor={field.id} className="label">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          <FormField
                            field={field}
                            value={data[field.id]}
                            onChange={handleChange}
                            error={errors[field.id]}
                          />
                          {errors[field.id] && (
                            <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
                          )}
                        </div>
                      ))}

                      {serverError && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <p className="text-red-600 text-sm">{serverError}</p>
                        </div>
                      )}

                      {/* Seats indicator */}
                      {workshop && (
                        <p className="text-xs text-muted text-center pt-2">
                          {Math.max(0, workshop.seatsTotal - workshop.seatsBooked)} spots remaining
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <><Loader2 size={18} className="animate-spin" /> Processing...</>
                        ) : (
                          <>{form.ctaLabel || 'Reserve Your Spot'} →</>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
