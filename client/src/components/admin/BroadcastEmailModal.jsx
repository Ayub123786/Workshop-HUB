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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#121218] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-sm">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-base font-display uppercase tracking-wider text-white">Email Registrants</h3>
                <p className="text-[11px] font-mono text-[#8A8A85] truncate max-w-xs">{workshop.title}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-full text-[#8A8A85] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {result ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-base font-display uppercase tracking-wider text-white">Broadcast Sent</h4>
                <p className="text-xs text-[#8A8A85] mt-1 font-sans">{result.message}</p>
              </div>
              <button onClick={handleReset} className="btn-primary text-xs py-2 px-6 font-mono uppercase tracking-wider font-bold">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Recipient Target */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1.5">
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
                      className={`text-xs py-1.5 px-2 rounded-xl border font-mono uppercase tracking-wider transition-all ${
                        recipientFilter === opt.id
                          ? 'bg-gold text-black border-gold font-bold shadow-md shadow-gold/20'
                          : 'bg-white/5 text-[#8A8A85] border-white/10 hover:border-gold hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`e.g. Important updates for ${workshop.title}`}
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-gold bg-[#161622]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your update or session link here..."
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-gold bg-[#161622] leading-relaxed resize-none"
                />
                <p className="text-[10px] text-[#8A8A85] mt-1 font-mono">
                  Line breaks will be converted automatically to paragraphs.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono uppercase tracking-wider text-[#8A8A85] hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 font-mono uppercase tracking-wider font-bold shadow-md shadow-gold/20"
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
