import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
  isBefore,
  startOfDay,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCalendarMenu from './AddToCalendarMenu';
import {
  TIMEZONE_OPTIONS,
  getSavedTimezone,
  setSavedTimezone,
  formatInTimezone,
} from '../../lib/calendarExport';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

const CATEGORY_COLORS = {
  'Private Equity': { dot: 'bg-gold', text: 'text-gold', pill: 'bg-gold/10 text-gold border-gold/30' },
  'Venture Capital': { dot: 'bg-blue-400', text: 'text-blue-400', pill: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  'Family Office': { dot: 'bg-emerald-400', text: 'text-emerald-400', pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  'Investment Banking': { dot: 'bg-purple-400', text: 'text-purple-400', pill: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  'AI & FinTech': { dot: 'bg-pink-400', text: 'text-pink-400', pill: 'bg-pink-500/10 text-pink-300 border-pink-500/30' },
};

function getCatStyle(category) {
  return CATEGORY_COLORS[category] || { dot: 'bg-gold', text: 'text-gold', pill: 'bg-white/[0.05] text-white/80 border-white/10' };
}

export default function WorkshopCalendar({ workshops = [], onQuickView }) {
  // Current month cursor
  const [currentDate, setCurrentDate] = useState(() => {
    const firstUpcoming = workshops.find((w) => w.startDate && new Date(w.startDate) >= new Date());
    return firstUpcoming ? new Date(firstUpcoming.startDate) : new Date();
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTimezone, setCurrentTimezone] = useState(getSavedTimezone);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    if (workshops.length > 0) {
      const firstUpcoming = workshops.find((w) => w.startDate && new Date(w.startDate) >= new Date());
      if (firstUpcoming) {
        setCurrentDate(new Date(firstUpcoming.startDate));
      } else if (workshops[0]?.startDate) {
        setCurrentDate(new Date(workshops[0].startDate));
      }
    }
  }, [workshops]);

  const handleTimezoneChange = (e) => {
    const tz = e.target.value;
    setCurrentTimezone(tz);
    setSavedTimezone(tz);
  };

  const availableCategories = useMemo(() => {
    const set = new Set();
    workshops.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return ['All', ...Array.from(set)];
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    if (selectedCategory === 'All') return workshops;
    return workshops.filter((w) => w.category === selectedCategory);
  }, [workshops, selectedCategory]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getWorkshopsForDay = (day) => {
    return filteredWorkshops.filter((w) => {
      if (!w.startDate) return false;
      return isSameDay(new Date(w.startDate), day);
    });
  };

  const selectedDayWorkshops = useMemo(() => {
    if (!selectedDate) return [];
    return getWorkshopsForDay(selectedDate);
  }, [selectedDate, filteredWorkshops]);

  const agendaWorkshops = useMemo(() => {
    return [...filteredWorkshops].sort(
      (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0)
    );
  }, [filteredWorkshops]);

  const icalFeedUrl = `${window.location.origin}/api/calendar.ics`;

  const copyIcalUrl = () => {
    navigator.clipboard.writeText(icalFeedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  return (
    <div className="glass-strong bg-[#111115] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* ─── Top Control Bar ─── */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141418]">
        {/* Month Navigation & Title */}
        <div className="flex items-center gap-3">
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white min-w-[190px]">
            {format(currentDate, 'MMMM yyyy')}
          </h3>

          <div className="flex items-center gap-1 bg-[#18181e] border border-white/10 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(new Date());
              }}
              className="px-3 py-1 text-xs font-mono font-bold text-white/70 hover:text-gold rounded-full transition-colors cursor-pointer"
            >
              TODAY
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Toggle, Timezone & Subscribe actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Zone Selector */}
          <div className="flex items-center gap-1.5 bg-[#18181e] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white shadow-sm">
            <Globe size={13} className="text-gold shrink-0" />
            <select
              value={currentTimezone}
              onChange={handleTimezoneChange}
              className="bg-transparent border-none text-xs font-mono text-white/80 focus:outline-none cursor-pointer pr-1"
            >
              {TIMEZONE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.tz} className="bg-[#18181e] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: Month / Agenda */}
          <div className="flex bg-[#18181e] border border-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-gold text-black shadow-md' : 'text-white/40 hover:text-white'
              }`}
            >
              MONTH
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda' ? 'bg-gold text-black shadow-md' : 'text-white/40 hover:text-white'
              }`}
            >
              AGENDA
            </button>
          </div>

          {/* Subscribe to Calendar */}
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-xs font-mono font-bold text-gold hover:bg-gold hover:text-black transition-all cursor-pointer"
          >
            <CalendarIcon size={13} />
            <span>SUBSCRIBE</span>
          </button>
        </div>
      </div>

      {/* ─── Category Filter Legend ─── */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs bg-[#111115]">
        <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mr-1 shrink-0">
          FILTER:
        </span>
        {availableCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const style = getCatStyle(cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-xs font-mono cursor-pointer ${
                isSelected
                  ? 'border-gold bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat !== 'All' && <span className={`w-2 h-2 rounded-full ${style.dot}`} />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Main Calendar Body ─── */}
      <div className="flex flex-col lg:flex-row min-h-[500px] relative">
        {/* Month Grid View */}
        {viewMode === 'month' ? (
          <div className="flex-1 p-3 sm:p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day) => {
                const dayWorkshops = getWorkshopsForDay(day);
                const hasEvents = dayWorkshops.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[72px] sm:min-h-[96px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      !isCurrentMonth
                        ? 'bg-transparent border-transparent text-white/10 opacity-30'
                        : isPast
                        ? 'bg-white/[0.02] border-white/[0.05] text-white/40'
                        : 'bg-[#15151a] border-white/10 text-white hover:border-gold/50'
                    } ${
                      isSelected ? 'ring-2 ring-gold border-gold bg-gold/15 font-bold shadow-lg shadow-gold/20' : ''
                    } ${isCurrentDay && !isSelected ? 'border-violet font-bold ring-1 ring-violet/40' : ''}`}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono ${
                          isCurrentDay
                            ? 'w-5 h-5 rounded-full bg-gold text-black font-bold flex items-center justify-center'
                            : isSelected
                            ? 'text-gold font-bold'
                            : 'text-white/80'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      {hasEvents && (
                        <span className="hidden sm:inline-block text-[9px] font-mono text-gold px-1.5 py-0.2 rounded bg-gold/15 border border-gold/30">
                          {dayWorkshops.length}
                        </span>
                      )}
                    </div>

                    {/* Event indicators */}
                    <div className="space-y-1 mt-1">
                      {dayWorkshops.slice(0, 2).map((w) => {
                        const style = getCatStyle(w.category);
                        return (
                          <div
                            key={w._id || w.id}
                            onClick={(e) => {
                              if (onQuickView) {
                                e.stopPropagation();
                                onQuickView(w);
                              }
                            }}
                            className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] truncate border ${style.pill} ${
                              onQuickView ? 'hover:opacity-80 cursor-pointer' : ''
                            }`}
                            title={w.title}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                            <span className="truncate font-medium">{w.title}</span>
                          </div>
                        );
                      })}

                      {/* Mobile view dots */}
                      <div className="flex sm:hidden items-center gap-1 justify-center">
                        {dayWorkshops.map((w, idx) => {
                          const style = getCatStyle(w.category);
                          return (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                            />
                          );
                        })}
                      </div>

                      {dayWorkshops.length > 2 && (
                        <span className="hidden sm:block text-[9px] font-mono text-white/40 pl-1">
                          +{dayWorkshops.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Agenda View */
          <div className="flex-1 p-4 sm:p-6 divide-y divide-white/10">
            {agendaWorkshops.length === 0 ? (
              <div className="py-16 text-center text-white/40 font-mono text-sm">
                NO SESSIONS FOUND FOR SELECTED FILTER.
              </div>
            ) : (
              agendaWorkshops.map((w) => {
                const status = getWorkshopStatus(w);
                const badge = getStatusBadgeConfig(status);
                const style = getCatStyle(w.category);
                const timeFormatted = formatInTimezone(w.startDate, currentTimezone, 'full');

                return (
                  <div key={w._id || w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${style.pill}`}>
                          {w.category}
                        </span>
                      </div>
                      <Link to={`/w/${w.slug}`}>
                        <h4 className="font-bold text-white text-base hover:text-gold transition-colors">
                          {w.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-white/40 font-mono flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-gold" />
                        <span>{timeFormatted}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onQuickView && (
                        <button
                          onClick={() => onQuickView(w)}
                          className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          Quick View
                        </button>
                      )}
                      <AddToCalendarMenu workshop={w} />
                      <Link
                        to={`/w/${w.slug}`}
                        className="bg-gold hover:bg-gold-light text-black text-xs font-bold py-1.5 px-4 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-md shadow-gold/20"
                      >
                        Reserve
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Selected Day Side Panel ─── */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#141418] p-5 flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider block">
                      SELECTED DATE
                    </span>
                    <h4 className="font-bold text-white text-base">
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {selectedDayWorkshops.length === 0 ? (
                  <div className="py-12 text-center text-white/40">
                    <CalendarIcon size={28} className="mx-auto mb-2 opacity-30 text-gold" />
                    <p className="text-xs font-mono font-semibold text-white/70">NO SESSIONS SCHEDULED</p>
                    <p className="text-[11px] text-white/40 mt-1">
                      Pick another highlighted day or switch to Agenda view.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayWorkshops.map((w) => {
                      const status = getWorkshopStatus(w);
                      const badge = getStatusBadgeConfig(status);
                      const style = getCatStyle(w.category);

                      return (
                        <div
                          key={w._id || w.id}
                          className="p-3.5 rounded-2xl bg-[#18181f] border border-white/10 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${style.pill}`}>
                              {w.category}
                            </span>
                          </div>

                          <h5 className="font-bold text-white text-sm">
                            {w.title}
                          </h5>

                          <div className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                            <Clock size={11} className="text-gold" />
                            <span>{formatInTimezone(w.startDate, currentTimezone, 'time')}</span>
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                            <Link
                              to={`/w/${w.slug}`}
                              className="text-xs text-gold hover:underline font-mono inline-flex items-center gap-1"
                            >
                              <span>View Brief</span>
                              <ExternalLink size={11} />
                            </Link>

                            <Link
                              to={`/w/${w.slug}`}
                              className="bg-gold hover:bg-gold-light text-black text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                            >
                              Reserve
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Subscribe Modal ─── */}
      <AnimatePresence>
        {showSubscribeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowSubscribeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141418] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <CalendarIcon size={16} />
                  </div>
                  <h4 className="font-bold text-white text-base">Subscribe to Calendar Feed</h4>
                </div>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-white/60">
                Sync live master classes automatically with Apple Calendar, Google Calendar, or Microsoft Outlook.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-white/40 block">iCal / WebCal URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={icalFeedUrl}
                    className="flex-1 bg-[#18181e] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white/80 select-all focus:outline-none"
                  />
                  <button
                    onClick={copyIcalUrl}
                    className="bg-gold text-black text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-gold-light transition-all cursor-pointer"
                  >
                    {copiedFeed ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedFeed ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="text-xs text-white/50 hover:text-white font-mono"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
