import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, Check, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function QuickRescheduleModal({ isOpen, onClose, workshop, onUpdated }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('published');
  const [seatsTotal, setSeatsTotal] = useState(100);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workshop) {
      if (workshop.startDate) {
        // Convert ISO string to YYYY-MM-DDTHH:mm format for datetime-local
        const d = new Date(workshop.startDate);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setStartDate(formatted);
      } else {
        setStartDate('');
      }

      if (workshop.endDate) {
        const d = new Date(workshop.endDate);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setEndDate(formatted);
      } else {
        setEndDate('');
      }

      setStatus(workshop.status || 'draft');
      setSeatsTotal(workshop.seatsTotal || 100);
      setError(null);
    }
  }, [workshop]);

  if (!isOpen || !workshop) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        status,
        seatsTotal: Number(seatsTotal),
      };

      const res = await api.put(`/workshops/${workshop._id || workshop.id}`, payload);
      if (onUpdated) onUpdated(res.data.workshop);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#121218] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-sm">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-base font-display uppercase tracking-wider text-white">Reschedule Master Class</h3>
                <p className="text-[11px] font-mono text-[#8A8A85] truncate max-w-xs">{workshop.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8A8A85] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Start Date & Time */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold bg-[#161622]"
              />
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold bg-[#161622]"
              />
            </div>

            {/* Status & Capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold bg-[#161622] font-mono uppercase font-medium"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1">
                  Total Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={seatsTotal}
                  onChange={(e) => setSeatsTotal(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold bg-[#161622]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono uppercase tracking-wider text-[#8A8A85] hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 font-mono uppercase tracking-wider font-bold shadow-md shadow-gold/20"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{saving ? 'Updating...' : 'Update Schedule'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
