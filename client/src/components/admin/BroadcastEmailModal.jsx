import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, CheckCircle2, AlertCircle, Loader2, Users } from 'lucide-react';
import api from '../../lib/api';

export default function BroadcastEmailModal({ isOpen, onClose, workshop }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('confirmed');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen || !workshop) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both subject and message content.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await api.post(`/workshops/${workshop._id || workshop.id}/broadcast`, {
        subject: subject.trim(),
        message: message.trim(),
        recipientFilter,
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="fixed inset-0 bg-navy/50 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-[#FAFAFA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cream border border-border flex items-center justify-center text-gold">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy">Email Registrants</h3>
                <p className="text-[11px] text-muted truncate max-w-xs">{workshop.title}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1 rounded-lg text-muted hover:text-navy hover:bg-cream"
            >
              <X size={16} />
            </button>
          </div>

          {result ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-navy">Broadcast Sent</h4>
                <p className="text-xs text-muted mt-1">{result.message}</p>
              </div>
              <button onClick={handleReset} className="btn-primary text-xs py-2 px-6">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Recipient Target */}
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  Recipients Target
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'confirmed', label: 'Confirmed Only' },
                    { id: 'waitlist', label: 'Waitlist Only' },
                    { id: 'all', label: 'All Registrants' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRecipientFilter(opt.id)}
                      className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-colors ${
                        recipientFilter === opt.id
                          ? 'bg-navy text-white border-navy font-bold shadow-2xs'
                          : 'bg-white text-muted border-border hover:border-gold hover:text-navy'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`e.g. Important updates for ${workshop.title}`}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-gold bg-[#FAFAFA]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your update or session link here..."
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-gold bg-[#FAFAFA] leading-relaxed"
                />
                <p className="text-[10px] text-muted mt-1">
                  Line breaks will be converted automatically to paragraphs. Sent with institutional styling.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-border text-xs text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 font-semibold"
                >
                  {sending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>{sending ? 'Sending...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
