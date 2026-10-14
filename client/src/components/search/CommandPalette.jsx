import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function CommandPalette({ isOpen, onClose, workshops: initialWorkshops = [] }) {
  const [query, setQuery] = useState('');
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load workshops if not provided
  useEffect(() => {
    if (initialWorkshops.length > 0) {
      setWorkshops(initialWorkshops);
      return;
    }
    if (isOpen) {
      api.get('/workshops?status=published')
        .then((res) => {
          const list = res.data?.data || res.data || [];
          setWorkshops(list);
        })
        .catch(() => {});
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

  // Filtered results
  const filtered = query.trim()
    ? workshops.filter((w) => {
        const q = query.toLowerCase();
        return (
          w.title?.toLowerCase().includes(q) ||
          w.shortDescription?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q) ||
          (w.tags && w.tags.some((t) => t.toLowerCase().includes(q))) ||
          'ayub due diligence'.includes(q)
        );
      }).slice(0, 8)
    : workshops.slice(0, 4);

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

  const handleSelect = (workshop) => {
    onClose();
    navigate(`/w/${workshop.slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white border border-[#E8E8E8] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E8E8]">
              <Search size={18} className="text-gold shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search masterclasses, topics, or categories..."
                className="w-full bg-transparent text-sm text-navy placeholder:text-muted focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-muted hover:text-navy transition-colors text-xs"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-muted bg-[#F5F5F5] border border-[#E8E8E8] px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results Section */}
            <div className="overflow-y-auto p-2 divide-y divide-[#E8E8E8]/50">
              {filtered.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                    <span>{query.trim() ? `Search Results (${filtered.length})` : 'Featured & Upcoming Masterclasses'}</span>
                    {!query.trim() && (
                      <span className="flex items-center gap-1 text-gold">
                        <Sparkles size={10} />
                        <span>Recommended</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {filtered.map((w, index) => {
                      const isSelected = index === selectedIndex;
                      const status = getWorkshopStatus(w);
                      const badge = getStatusBadgeConfig(status);

                      return (
                        <div
                          key={w._id || w.id || w.slug}
                          onClick={() => handleSelect(w)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            isSelected ? 'bg-cream border border-[#E8E8E8]' : 'hover:bg-[#FAFAFA] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {w.bannerImage ? (
                              <img
                                src={w.bannerImage}
                                alt={w.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-cream border border-[#E8E8E8] flex items-center justify-center shrink-0">
                                <BookOpen size={16} className="text-gold" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] uppercase font-bold text-gold tracking-wider truncate">
                                  {w.category || 'Masterclass'}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${badge.className}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-navy truncate">
                                {w.title}
                              </p>
                              {w.startDate && (
                                <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5 font-mono">
                                  <Calendar size={10} />
                                  <span>{new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-muted">
                            <span className="text-[11px] font-medium hidden sm:inline">View Curriculum</span>
                            <ChevronRight size={14} className={isSelected ? 'text-gold' : 'text-muted'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <Search size={24} className="text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-navy">No masterclasses found</p>
                  <p className="text-[11px] text-muted mt-1">
                    Try searching for terms like "Due Diligence", "Family Office", or "LBO".
                  </p>
                </div>
              )}

              {/* Quick Navigation Shortcuts */}
              {!query.trim() && (
                <div className="pt-2 mt-2 px-2">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                    Quick Navigation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/workshops?view=calendar');
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg text-left text-navy hover:bg-cream transition-colors border border-[#E8E8E8]/60"
                    >
                      <Calendar size={13} className="text-gold" />
                      <span>Calendar View</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/workshops?view=timeline');
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg text-left text-navy hover:bg-cream transition-colors border border-[#E8E8E8]/60"
                    >
                      <Layers size={13} className="text-gold" />
                      <span>Timeline View</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Footer */}
            <div className="bg-[#FAFAFA] border-t border-[#E8E8E8] px-4 py-2 flex items-center justify-between text-[11px] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white border border-[#E8E8E8] px-1 rounded text-[10px]">↑</kbd>
                  <kbd className="font-mono bg-white border border-[#E8E8E8] px-1 rounded text-[10px]">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white border border-[#E8E8E8] px-1 rounded text-[10px]">↵</kbd>
                  <span>select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white border border-[#E8E8E8] px-1 rounded text-[10px]">esc</kbd>
                  <span>close</span>
                </span>
              </div>
              <span className="font-mono text-[10px] text-navy/70">Workshop Hub OS</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
