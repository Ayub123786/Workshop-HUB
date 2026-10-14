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
  ListFilter,
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
  'Private Equity': { dot: 'bg-[#C8A24F]', text: 'text-[#C8A24F]', pill: 'bg-[#C8A24F]/10 text-navy border-[#C8A24F]/30' },
  'Venture Capital': { dot: 'bg-blue-600', text: 'text-blue-600', pill: 'bg-blue-50 text-blue-800 border-blue-200' },
  'Family Office': { dot: 'bg-emerald-600', text: 'text-emerald-600', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  'Investment Banking': { dot: 'bg-purple-600', text: 'text-purple-600', pill: 'bg-purple-50 text-purple-800 border-purple-200' },
  'AI & FinTech': { dot: 'bg-pink-600', text: 'text-pink-600', pill: 'bg-pink-50 text-pink-800 border-pink-200' },
};

function getCatStyle(category) {
  return CATEGORY_COLORS[category] || { dot: 'bg-gold', text: 'text-gold', pill: 'bg-cream text-navy border-border' };
}

export default function WorkshopCalendar({ workshops = [], onQuickView }) {
  // Current month cursor
  const [currentDate, setCurrentDate] = useState(() => {
    // Pick the first upcoming workshop's month if available
    const firstUpcoming = workshops.find((w) => w.startDate && new Date(w.startDate) >= new Date());
    return firstUpcoming ? new Date(firstUpcoming.startDate) : new Date();
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTimezone, setCurrentTimezone] = useState(getSavedTimezone);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Handle timezone change
  const handleTimezoneChange = (e) => {
    const tz = e.target.value;
    setCurrentTimezone(tz);
    setSavedTimezone(tz);
  };

  // Filter workshops by category
  const filteredWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      if (!w.startDate) return false;
      if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;
      return true;
    });
  }, [workshops, selectedCategory]);

  // Calendar dates computation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Check if a workshop spans or occurs on a specific day
  const getWorkshopsForDay = (day) => {
    const target = startOfDay(day).getTime();
    return filteredWorkshops.filter((w) => {
      if (!w.startDate) return false;
      const start = startOfDay(new Date(w.startDate)).getTime();
      const end = w.endDate ? startOfDay(new Date(w.endDate)).getTime() : start;
      return target >= start && target <= end;
    });
  };

  // Selected date workshops
  const selectedDayWorkshops = selectedDate ? getWorkshopsForDay(selectedDate) : [];

  // All upcoming workshops sorted for agenda view
  const agendaWorkshops = useMemo(() => {
    return [...filteredWorkshops].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [filteredWorkshops]);

  const icalFeedUrl = `${window.location.origin}/api/calendar.ics`;

  const copyIcalUrl = () => {
    navigator.clipboard.writeText(icalFeedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl shadow-card overflow-hidden">
      {/* ─── Top Control Bar ─── */}
      <div className="p-4 sm:p-6 border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
        {/* Month Navigation & Title */}
        <div className="flex items-center gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-navy min-w-[170px]">
            {format(currentDate, 'MMMM yyyy')}
          </h3>

          <div className="flex items-center gap-1 bg-white border border-[#E8E8E8] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-cream transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(new Date());
              }}
              className="px-2.5 py-1 text-xs font-semibold text-navy hover:bg-cream rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-cream transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Toggle, Timezone & Subscribe actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Zone Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E8E8E8] rounded-xl px-2.5 py-1.5 text-xs text-navy shadow-2xs">
            <Globe size={13} className="text-gold shrink-0" />
            <select
              value={currentTimezone}
              onChange={handleTimezoneChange}
              className="bg-transparent border-none text-xs font-medium text-navy focus:outline-none cursor-pointer pr-1"
            >
              {TIMEZONE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.tz}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: Month / Agenda */}
          <div className="flex bg-white border border-[#E8E8E8] rounded-xl p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'month' ? 'bg-navy text-white shadow-2xs' : 'text-muted hover:text-navy'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'agenda' ? 'bg-navy text-white shadow-2xs' : 'text-muted hover:text-navy'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Subscribe to Calendar */}
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/40 bg-gold/10 text-xs font-semibold text-navy hover:bg-gold hover:text-white transition-all shadow-2xs"
          >
            <CalendarIcon size={13} className="text-gold group-hover:text-white" />
            <span>Subscribe Feed</span>
          </button>
        </div>
      </div>

      {/* ─── Category Filter Legend ─── */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-[#E8E8E8] flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs bg-white">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider mr-1 shrink-0">
          Filter:
        </span>
        {['All', 'Private Equity', 'Venture Capital', 'Family Office', 'AI & FinTech'].map((cat) => {
          const isSelected = selectedCategory === cat;
          const style = getCatStyle(cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs ${
                isSelected
                  ? 'border-navy bg-navy text-white font-semibold'
                  : 'border-[#E8E8E8] bg-white text-muted hover:text-navy hover:bg-cream'
              }`}
            >
              {cat !== 'All' && <span className={`w-2 h-2 rounded-full ${style.dot}`} />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Main Calendar Body (Split with Side Panel if date clicked) ─── */}
      <div className="flex flex-col lg:flex-row min-h-[500px] relative">
        {/* Month Grid View */}
        {viewMode === 'month' ? (
          <div className="flex-1 p-3 sm:p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-[11px] font-bold text-muted uppercase tracking-wider py-1">
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
                    className={`min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      !isCurrentMonth
                        ? 'bg-gray-50/50 border-transparent text-gray-300 opacity-60'
                        : isPast
                        ? 'bg-[#FAF9F6]/60 border-[#E8E8E8]/70 text-muted'
                        : 'bg-white border-[#E8E8E8] text-navy hover:border-gold hover:shadow-2xs'
                    } ${
                      isSelected ? 'ring-2 ring-gold border-gold bg-gold/5 font-bold shadow-xs' : ''
                    } ${isCurrentDay && !isSelected ? 'border-navy font-bold ring-1 ring-navy/20' : ''}`}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isCurrentDay ? 'bg-navy text-white' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {hasEvents && (
                        <span className="hidden sm:inline-block text-[10px] font-mono text-gold font-bold">
                          {dayWorkshops.length} {dayWorkshops.length === 1 ? 'event' : 'events'}
                        </span>
                      )}
                    </div>

                    {/* Event indicators: dots or compact chips */}
                    <div className="space-y-1 mt-1">
                      {dayWorkshops.slice(0, 2).map((w) => {
                        const style = getCatStyle(w.category);
                        return (
                          <div
                            key={w._id || w.id}
                            className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate border ${style.pill}`}
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
                        <span className="hidden sm:block text-[9px] text-muted font-semibold pl-1">
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
          /* Agenda View (List of upcoming dates) */
          <div className="flex-1 p-4 sm:p-6 divide-y divide-[#E8E8E8]">
            {agendaWorkshops.length === 0 ? (
              <div className="py-16 text-center text-muted text-sm">
                No sessions found for the selected category.
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.pill}`}>
                          {w.category}
                        </span>
                      </div>
                      <Link to={`/w/${w.slug}`}>
                        <h4 className="font-bold text-navy text-sm sm:text-base hover:text-gold transition-colors">
                          {w.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-navy/70" />
                        <span>{timeFormatted}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <AddToCalendarMenu workshop={w} />
                      <Link
                        to={`/w/${w.slug}`}
                        className="btn-primary text-xs py-1.5 px-3 font-semibold"
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

        {/* ─── Selected Day Side Panel (Desktop) / Bottom Sheet (Mobile) ─── */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#E8E8E8] bg-[#FAF9F6] p-5 flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8] mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider block font-mono">
                      SELECTED DATE
                    </span>
                    <h4 className="font-bold text-navy text-base">
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {selectedDayWorkshops.length === 0 ? (
                  <div className="py-12 text-center text-muted">
                    <CalendarIcon size={28} className="mx-auto mb-2 opacity-40 text-navy" />
                    <p className="text-xs font-semibold text-navy">No sessions on this date</p>
                    <p className="text-[11px] text-muted mt-1">
                      Pick another highlighted day or switch to Agenda view.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayWorkshops.map((w) => {
                      const status = getWorkshopStatus(w);
                      const badge = getStatusBadgeConfig(status);
                      const timeStr = formatInTimezone(w.startDate, currentTimezone, 'time-only');
                      const seatsLeft = Math.max(0, (w.seatsTotal || 100) - (w.seatsBooked || 0));

                      return (
                        <div
                          key={w._id || w.id}
                          className="bg-white border border-[#E8E8E8] rounded-xl p-4 shadow-2xs hover:border-gold/60 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-mono font-semibold text-gold">
                              {timeStr}
                            </span>
                          </div>

                          <Link to={`/w/${w.slug}`}>
                            <h5 className="font-bold text-navy text-sm hover:text-gold transition-colors leading-snug mb-1">
                              {w.title}
                            </h5>
                          </Link>

                          <div className="text-[11px] text-muted flex items-center justify-between py-2 border-y border-[#E8E8E8]/70 my-2">
                            <span>Speaker: <strong>Ayub</strong></span>
                            <span>{seatsLeft} seats left</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              to={`/w/${w.slug}`}
                              className="flex-1 btn-primary text-xs py-1.5 px-3 text-center justify-center font-semibold"
                            >
                              Reserve
                            </Link>
                            <AddToCalendarMenu workshop={w} />
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

      {/* ─── Subscribe Feed Modal ─── */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 max-w-md w-full shadow-card-hover relative">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:text-navy"
            >
              <X size={18} />
            </button>

            <span className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-3">
              <CalendarIcon size={20} />
            </span>
            <h3 className="text-base font-bold text-navy mb-1">
              Subscribe to Master Class Calendar
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Subscribe directly in Apple Calendar, Google Calendar, or Microsoft Outlook. New sessions sync automatically.
            </p>

            <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-3 flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-mono text-navy truncate select-all">
                {icalFeedUrl}
              </span>
              <button
                onClick={copyIcalUrl}
                className="shrink-0 p-1.5 rounded-lg border border-[#E8E8E8] bg-white text-navy hover:bg-cream transition-colors"
                title="Copy Calendar URL"
              >
                {copiedFeed ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <a
                href={icalFeedUrl}
                className="btn-primary text-xs py-2 px-4 font-semibold"
                download="workshop-hub.ics"
              >
                Download .ics File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
