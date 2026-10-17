import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Calendar,
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
} from 'lucide-react';
import api from '../../lib/api';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function CommandPalette({ isOpen, onClose, workshops: initialWorkshops = [] }) {
  const [query, setQuery] = useState('');
  const [workshops, setWorkshops] = useState(Array.isArray(initialWorkshops) ? initialWorkshops : []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load workshops if not provided
  useEffect(() => {
    if (Array.isArray(initialWorkshops) && initialWorkshops.length > 0) {
      setWorkshops(initialWorkshops);
      return;
    }
    if (isOpen) {
      api.get('/workshops?limit=50')
        .then((res) => {
          const list = res.data?.workshops || res.data?.data || (Array.isArray(res.data) ? res.data : []);
          setWorkshops(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          setWorkshops([]);
        });
    }
  }, [isOpen, initialWorkshops]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const safeWorkshops = Array.isArray(workshops) ? workshops : [];

  // Filtered results
  const filtered = query.trim()
    ? safeWorkshops.filter((w) => {
        const q = query.toLowerCase();
        return (
          w.title?.toLowerCase().includes(q) ||
          w.shortDescription?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q) ||
          (Array.isArray(w.tags) && w.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }).slice(0, 8)
    : safeWorkshops.slice(0, 4);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (w) => {
    onClose();
    navigate(`/w/${w.slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 sm:pt-28 px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-[#111116] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
              <Search size={18} className="text-gold shrink-0 animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search master classes, topics, PE / VC..."
                className="w-full bg-transparent text-sm font-sans text-white placeholder:text-white/40 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-white/50 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full">
                ESC
              </kbd>
            </div>

            {/* Results Section */}
            <div className="overflow-y-auto p-3 divide-y divide-white/[0.06]">
              {filtered.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center justify-between">
                    <span>{query.trim() ? `Search Results (${filtered.length})` : 'Featured Cohorts'}</span>
                    {!query.trim() && (
                      <span className="flex items-center gap-1 text-gold font-mono text-[10px]">
                        <Sparkles size={10} />
                        <span>VERIFIED ✦ LIVE</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {filtered.map((w, index) => {
                      const isSelected = index === selectedIndex;
                      const status = getWorkshopStatus(w);
                      const badge = getStatusBadgeConfig(status);

                      return (
                        <div
                          key={w._id || w.id || w.slug}
                          onClick={() => handleSelect(w)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-white/[0.08] border border-gold/40 shadow-[0_0_20px_rgba(201,162,77,0.15)]'
                              : 'hover:bg-white/[0.04] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {w.bannerImage ? (
                              <img
                                src={w.bannerImage}
                                alt={w.title}
                                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                                <BookOpen size={18} className="text-gold" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono uppercase font-bold text-gold tracking-wider truncate">
                                  {w.category || 'Executive Lab'}
                                </span>
                                <span className="sticker sticker-gold text-[9px] py-0.2 px-2">
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-white tracking-tight truncate">
                                {w.title}
                              </p>
                              {w.startDate && (
                                <p className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5 font-mono">
                                  <Calendar size={11} className="text-gold/70" />
                                  <span>{new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-white/50">
                            <span className="text-[11px] font-mono hidden sm:inline">VIEW</span>
                            <ChevronRight size={14} className={isSelected ? 'text-gold' : 'text-white/30'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <Search size={28} className="text-white/20 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">No master classes found</p>
                  <p className="text-[11px] text-white/40 mt-1 font-mono">
                    Try searching "Due Diligence", "LBO", or "Venture Capital".
                  </p>
                </div>
              )}

              {/* Quick Navigation Shortcuts */}
              {!query.trim() && (
                <div className="pt-3 mt-2 px-2">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2 font-bold">
                    Quick Jump
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/workshops?view=calendar');
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-left text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/10"
                    >
                      <Calendar size={14} className="text-gold" />
                      <span>Calendar Matrix</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/workshops?view=timeline');
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-left text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/10"
                    >
                      <Layers size={14} className="text-gold" />
                      <span>Timeline View</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Footer */}
            <div className="bg-black/60 border-t border-white/10 px-5 py-2.5 flex items-center justify-between text-[11px] text-white/40 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-[10px] text-white/70">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-[10px] text-white/70">↵</kbd>
                  <span>open</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-[10px] text-white/70">esc</kbd>
                  <span>close</span>
                </span>
              </div>
              <span className="text-[10px] text-gold font-bold">WORKSHOP HUB OS</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
